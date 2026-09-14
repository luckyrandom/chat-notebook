---
date: 2026-09-13
title: "Firstmate: Durable Supervision Beyond Native Subagents"
description: How Firstmate coordinates independent coding agents, where Herdr fits, how it differs from Codex and Claude delegation, and which mechanisms are worth adopting without the full distribution.
---

**Firstmate's central idea is not a better way to ask an LLM to spawn helpers. It is to make delegated work a durable, supervised obligation rather than a side effect of a conversation.**

An existing agent harness supplies the reasoning and coding tools. Firstmate supplies the operating conventions around it: task briefs, independent worker sessions, isolated worktrees, durable messages, event-driven supervision, recovery, and explicit delivery authority. The repository calls this an *agent distro*: a directory of instructions, skills, scripts, and state conventions, not a new model, harness, or MCP server. [Source: project overview][f-readme]

This review is pinned to Firstmate commit [`b182d0f908b78d08c7ccb8dce3775bdca8c5d657`][f-commit], inspected on **September 13, 2026**. It is a source-and-documentation review, not a live Firstmate trial or a performance benchmark. The [implementation and evidence sections](#firstmate-reference) preserve the source map, failure cases, and a proposed minimal design.

## The core snippet

The following is **original architectural pseudocode**, not an excerpt that can be pasted into Firstmate. It separates cheap observation from expensive reasoning and makes notification loss recoverable.

```python
# Deterministic watcher: no model call in this loop.
for observation in observe_workers_and_delivery_checks():
    if actionable(observation):
        durable_wakes.record_once(observation.identity, observation)
wake_supervisor_if_pending()  # A retryable hint, not the only record.

# Supervisor: invoked on a wake, a user turn, or a restart.
for wake in durable_wakes.claim_pending():
    task = load_durable_task(wake.task_id)
    facts = reconcile(task, live_worker(), current_delivery_evidence())
    action = choose_action_within_authority(task.brief, facts)
    intent = action_journal.persist_once(wake.identity, action)
    apply_or_reconcile_effect(intent)
    durable_wakes.ack_after_checkpoint(wake)
```

The important ordering is **record before notify; reconcile before act; checkpoint before acknowledge**. A crash after notification should not lose the task. A crash after an external action should trigger reconciliation, not blind repetition. The `action_journal` here is a proposed simplification; Firstmate implements the relevant guarantees through several queues, receipts, locks, and owner-specific scripts, not this exact API. [Source: supervision architecture][f-architecture]

That last distinction matters: this is not a magic exactly-once transaction across GitHub, a terminal, and a filesystem. A minimal implementation still needs stable operation identifiers, idempotent effects where possible, and inspection when an effect's outcome is unknown.

## What the actual workflow does

```text
User request
  -> resolve project, intent, scope, and delivery authority
  -> persist task and brief
  -> launch an independent worker in an isolated worktree
  -> supervise through events, state, and reliable steering
  -> produce a report, a ready branch, or a pull request
  -> validate and obtain the required landing authority
  -> prove the outcome, then clean up safely
```

**Intake is a contract, not just a prompt.** Firstmate resolves the project and chooses between a *ship* task, which produces an authorized project change, and a *scout* task, which produces a standalone investigation report. Research findings do not themselves authorize implementation. For a ship task, the delivery mode and merge-autonomy setting are resolved explicitly. The brief distinguishes the user's intent from the supervisor's implementation specification. [Source: task lifecycle][f-lifecycle]

**Dispatch creates a managed worker.** `fm-spawn.sh` launches a supported harness into a separate backend endpoint and task worktree. Treehouse supplies worktrees for tmux and Herdr; Orca is the exception that owns both terminal and worktree. Spawn checks the brief and delivery contract and refuses a failed isolation assertion. Where the configured backlog gate applies, dispatch is coupled to the durable work item's transition rather than left as another thing the model should remember. [Sources: spawn contract][f-spawn], [lifecycle][f-lifecycle]

**The supervisor ordinarily coordinates instead of implementing.** Project modifications belong to workers, except for narrowly authorized coordinator operations. The worker can therefore carry the implementation context while the primary conversation remains focused on requests, decisions, and outcomes. This is an operating policy with supporting guards, not a claim that the coordinator runs in an impenetrable read-only sandbox. [Source: role and authority contract][f-contract]

**Steering is durable messaging.** Ordinary `fm-send.sh` text becomes a sequenced inbox record. The terminal receives a short doorbell telling the worker to read it. A successful doorbell is not the source of truth; the stored message is. A worker acknowledgement and a returned answer are further, separate facts. The system can retry notification and escalate a message that remains unhandled. Native slash commands and certain explicitly targeted terminal operations use a separate typed path. [Source: send contract][f-send]

**Supervision combines multiple kinds of evidence.** The Bash watcher absorbs routine non-actionable changes without an LLM turn and surfaces decisions, blocked work, relevant delivery checks, and suspected stalls. Status files are append-only event histories, not authoritative current-state fields. `fm-crew-state.sh` and the shared supervision logic reconcile pipeline state, harness activity, and other observations. An old `working:` line cannot prove present execution, and an idle terminal cannot prove task completion. [Source: supervision architecture][f-architecture]

**Delivery is explicitly separate from worker completion.** Firstmate supports three ship paths:

| Delivery mode | Worker output and path | Landing boundary |
|---|---|---|
| `no-mistakes` | The selected pipeline owns review, fixes, tests, documentation, PR, and CI. | Wait for the configured merge authority. |
| `direct-PR` | The worker opens a PR without that pipeline. | An opened PR is not automatically evidence of green CI or permission to merge. |
| `local-only` | The worker leaves a clean ready branch. | The supervisor performs the guarded local landing only when authorized. |

The `yolo` setting is a separate merge-authority axis, not a substitute for validation. Its normal off posture requires explicit human approval. Teardown must not discard uncommitted or unlanded ship work merely because the worker says it is done. Scout cleanup instead requires its retained report and the investigation completion gate. [Source: delivery and teardown contract][f-lifecycle]

**Restart begins with reconciliation, not recollection.** Session startup obtains the per-home lock, inspects durable records, replays pending wakes, and reconciles recorded workers. Conversation memory is not the authoritative fleet database. A living endpoint, a dead agent, a failed read, and an unreachable remote host are different conditions with different recovery authority. [Source: startup and recovery][f-recovery]

## How this differs from Codex and Claude subagents

The useful comparison is about **who owns the whole lifecycle**, not whether one product can launch multiple agents.

Current Codex already has native parallel delegation, model and instruction customization, inspectable agent threads, and follow-up steering and stopping. Children inherit the parent's live sandbox and approval settings. Native subagents are therefore not merely hidden, unmanageable calls. [Source: official Codex documentation][codex-subagents]

Current Claude Code subagents have their own context and configurable tools and permissions. They support worktree isolation, resumption, persistent memory options, and nested delegation. Claims that Claude subagents inherently cannot use worktrees or delegate further would be outdated for the documentation inspected here. [Source: official Claude documentation][claude-subagents]

| Dimension | Native delegation | Firstmate's additional operating contract |
|---|---|---|
| Main unit | An agent or thread handling delegated work. | A recorded task with a brief, endpoint, workspace, events, and delivery obligations. |
| Execution | Managed through the host harness's agent facilities. | Separately launched harness processes behind a session-backend adapter. |
| Runtime choice | Configuration within the native product's supported model and agent system. | Per-task choice among supported harnesses, with terminal backend chosen separately. |
| Supervision | Native progress, results, controls, and permission handling. | A shared watcher and durable wake protocol across the recorded fleet. |
| Recovery | Product-specific session and agent behavior. | Explicit reconstruction from per-home records plus live endpoint and delivery evidence. |
| Completion | The delegated result, with application-specific follow-through. | Report retention or the selected validation, landing, and guarded teardown path. |

The Firstmate side of this comparison is grounded in its [dispatch and recovery contract][f-recovery], [lifecycle][f-lifecycle], and [backend abstraction][f-backend]. This does not mean a native harness cannot be configured or extended to implement similar policies. Firstmate packages those policies together.

**Claude agent teams are the closer comparator.** Teams coordinate independent Claude sessions, support direct communication, and can share a task list; their documentation still labels the feature experimental. Thus independent sessions and team coordination are not unique to Firstmate either. Firstmate is more specifically a cross-harness, multi-project operating layer with its own durable records, delivery modes, and optional deputy homes. [Source: official agent-team documentation][claude-teams]

### Why Firstmate guards against its own primary using native subagents

The project documents a July 22, 2026 incident in which the primary delegated through Claude's built-in mechanism instead of Firstmate's spawn path. Its fleet records showed no work, some workers were lost on a primary restart, and supervision went unnoticed as inactive. This is a **maintainer-reported incident**, not a universal claim about every native subagent implementation. [Source: delegation guard rationale][f-subagent-guard]

The structural problem is more general: a guard that asks whether recorded tasks are in flight cannot protect work that was never recorded. Firstmate therefore ships a primary-home tool guard against delegation outside its fleet. The documented Claude deny-list hardening is local rather than shared into worker worktrees, so legitimate worker subagents are not disarmed. The guard is not a universal sandbox or a proof that every bypass is impossible. [Source: guard mechanism and limits][f-subagent-guard]

The reusable rule is: **every long-lived outer task needs one durable owner**. Native subagents can still help *inside* an owned worker task. Their result remains part of that worker's responsibility instead of becoming an invisible second fleet.

### What secondmates add

A secondmate is a persistent deputy with its own `FM_HOME`, private records, project clones, session lock, and charter. The primary routes by charter scope. Each deputy supervises its own direct workers; the primary does not recursively operate the entire descendant tree. Idle deputies should wait rather than invent work. The documented configuration does not allow secondmates to spawn further secondmates. [Sources: home model][f-contract], [routing and recovery][f-recovery]

This partitions context and operational ownership. It is useful when domains or machines genuinely need separate management, but is unnecessary for a first local implementation.

## How much does Firstmate use Herdr?

**Herdr is optional for the ordinary local fleet, deeply integrated when selected, and required for the audited remote-secondmate mode.** There is no honest runtime percentage to give without a workload measurement. Dependency and responsibility boundaries answer the architectural question more usefully.

The backend selector has a tmux fallback. Its dependency function requires `tmux treehouse` for tmux and `herdr jq treehouse` for Herdr. The active backend set also includes zellij, Orca, and cmux; their support and verification levels differ. Herdr is not secretly required by the normal tmux path. [Source: backend selection and required tools][f-backend-selection]

| Responsibility | Herdr's part | Firstmate's part |
|---|---|---|
| Terminal hosting | Named sessions, workspaces, tabs, panes, reads, input, and lifecycle primitives. | Bind the correct endpoint to the correct task and home. |
| Agent activity | Native registrations, status, and process information. | Reconcile those observations with harness and workflow evidence. |
| Fast notifications | Optional protocol-16 agent-status events. | Classify relevance, preserve wakes, notify the supervisor, and retain polling fallback. |
| Visual organization | The terminal containers and presentation operations. | Best-effort per-task layout and carefully guarded cleanup. |
| Worktree isolation | Not the worktree owner in this integration. | Treehouse allocation plus task ownership and cleanup policy. |
| Planning and delivery | Not the owner of the task brief or merge policy. | Scope, delegation, validation mode, approval, outcome, and recovery. |

These boundaries are explicit in the [Herdr backend guide][f-herdr] and the [transport and endpoint contract][f-herdr-transport].

The integration is more substantial than a command that opens a tab. It handles explicit named-session routing, exact pane identities, conservative input delivery, process-backed liveness, presentation journals, and version-gated capabilities. The audited minimum is protocol 14; protocol 16 enables the optional push path. **Push events reduce latency but do not replace polling**, which still runs every cycle. [Sources: setup][f-herdr], [liveness and events][f-herdr-events]

Two limits are especially instructive. Native `idle` can appear while an agent is waiting on a long foreground tool, and a stale registration can remain after a process exits. Also, the documented Herdr server-restart boundary restores layout identities, not surviving harness processes. “The coordinator can restart and reconcile” is not “the terminal server can restart without losing processes.” [Sources: transport evidence][f-herdr-transport], [restart behavior][f-herdr-events]

## Adopting the idea without copying the repo

My recommendation is to extract the **contracts**, not transplant the entire `AGENTS.md` or a handful of interdependent `fm-*.sh` files. Firstmate's internal skills assume its home layout and toolchain; the README explicitly distinguishes them from standalone installer-facing skills. [Source: skill layout][f-readme]

### Start with the smallest level that solves the problem

For one bounded task in one active session, use native delegation and worktree isolation where appropriate. Add an explicit brief and acceptance criteria. An outer fleet manager would solve problems that may not yet exist.

For several tasks that must survive conversation resets or human absence, build a small local control layer: **one supported harness, one terminal backend, a durable task store, a worker inbox, a watcher, and a guarded delivery path**. Start with explicit human merge approval. This is a design recommendation derived from the preceding failure boundaries, not a claim that Firstmate itself is this small.

A minimal brief can look like this:

```text
Task: cache-fix-17
User intent: Fix stale results after a cache entry expires.
Supervisor interpretation: Add a regression test; preserve the public API.
Acceptance: The regression reproduces the bug before the fix and passes after it.
Workspace: An isolated worktree bound to this task and recorded base commit.
Deliverable: A PR with the test evidence and a short explanation.
Authority: May edit and test here; may not merge or discard unlanded work.
Escalation: Persist a keyed question when requirements or authority are unclear.
```

This is an original example. Its important feature is the separation between the user's request, the coordinator's interpretation, the evidence required, and the authority granted.

Keep three mechanisms in the first implementation. First, **stable task identity with replaceable worker attempts**: restarting an agent should not create another task or erase the prior worktree. Second, **durable communication with retryable notifications**: saving a message, delivering a doorbell, handling the message, and answering it are different transitions. Third, **evidence-based attention and delivery**: a blocked decision must remain visible even after later progress messages, and a completed agent must not imply an approved merge.

The [reference sections](#firstmate-reference) turn those mechanisms into a compact data model, message protocol, and failure-test matrix. They also distinguish the proposed design from Firstmate's actual implementation.

### What to leave out initially

Do not begin with remote secondmates, multiple terminal adapters, automatic quota-based routing, public mention intake, visual workspace choreography, or self-update machinery. These are useful product features only when their specific requirements exist. Do not add a separate LLM reviewer merely to imitate a “crew”; Firstmate's own delivery contract assigns rigor to the selected path instead of stacking unrequested review gates. [Sources: project features][f-readme], [delivery ownership][f-lifecycle]

Herdr becomes attractive when its visible agent-native terminal state and supported remote arrangement are requirements. It is not necessary to preserve the core local architecture. Likewise, the no-mistakes pipeline is one supported delivery integration, not a prerequisite for understanding durable supervision.

## Essential cautions

**Worktree isolation is not security isolation.** Separate checkouts do not separate credentials, network access, databases, ports, or operating-system privileges. In the audited configuration, Claude worker launches default to permission bypass unless an alternative posture is configured. Review that choice before adopting the distribution; never infer a secure sandbox from the coordinator's written “do not write” policy. [Source: configuration entries and authority contract][f-contract]

**Zero-token observation is not zero-cost coordination.** The watcher can wait and discard routine events without a model call. Workers, escalations, and decisions still consume model work. No cost, throughput, or quality improvement was measured in this review. [Source: watcher design][f-architecture]

**Recovery coverage has limits.** The Herdr guide explicitly says mid-session secondmate agent-process liveness is not implemented. Unknown or contradictory endpoint evidence is intentionally not permission to kill or replace a worker. Source headers also retain some older “experimental” wording for Herdr while current documentation describes a dedicated required CI lane; versioned capability evidence is more useful than a single maturity label. [Sources: active Herdr limits][f-herdr-events], [backend source][f-backend], [current home contract][f-contract]

**Keep the architecture proportional to the problem.** Firstmate is most interesting when the hard problem is managing work across sessions, projects, harnesses, and delivery states. For a short parallel investigation, native subagents are usually the simpler starting point. The durable lesson is: **use the LLM for judgment; use explicit records and deterministic mechanisms for ownership, delivery, recovery, and permission boundaries.**

This connects directly to the notebook's [task-first agent-manager design](task-first-agent-manager.md): Firstmate is a concrete system to study against that model, not proof that every detail of the model should be implemented at once.

(firstmate-reference)=
## Implementation protocols, failure tests, and source map

These reference sections preserve the engineering details needed to evaluate or reimplement the idea.

**Evidence scope:** Firstmate commit [`b182d0f908b78d08c7ccb8dce3775bdca8c5d657`][commit], inspected September 13, 2026. Selected source sections and repository contracts were read, along with official Codex and Claude documentation. Large scripts were not exhaustively audited. Firstmate, Herdr, and the upstream regression suites were not executed for this research. No runtime dependency percentage, token-savings figure, throughput comparison, or reliability rate was measured.

The designs and pseudocode below are **proposals**, not a claim that the upstream repository uses these exact schemas or APIs.

Open a section for the supporting detail; the main explanation above remains the reading path.

(firstmate-reference-a-small-implementation-boundary)=
````{dropdown} A small implementation boundary

Start with one machine, one supported harness, one session backend, and a small concurrency limit appropriate to the machine and account. Use a local durable store and an explicit human approval step before landing changes. Do not start by implementing remote deputy homes or several terminal adapters.

```text
Coordinator conversation
  -> narrow task-management commands
      -> durable task store and operation journal
      -> one worker-launch/control adapter
      -> one workspace provider
      -> deterministic watcher and delivery checks
      -> harness-specific wake integration
```

The wake integration is essential. A watcher that writes an event but cannot reliably continue the coordinator leaves a durable but unattended queue. Firstmate has harness-specific supervision paths: its README describes Claude's Stop-hook approach, Pi's extension, and Codex's bounded foreground checkpoints rather than pretending every primary can be awakened identically. Reusing a supported harness's actual continuation mechanism is part of the core, not cosmetic glue. [Sources: primary harness behavior][readme], [session-start protocol][recovery]

For the first delivery path, choose ordinary tests, a PR, explicit approval, and a merge check. The more elaborate no-mistakes integration is not necessary to reproduce durable supervision. Conversely, replacing it with a smaller path must not be described as reproducing its full validation guarantees. Firstmate treats validation mode and merge authority separately. [Source: delivery contract][lifecycle]
````

(firstmate-reference-the-data-model-tasks-outlive-runs)=
````{dropdown} The data model: tasks outlive runs

The smallest useful durable records have different purposes:

| Record | Minimum information | Why it must not collapse into another record |
|---|---|---|
| Task | Stable ID, project, brief revision, owner, acceptance criteria, delivery mode, authority. | The obligation survives agent replacement. |
| Worker attempt | Attempt ID, task ID, harness, endpoint identity, workspace, started-from revision. | Old activity must not be attributed to a new attempt. |
| Message | Stable message ID, recipient task and attempt policy, payload, enqueue time, acknowledgement. | A notification is not the message itself. |
| Decision | Stable decision ID, task, question, permitted answerer, resolution evidence. | Later progress must not erase an unanswered question. |
| Delivery | Artifact or PR, expected head, checks, approval scope, landing evidence. | Finishing execution is not accepting or landing the output. |
| Operation | Stable operation ID, target identity, intended effect, observed outcome. | Restart must reconcile uncertain external effects. |

A SQLite database is one reasonable local choice; carefully implemented files can also work. The distinctive requirement is explicit ownership and transactional state transitions, not the storage product. Files need the relevant locking, atomic publication, and durability strategy; a successful write call alone is not a complete crash-safety argument.

This proposed separation is consistent with Firstmate's task metadata, status events, inboxes, current-state reconciliation, and delivery records, but intentionally avoids copying all its private formats. It also extends the notebook's [task-first model](task-first-agent-manager.md). [Sources: home layout][contract], [supervision architecture][architecture], [send contract][send]

### Two identities that should not be confused

A terminal title such as `worker-cache` is presentation. The actual routing identity should include the home, backend, session, and immutable endpoint identifier. A recreated pane with the same title is not automatically the previous worker. Herdr's labels are not unique, and Firstmate deliberately uses recorded IDs and exact placement proofs instead of the globally focused workspace. [Source: Herdr endpoint and cleanup contract][herdr-transport]

An execution attempt is also not a task. When an agent is replaced, delayed run-specific activity belongs to the old attempt. But an unresolved task-level decision may still apply. Therefore do not solve stale-event handling by dropping *all* records from earlier attempts: doing so can erase a still-open approval request.
````

(firstmate-reference-the-messaging-snippet-durable-payload-disposable-doorbell)=
````{dropdown} The messaging snippet: durable payload, disposable doorbell

The following protocol is the part worth retaining when moving from terminal copy-and-paste to a reliable manager.

```python
# Sender: callers reuse message_id when retrying the same instruction.
with store.transaction():
    target = store.require_current_target(task_id)
    store.insert_message_if_absent(message_id, target, text)

notify_best_effort(target, "Read your task inbox")

# Worker-side integration, whether a tool, hook, or agent procedure:
for message in store.unhandled_messages(task_id):
    checkpoint = handle_or_reconcile(message.id, message.text)
    store.record_handled(message.id, checkpoint)

# Watcher: never substitute a new payload for the existing message.
for message in store.overdue_unhandled_messages():
    if endpoint_confirmed_dead(message.target):
        enqueue_recovery(message.task_id)
    elif retry_budget_remaining(message):
        notify_best_effort(message.target, "Read your task inbox")
    else:
        enqueue_attention(message.task_id, message.id)
```

This is architectural pseudocode. It assumes transactional storage and a real worker-side inbox reader. A normal coding CLI does not acquire an inbox protocol merely because the manager wrote a file; it needs instructions, a hook, or a tool integration that actually reads and acknowledges the records.

The protocol distinguishes four facts: the payload is stored, the worker is notified, the payload is handled, and the requested result is returned. Firstmate's `fm-send.sh` documents precisely this separation. Its ordinary text plane uses durable inbox records; terminal-native commands remain a different plane. Remote retries need the original correlation rather than a new ordinary send. [Source: message delivery and retry contract][send]

**Message deduplication does not make arbitrary effects exactly once.** An agent could make an external change and crash before acknowledging the message. `handle_or_reconcile` must inspect an operation journal or external state before trying again. For a PR merge, query whether the intended PR/head already landed. For an irreversible operation with an unknown result and no idempotency support, stop and ask for inspection rather than infer permission to retry.

Keep lifecycle control separate too. An interrupt or relaunch should target the recorded attempt through a verified control operation, not be sent as natural-language text that the worker might interpret as advice. Firstmate makes this split with `fm-send.sh` and `fm-control.sh`. [Source: lifecycle steering and control][lifecycle]
````

(firstmate-reference-state-is-a-projection-of-evidence-not-the-latest-line)=
````{dropdown} State is a projection of evidence, not the latest line

Consider this task log:

```text
needs-decision: api-policy-42 -- Is changing this response field allowed?
working: Added a regression test for the existing response.
note: The test fails on the current main branch.
```

The task still needs an answer. A dashboard that displays only the latest line may wrongly show routine progress and bury the decision.

A minimal projection keeps open decisions separately:

```python
open_decisions = {}
for event in ordered_deduplicated_events:
    if event.kind == "decision_opened":
        open_decisions[event.decision_id] = event
    elif event.kind == "decision_resolved" and authorized_resolution(event):
        open_decisions.pop(event.decision_id, None)
    # Progress, notes, and run endings do not implicitly resolve decisions.
```

Decision IDs here identify a particular question lifecycle and are not recycled. Resolution requires provenance and authority, not merely matching text from a worker. The reducer is only the projection step; durable event ingestion and ordering are separate requirements.

Firstmate implements a more detailed status fold and presents open decisions even when the wake queue is empty. It also surfaces divergence when the status history says a decision is resolved but the durable held-work record still disagrees. That is why a single `status = last_message` field is insufficient. [Source: status folds and queue presentation][architecture]

Likewise, activity, attention, and delivery should be separate dimensions. A task can have a stopped worker, an unanswered decision, and a PR awaiting approval at the same time. A spinning terminal does not prove useful progress; a native idle state does not prove a stopped agent; a `done` message does not prove a merge. [Sources: current-state reconciliation][architecture], [Herdr transport limits][herdr-transport], [delivery semantics][lifecycle]
````

(firstmate-reference-recovery-is-a-reconciliation-operation)=
````{dropdown} Recovery is a reconciliation operation

A lightweight recovery pass should acquire the appropriate ownership lock, load the recorded task and current attempt, and inspect the exact endpoint and workspace. Reattach when the worker is genuinely alive. When it is positively dead, preserve unlanded work and establish that a replacement can safely own it. When liveness or identity is unknown, preserve the task and surface the uncertainty.

Creation itself needs a recovery story. There is a crash window between requesting a terminal/worktree and storing its returned identity. Persist a launch operation before allocation and make allocation discoverable or idempotent. When the response is lost, reconcile the operation's exact resources rather than blindly create another worker. Firstmate's spawn contracts include task-scoped serialization and guarded endpoint recovery; its Herdr presentation journals illustrate both the value and the complexity of explicit creation identity. [Sources: spawn contract][spawn], [Herdr setup and presentation][herdr]

Delivery checks must bind to the intended revision. A green check on an earlier head is not proof about a later commit. Similarly, a permission to merge one scoped change should not silently become authority to merge a changed, unreviewed head. Firstmate records the PR head when arming the delivery check and assigns current validation ownership to the attributed run. [Source: validation and PR-ready lifecycle][lifecycle]

The minimal design should prefer **at-least-once attention with deduplicated handling** over losing an event. It should not promise exactly-once external side effects. Unknown state is a first-class result, not another spelling of dead, failed, or safe to delete.
````

(firstmate-reference-what-herdr-would-change-in-this-minimal-design)=
````{dropdown} What Herdr would change in this minimal design

Adding Herdr replaces or extends the terminal adapter, not the task planner. Keep the shared contract small: create an endpoint, capture bounded output, deliver a notification, observe activity and process liveness, perform supported control operations, and dispose of a proven-owned idle endpoint when authorized.

The selected backend must be recorded on each task; later configuration changes must not reroute an existing task to another backend. A selected-backend failure should remain a failure, not silently trigger a fallback that creates a duplicate worker. These are explicit boundaries in Firstmate's selector and spawn contracts. [Sources: backend abstraction][backend], [spawn refusal rules][spawn]

Native push is an optimization. Firstmate's protocol-16 path subscribes before reconciling current status, buffers transitions during that reconciliation, and keeps polling every cycle. This avoids relying entirely on edges that could have occurred before the subscription. Implementing only an event listener without a current-state reconciliation path would lose part of the design. [Source: push and polling contract][herdr-events]

Do not adopt the remote-secondmate requirement accidentally. In the audited Firstmate mode, the remote deputy uses Herdr. Supporting remote workers with a different transport in a new manager is a new design and verification obligation, not a capability demonstrated by Firstmate's tmux path. [Source: backend setup][herdr]
````

(firstmate-reference-failure-tests-before-trusting-a-small-manager)=
````{dropdown} Failure tests before trusting a small manager

The following is a **proposed acceptance matrix**, not a report of tests executed during this research.

| Fault to inject | Required result |
|---|---|
| Kill the coordinator while a worker is active. | On restart, recover the same task and reattach; do not duplicate the worker. |
| Crash after persisting a wake but before notification. | The wake remains pending and is eventually presented. |
| Deliver a wake or doorbell twice. | The task and instruction are not duplicated. |
| Crash after an external action but before local acknowledgement. | Reconcile the effect; do not blindly repeat it. |
| Open a decision, then append progress and notes. | The unresolved decision remains visible. |
| Replace an agent, then deliver an old run's activity event. | Do not attribute the old activity to the new attempt; retain applicable task-level decisions. |
| Lose the terminal-create response. | Recover by exact launch identity or stop for inspection; do not guess by title. |
| Observe a long foreground tool with native terminal state idle. | Do not declare success or relaunch solely from idle. |
| Change the PR head after checks or approval. | Re-evaluate the relevant checks and approval scope. |
| Request cleanup with dirty or unlanded work. | Refuse cleanup without separate explicit discard authority. |
| Make the configured backend unavailable. | Report the failure; do not switch backends silently. |
| Point a label at another home or an unowned pane. | Refuse steering and destructive operations. |

Firstmate's Herdr guide names upstream tests for submission confirmation, stale registrations, presentation ownership, event ordering, and cleanup safety. Those test references are useful entry points, but a named suite or green infrastructure lane is not proof of every harness/account combination. The guide explicitly separates normal CI from opt-in credentialed real-harness tests. [Sources: Herdr verification boundaries][herdr], [transport regression references][herdr-transport], [event and liveness references][herdr-events]
````

(firstmate-reference-source-map-for-further-reading)=
````{dropdown} Source map for further reading

All Firstmate links below pin the inspected commit. Official product documentation is moving documentation, accessed September 13, 2026.

| Question | Source and what to inspect |
|---|---|
| What is the distribution rather than the underlying agent? | [README][readme]: execution model, primary harness wake differences, internal versus standalone skills. |
| Where do ownership and permission boundaries live? | [AGENTS.md, lines 18–85][contract]: supervisor role, project exceptions, home state, worker permission posture. |
| How are startup, routing, and deputy ownership handled? | [AGENTS.md, lines 180–300][recovery]: lock, digest, recovery, direct-report and charter rules. |
| What makes dispatch and delivery one task lifecycle? | [AGENTS.md, lines 300–410][lifecycle]: brief, spawn, steering, pipeline, approval, PR tracking, and teardown. |
| What does spawn enforce before launch? | [fm-spawn.sh, lines 1–115][spawn]: explicit mode, role overlay, isolation, target reuse, backend refusal, locks. |
| What makes messaging reliable? | [fm-send.sh, lines 1–115][send]: inbox versus typed input, acknowledgement, retries, and correlation. |
| Why not allow any native delegation from the primary? | [Primary delegation guard][subagent-guard]: the reported incident, missing-record failure, scope, and exclusions. |
| Is Herdr required locally? | [fm-backend.sh, lines 230–320][backend-selection]: selection precedence and backend-specific required tools. |
| How is attention computed? | [Architecture][architecture]: watcher, durable wakes, current-state reads, open-decision fold, and record divergence. |
| Which Herdr behaviors are actually relied upon? | [Herdr setup][herdr], [transport][herdr-transport], and [liveness/events][herdr-events]. |
| Which script owns a particular operation? | [Toolbelt index][scripts]: a map to script headers; it is not a set of standalone drop-in utilities. |
| What do native alternatives already provide? | [Codex subagents][codex], [Claude subagents][claude], and [Claude agent teams][teams]. |

The strongest reusable idea is the ownership boundary: **the task is durable; worker processes, notifications, conversations, and terminal layouts are replaceable mechanisms for advancing it.** Preserve that boundary before adding more agents.
````

[f-commit]: https://github.com/kunchenguid/firstmate/commit/b182d0f908b78d08c7ccb8dce3775bdca8c5d657
[f-readme]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/README.md
[f-contract]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/AGENTS.md#L18-L85
[f-recovery]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/AGENTS.md#L180-L300
[f-lifecycle]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/AGENTS.md#L300-L410
[f-spawn]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/bin/fm-spawn.sh#L1-L115
[f-send]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/bin/fm-send.sh#L1-L115
[f-architecture]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/docs/architecture.md
[f-subagent-guard]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/docs/subagent-guard.md#L1-L110
[f-backend]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/bin/fm-backend.sh
[f-backend-selection]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/bin/fm-backend.sh#L230-L320
[f-herdr]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/docs/herdr-backend.md#L1-L110
[f-herdr-transport]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/docs/herdr-backend.md#L160-L270
[f-herdr-events]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/docs/herdr-backend.md#L270-L360
[codex-subagents]: https://developers.openai.com/codex/subagents
[claude-subagents]: https://code.claude.com/docs/en/sub-agents
[claude-teams]: https://code.claude.com/docs/en/agent-teams
[commit]: https://github.com/kunchenguid/firstmate/commit/b182d0f908b78d08c7ccb8dce3775bdca8c5d657
[readme]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/README.md
[contract]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/AGENTS.md#L18-L85
[recovery]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/AGENTS.md#L180-L300
[lifecycle]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/AGENTS.md#L300-L410
[spawn]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/bin/fm-spawn.sh#L1-L115
[send]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/bin/fm-send.sh#L1-L115
[architecture]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/docs/architecture.md
[subagent-guard]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/docs/subagent-guard.md#L1-L110
[backend]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/bin/fm-backend.sh
[backend-selection]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/bin/fm-backend.sh#L230-L320
[herdr]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/docs/herdr-backend.md#L1-L110
[herdr-transport]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/docs/herdr-backend.md#L160-L270
[herdr-events]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/docs/herdr-backend.md#L270-L360
[scripts]: https://github.com/kunchenguid/firstmate/blob/b182d0f908b78d08c7ccb8dce3775bdca8c5d657/docs/scripts.md
[codex]: https://developers.openai.com/codex/subagents
[claude]: https://code.claude.com/docs/en/sub-agents
[teams]: https://code.claude.com/docs/en/agent-teams
