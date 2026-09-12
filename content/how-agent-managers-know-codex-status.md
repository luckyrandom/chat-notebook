---
title: How Agent Managers Know the Status of a Codex Conversation
description: A source-grounded model for deriving Codex activity, attention, run outcome, and delivery state from app-server events, hooks, process supervision, terminal observation, and repository facts.
---

**Reviewed:** September 12, 2026, America/Los_Angeles.  
**Source snapshots:** OpenAI Codex `c4017a87aacc7558002b7cb510025e967c1d765e`, Agent Orchestrator `15e9ea971f1711ec8b50e157d6eb300db6cbe0d6`, and Vibe Kanban `4deb7eca8f381f7cbc1f9d15515a9ab8f8009053`.

A board that says **Working**, **Needs you**, **Idle**, or **Failed** can look as though it understands the conversation. Usually it does something more mechanical and more reliable:

1. it controls or attaches to the agent runtime;
2. it receives structured events, hooks, process signals, or terminal observations;
3. it stores those observations as durable facts;
4. it reduces the facts into several user-facing status dimensions.

The manager should not ask an LLM to reread the transcript and guess what is happening. It should treat the runtime, repository, pull request, CI system, and human decisions as separate sources of evidence.

This is the implementation companion to [A Task-First Operating System for Coding Agents](task-first-agent-manager.md). The task-first design explains why a conversation should not be the durable unit of work. This note explains how a manager can observe a Codex conversation or run without confusing activity with completion.

## Key idea: status is a projection over evidence

```text
Codex app-server events ─┐
Codex hooks              ├─→ normalized observations ─→ durable facts ─→ status reducers
Process or PTY state     │                                      │
Terminal surface         │                                      ├─ activity
Git and filesystem       │                                      ├─ attention
PR, CI, and review       ┘                                      ├─ run outcome
                                                               └─ delivery state
```

There is no single authoritative `conversation_status` field that answers every useful question. A good manager keeps the underlying evidence and derives independent projections.

The smallest useful reducer looks more like this than a single enum:

```ts
type Observation = {
  process: "alive" | "dead" | "unknown";
  turn: "none" | "in_progress" | "completed" | "interrupted" | "failed";
  pendingInteraction: "none" | "approval" | "question" | "ambiguous";
  wasKilled: boolean;
  lastObservedAt: Date;
};

type Projection = {
  activity: "working" | "waiting" | "idle" | "stale" | "exited" | "unknown";
  attention: "none" | "needs_user";
  outcome: "unknown" | "succeeded" | "failed" | "cancelled";
};

function project(o: Observation, now: Date): Projection {
  const attention =
    o.pendingInteraction === "none" ? "none" : "needs_user";

  const fresh = now.getTime() - o.lastObservedAt.getTime() < 30_000;

  const activity =
    o.turn === "in_progress" ? "working" :
    attention === "needs_user" ? "waiting" :
    o.process === "alive" && fresh ? "idle" :
    o.process === "alive" ? "stale" :
    o.process === "dead" ? "exited" :
    "unknown";

  const outcome =
    o.process !== "dead" ? "unknown" :
    o.wasKilled ? "cancelled" :
    o.turn === "failed" ? "failed" :
    o.turn === "completed" ? "succeeded" :
    "unknown";

  return { activity, attention, outcome };
}
```

The exact timeout and states are product choices. The important technique is the separation:

- **activity** says what appears to be happening now;
- **attention** says whether a person must act;
- **outcome** says how the execution attempt ended;
- **delivery** must be derived separately from files, commits, pull requests, checks, reviews, deployments, and acceptance.

A successful run is not automatically a completed task.

## What “conversation status” can mean

| Question | Best source of truth |
| --- | --- |
| Is Codex currently processing a turn? | `turn/started`, `turn/completed`, and related provider events |
| Is Codex waiting for approval or an answer? | A correlated server request or explicit hook; otherwise a conservative terminal observation |
| Is the session controller still alive? | Child-process, PTY, tmux, or app-server connection state |
| Did the run change the workspace? | Filesystem and Git facts |
| Did the run finish successfully? | Provider turn result plus process exit, interpreted at the run layer |
| Is the result submitted or reviewed? | Pull-request, CI, and review APIs |
| Is the original task complete? | Acceptance criteria and task lifecycle, usually with human or policy approval |

Trying to compress these questions into one status creates familiar errors:

```text
turn completed       ≠ conversation terminated
process exited 0      ≠ implementation correct
files changed        ≠ work submitted
pull request merged  ≠ rollout verified
green activity light ≠ meaningful progress
```

## The clean path: control `codex app-server`

A manager that launches Codex through its app-server receives structured, correlated protocol messages rather than inferring state from pixels.

Vibe Kanban's Codex executor launches `codex app-server` and implements a bidirectional JSON-RPC client because the server can initiate requests as well as answer client requests.[^vibe-launch][^vibe-jsonrpc] A simplified lifecycle is:

```text
spawn codex app-server
    ↓
initialize → initialized
    ↓
thread/start or thread/resume
    ↓
turn/start
    ├─ turn/started
    ├─ item and output events
    ├─ approval or user-input requests
    └─ turn/completed
```

The Codex app-server protocol declares `turn/started` and `turn/completed` notifications, and its turn model distinguishes `inProgress`, `completed`, `interrupted`, and `failed` states.[^codex-events][^codex-turn-status]

A manager can therefore make strong observations:

```text
turn/started                  → a turn is active
approval request              → user attention may be required
user-input request            → user attention is required
turn/completed: completed     → the turn ended normally
turn/completed: interrupted   → the turn was stopped
turn/completed: failed        → the turn failed
```

Vibe Kanban's app-server client explicitly models thread creation, turn start, approvals, questions, and turn-completion handling.[^vibe-client]

### A completed turn usually means idle, not terminated

After `turn/completed`, the Codex thread and app-server process may remain alive for another message. Therefore the correct projection is often:

```text
last turn: completed
controller: alive
pending interaction: none

⇒ activity: idle
⇒ run outcome: still unknown if the run remains open
⇒ task outcome: unchanged
```

The manager needs a separate process or controller lifecycle. A protocol event marks a turn boundary; it does not necessarily mark the end of the session.

### Server requests are first-class evidence

A bidirectional client must handle requests initiated by Codex, including command approvals, file-change approvals, and questions for the user. These are stronger signals than parsing a sentence such as “May I continue?” from generated text because they have request IDs, typed payloads, and an explicit resolution path.[^vibe-client]

The manager should persist enough information to answer:

```text
What is waiting?
Which turn and item requested it?
What decision is allowed?
Has it already been resolved?
Can the request still be answered safely?
```

A generic `waiting_input` flag without the correlation key is not enough for robust automation.

## The terminal path: hooks, process supervision, and screen observation

Not every manager uses app-server as its visible interaction surface. It may launch the ordinary Codex TUI in tmux or a PTY so the user can jump directly into the native terminal session. That path requires several observers.

### Hooks report meaningful boundaries

Agent Orchestrator's Codex adapter installs hooks and uses hook-derived metadata for native session identity and activity. The adapter reports that Codex exposes useful turn boundaries but no reliable session-end event, so it opts into a separate process supervisor for exit detection.[^ao-codex]

That yields two independent facts:

```text
hook says: the last turn ended
supervisor says: the process is alive

⇒ the session is probably idle and resumable
```

If the process disappears, the manager can mark the runtime exited even when no final hook arrived.

### Terminal observation answers UI-specific questions

A TUI can expose information that hooks do not. Agent Orchestrator defines a terminal-surface observer over a bounded rendered screen with ANSI styling preserved. Styling matters because a dim placeholder is different from text typed by a person.[^ao-surface]

Its Codex adapter inspects work indicators and composer state separately. This is necessary because Codex can show a composer while an active turn remains interruptible; the mere presence of an input box does not prove the agent is idle.[^ao-terminal]

A terminal adapter may derive observations such as:

```text
active footer or spinner             → work appears active
empty composer, no active marker     → likely waiting at a normal prompt
non-empty composer                   → a human draft exists; do not overwrite it
permission menu visible              → user decision may be pending
process missing                      → exited
unrecognized or stale screen         → unknown, not safely idle
```

Terminal parsing is provider- and version-specific. It should be labeled as heuristic evidence and tested against captured fixtures.

### Permission prompts require fail-closed behavior

A dangerous ambiguity occurs when a permission dialog resembles ordinary input waiting. Agent Orchestrator's Codex adapter deliberately does not claim that it can emit a reliable `blocked` activity state: Codex may report a permission request as `waiting_input`, and the adapter may lack a later signal that safely clears a distinct blocked state.[^ao-blocked]

The safe policy is:

> Do not inject a message or newline merely because the terminal looks idle when a hidden or ambiguous approval may be active.

An unsolicited write could answer a decision rather than send a new chat message. When the observer cannot distinguish those cases, expose **Needs you** or **Unknown** and stop automation.

## Normalize provider events before updating product state

A manager that supports several harnesses should not let Codex-specific method names leak directly into every UI and policy rule. Translate them into a provider-neutral event vocabulary:

```ts
type AgentEvent =
  | { kind: "turn_started"; runId: string; providerTurnId: string }
  | { kind: "turn_finished"; runId: string; result: "ok" | "failed" | "interrupted" }
  | { kind: "approval_requested"; runId: string; requestId: string }
  | { kind: "question_requested"; runId: string; requestId: string }
  | { kind: "message_delta"; runId: string; text: string }
  | { kind: "tool_started"; runId: string; itemId: string }
  | { kind: "tool_finished"; runId: string; itemId: string; result: "ok" | "failed" }
  | { kind: "controller_exited"; runId: string; exitCode?: number };
```

Agent Orchestrator has a Codex app-server normalizer that converts provider notifications such as turn start, turn completion, message deltas, reasoning deltas, command output, and tool activity into its neutral chat-event model.[^ao-normalize]

Normalization provides three benefits:

1. the board and notification policies do not depend on one provider;
2. raw provider payloads remain available for audit and debugging;
3. a changed provider event can be fixed in one adapter rather than throughout the product.

Keep the original provider IDs and timestamps. They are needed for deduplication, reconnects, replay, and request resolution.

## Persist facts, then reduce them

A robust manager should retain both an append-only observation history and a compact current snapshot.

```text
agent_events
  id
  run_id
  provider
  provider_event_id
  kind
  payload
  observed_at

run_snapshot
  run_id
  controller_state
  current_turn_state
  pending_interaction
  last_meaningful_activity_at
  last_observation_source
  confidence
  revision
```

Agent Orchestrator persists activity states such as `active`, `idle`, `waiting_input`, `blocked`, and `exited`, while keeping termination as a separate fact.[^ao-architecture][^ao-schema]

The reducer should be deterministic and replayable. If a bug in status derivation is fixed, the product should be able to recompute the projection from recorded facts instead of trusting a stale board column.

### Use evidence precedence, but do not destroy dimensions

Within one display badge, stronger evidence should outrank weaker evidence:

```text
explicit unresolved approval or question
    > explicit active turn
    > explicit turn completion
    > process liveness
    > terminal heuristic
    > silence
```

But this is not permission to collapse everything. A run can simultaneously be:

```text
activity: working
attention: needs user soon
workspace: dirty
PR: none
```

or:

```text
activity: idle
run outcome: succeeded
workspace: committed
PR: checks failed
attention: needs user
```

The status badge shown on a board may choose **Needs you**, but the underlying dimensions should remain queryable.

## Vibe Kanban demonstrates the layer separation

Vibe Kanban models an execution process with `Running`, `Completed`, `Failed`, and `Killed` states.[^vibe-process] It separately models task workflow states such as `Todo`, `InProgress`, `InReview`, `Done`, and `Cancelled`.[^vibe-task]

That distinction is not merely naming. It prevents this faulty inference:

```text
execution process completed
⇒ task done
```

A process may complete while:

- no files changed;
- a partial implementation remains;
- tests failed but the agent returned normally;
- the change exists only in a local workspace;
- a pull request still needs review;
- the requested outcome was misunderstood.

Conversely, an interrupted run may leave a correct and reviewable commit. The execution result is evidence about one attempt, not the final truth about the task.

## Delivery status comes from the delivery system

After the runtime stops, observe the workspace and delivery pipeline directly:

```text
Git worktree
  ├─ clean or dirty
  ├─ changed paths
  ├─ commits ahead of base
  └─ current revision

Pull request
  ├─ absent, draft, open, closed, merged
  ├─ review decision
  ├─ mergeability or conflicts
  └─ head revision

Checks and deployment
  ├─ pending, passed, failed, cancelled
  ├─ revision checked
  └─ environment deployed and verified
```

A useful delivery reducer might produce:

```text
none
local_changes
committed
pr_open
changes_requested
ci_failed
approved
ready_to_merge
merged
deployed
verified
```

Every external observation should include its revision and freshness. “CI passed” is unsafe if it describes an older commit than the one currently under review.

## Silence is not idle

Distributed systems lose processes, network connections, hooks, and events. Therefore absence of recent activity is not proof that the agent is waiting normally.

Use freshness explicitly:

```ts
type Evidence<T> = {
  value: T;
  source: "provider" | "hook" | "process" | "terminal" | "git" | "github";
  observedAt: Date;
  confidence: "authoritative" | "strong" | "heuristic";
  revision?: string;
};
```

When evidence expires:

```text
working → stale
idle → stale
waiting → stale needs-user, if an unresolved request still exists
unknown → remain unknown until reconciled
```

On restart, the manager should reconcile rather than merely reload the last badge:

1. check whether the controller or terminal process still exists;
2. reconnect to or resume the provider thread when supported;
3. reload unresolved approvals or questions;
4. inspect the workspace and current revision;
5. refresh pull-request, CI, review, and deployment facts;
6. rerun the reducer.

## Self-report is useful but not authoritative

An agent may emit a summary such as:

```text
Implemented the fix, ran tests, and the task is complete.
```

Store it as a result report, not as the only status source. Verify the claims against observable facts:

```text
“implemented”     → diff or artifact exists
“ran tests”       → test evidence exists for the relevant revision
“submitted”       → delivery object exists
“complete”        → acceptance criteria are satisfied
```

Self-report is valuable for intent, explanation, and known limitations. It is weak evidence for process liveness, repository state, review state, and acceptance.

## What about an ordinary ChatGPT web conversation?

A manager can reliably observe a conversation that it owns through a supported protocol, SDK, hook system, browser extension, or controlled automation surface. An unrelated browser tab provides no equivalent provider event stream to the manager by default.

DOM inspection may reveal a stop button, spinner, or changed message list, but those are presentation details. They are weaker than a supported runtime protocol and may not expose approvals, hidden tool work, persistence, or completion semantics.

For an externally managed conversation, the honest projection is often:

```text
controller: external
activity: unknown
attention: unknown
last synchronized artifact: <timestamp or revision>
```

The system may allow the user to attach notes, links, exports, or resulting artifacts, but it should not pretend to know live state it cannot observe.

## Recommended model for a task-first manager

Keep four objects distinct:

```text
Task
  durable desired outcome and acceptance criteria

Run
  one bounded execution attempt

Conversation
  provider-native context that may contain several turns

Delivery
  artifact and its path through review, landing, deployment, and verification
```

A practical run record can retain the evidence rather than one overloaded status:

```ts
type RunObservation = {
  controller: {
    state: "alive" | "dead" | "unknown";
    nativeSessionId?: string;
  };

  turn: {
    state: "none" | "in_progress" | "completed" | "interrupted" | "failed";
    nativeTurnId?: string;
  };

  interaction: {
    state: "none" | "approval_required" | "question_required" | "ambiguous";
    requestId?: string;
  };

  workspace: {
    revision?: string;
    dirty?: boolean;
    commitsAhead?: number;
  };

  observedAt: string;
  sources: Array<"app_server" | "hook" | "process" | "terminal" | "git">;
  confidence: "authoritative" | "strong" | "heuristic";
};
```

Then derive several projections:

```ts
type RunProjection = {
  activity: "working" | "waiting" | "idle" | "stale" | "exited" | "unknown";
  attention: "none" | "needs_user" | "needs_review";
  outcome: "unknown" | "succeeded" | "failed" | "cancelled";
  delivery:
    | "none"
    | "local_changes"
    | "pr_open"
    | "ci_failed"
    | "in_review"
    | "ready_to_merge"
    | "merged"
    | "verified";
};
```

The task's lifecycle remains separate and changes only when its workflow or acceptance contract justifies it.

## The durable conclusion

Systems such as Agent Orchestrator and Vibe Kanban do not truly “understand the status of the chat” as one semantic fact. They instrument the environment:

- app-server events reveal turn and interaction state;
- hooks reveal boundaries and native session identity;
- process supervision reveals liveness and exit;
- terminal inspection fills provider-specific gaps, with lower confidence;
- Git reveals artifact state;
- pull-request, CI, review, and deployment systems reveal delivery state;
- task acceptance determines whether the desired outcome is actually complete.

The product then reduces those facts into a convenient board label. The trustworthy design keeps the evidence underneath the label, preserves uncertainty, and refuses to infer task completion from a quiet terminal or a successful process exit.

## Sources

[^codex-events]: OpenAI Codex, [`app-server-protocol/src/protocol/common.rs`](https://github.com/openai/codex/blob/c4017a87aacc7558002b7cb510025e967c1d765e/codex-rs/app-server-protocol/src/protocol/common.rs), protocol notification definitions including turn start and completion.

[^codex-turn-status]: OpenAI Codex, [`app-server-protocol/src/protocol/v2/turn.rs`](https://github.com/openai/codex/blob/c4017a87aacc7558002b7cb510025e967c1d765e/codex-rs/app-server-protocol/src/protocol/v2/turn.rs), turn status model.

[^vibe-launch]: Vibe Kanban, [`crates/executors/src/executors/codex.rs`](https://github.com/BloopAI/vibe-kanban/blob/4deb7eca8f381f7cbc1f9d15515a9ab8f8009053/crates/executors/src/executors/codex.rs), Codex executor and `app-server` launch path.

[^vibe-jsonrpc]: Vibe Kanban, [`crates/executors/src/executors/codex/jsonrpc.rs`](https://github.com/BloopAI/vibe-kanban/blob/4deb7eca8f381f7cbc1f9d15515a9ab8f8009053/crates/executors/src/executors/codex/jsonrpc.rs), bidirectional JSON-RPC helper.

[^vibe-client]: Vibe Kanban, [`crates/executors/src/executors/codex/client.rs`](https://github.com/BloopAI/vibe-kanban/blob/4deb7eca8f381f7cbc1f9d15515a9ab8f8009053/crates/executors/src/executors/codex/client.rs), thread, turn, approval, question, and completion handling.

[^vibe-process]: Vibe Kanban, [`crates/db/src/models/execution_process.rs`](https://github.com/BloopAI/vibe-kanban/blob/4deb7eca8f381f7cbc1f9d15515a9ab8f8009053/crates/db/src/models/execution_process.rs), execution-process status and persistence.

[^vibe-task]: Vibe Kanban, [`crates/db/src/models/task.rs`](https://github.com/BloopAI/vibe-kanban/blob/4deb7eca8f381f7cbc1f9d15515a9ab8f8009053/crates/db/src/models/task.rs), task lifecycle model.

[^ao-architecture]: Agent Orchestrator, [`docs/architecture.md`](https://github.com/Untrivial-ai/agent-orchestrator/blob/15e9ea971f1711ec8b50e157d6eb300db6cbe0d6/docs/architecture.md), observation, lifecycle, persistence, and derived-state architecture.

[^ao-codex]: Agent Orchestrator, [`backend/internal/adapters/agent/codex/codex.go`](https://github.com/Untrivial-ai/agent-orchestrator/blob/15e9ea971f1711ec8b50e157d6eb300db6cbe0d6/backend/internal/adapters/agent/codex/codex.go), Codex hooks, session identity, and supervisor-based exit detection.

[^ao-surface]: Agent Orchestrator, [`backend/internal/ports/terminal_surface.go`](https://github.com/Untrivial-ai/agent-orchestrator/blob/15e9ea971f1711ec8b50e157d6eb300db6cbe0d6/backend/internal/ports/terminal_surface.go), terminal-surface observation contract.

[^ao-terminal]: Agent Orchestrator, [`backend/internal/adapters/agent/codex/terminal_activity.go`](https://github.com/Untrivial-ai/agent-orchestrator/blob/15e9ea971f1711ec8b50e157d6eb300db6cbe0d6/backend/internal/adapters/agent/codex/terminal_activity.go), Codex work and composer detection.

[^ao-blocked]: Agent Orchestrator, [`backend/internal/ports/agent.go`](https://github.com/Untrivial-ai/agent-orchestrator/blob/15e9ea971f1711ec8b50e157d6eb300db6cbe0d6/backend/internal/ports/agent.go), adapter capability for distinguishing blocked activity and the Codex limitation.

[^ao-normalize]: Agent Orchestrator, [`backend/internal/adapters/chatdriver/codexappserver/normalize.go`](https://github.com/Untrivial-ai/agent-orchestrator/blob/15e9ea971f1711ec8b50e157d6eb300db6cbe0d6/backend/internal/adapters/chatdriver/codexappserver/normalize.go), translation from Codex notifications to provider-neutral chat events.

[^ao-schema]: Agent Orchestrator, [`backend/internal/storage/sqlite/migrations/0001_init.sql`](https://github.com/Untrivial-ai/agent-orchestrator/blob/15e9ea971f1711ec8b50e157d6eb300db6cbe0d6/backend/internal/storage/sqlite/migrations/0001_init.sql), persisted activity-state values.
