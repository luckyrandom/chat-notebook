---
title: A Task-First Operating System for Coding Agents
description: Design an agent manager around durable tasks, versioned briefs, replaceable runs, delivery state, and an attention inbox instead of a sidebar of chats.
---

Most coding-agent products still inherit the interaction model of a chat application: a list of conversations on the left and one conversation on the right. That model is convenient for a single exchange, but it becomes fragile when real work spans several days, agents, workspaces, subtasks, reviews, and deliveries.

The durable object should not be the conversation. It should be the **task: a commitment to an outcome**.

A conversation is one attempt to understand or advance that task. An agent run is one execution attempt. A workspace is one environment in which work happens. A pull request, document, experiment, or deployment is one delivery artifact. All of these should remain attached to a task that can outlive them.

The resulting product is better understood as a **task operating system for agent-assisted work** than as an agent manager with a better chat sidebar.

## The core model

The smallest useful model is:

```text
Project or goal
    └── Task
         ├── versioned task brief
         ├── decisions and open questions
         ├── child tasks and typed relations
         ├── runs
         │    ├── agent and session
         │    └── workspace
         ├── artifacts
         ├── deliveries and acceptance
         └── event history
```

The important separation is:

| Record | Represents | Example |
|---|---|---|
| **Task** | A durable outcome someone owns | Fix the cache invalidation bug and land the change. |
| **Run** | One attempt by a person or agent to advance the task | A Codex session implementing the reviewer-requested revision. |
| **Delivery** | An artifact and the process by which it becomes accepted | Pull request 481, awaiting approval and production verification. |

This avoids a common but damaging assumption:

```text
one chat = one task = one branch = one pull request = done
```

In practice, one task may require several conversations, failed runs, agent changes, workspaces, and deliveries. One delivery may satisfy several tasks. A successful run may produce a local change that has not been reviewed, submitted, merged, deployed, or verified.

## Four invariants

A reliable design should preserve four invariants.

### 1. Task identity is stable

The task survives chat deletion, agent replacement, process crashes, branch changes, and review delays. It has a permanent identity, an owner, a desired outcome, and an acceptance contract.

### 2. Every run binds to a task-brief revision

An agent should not receive an invisible, mutable pile of context. It should receive a compiled context packet derived from an explicit revision of the task brief. If the brief changes while the agent is working, the system can say:

> This run started from task-brief revision 7. The current brief is revision 9.

That makes stale work detectable and preserves an audit trail.

### 3. Execution and delivery are separate

An agent finishing is not the same as the task being complete. A run can succeed while its artifact remains local. A pull request can merge while rollout verification remains unfinished. A research run can stop after collecting evidence while the decision is still unresolved.

### 4. Attention is derived from evidence

The system should calculate what needs human attention from task, run, workspace, review, and delivery facts. A person should not have to maintain another board manually just to remember that finished work still needs review or submission.

## Separate the state dimensions

One `status` field cannot describe the system accurately. Use independent dimensions:

| Dimension | Example values | Question answered |
|---|---|---|
| **Task lifecycle** | Captured, shaping, ready, active, awaiting acceptance, delivered, canceled | How far is the outcome from completion? |
| **Run state** | Queued, running, needs input, succeeded, failed, interrupted, unknown | What is happening in this execution attempt? |
| **Delivery state** | Local, submitted, changes requested, approved, landed, verified | What has happened to the artifact? |
| **Attention** | Needs you, agent can act, waiting on others, scheduled, none | Who should act next? |

`Blocked`, `paused`, and `snoozed` are overlays with reasons and wake-up conditions. They should not erase the task's underlying lifecycle.

A normal task can therefore be represented as:

```text
Task lifecycle: Active
Run state:      Succeeded
Delivery state: Local
Attention:      Needs you — review and submit
```

Three days later the same task may be:

```text
Task lifecycle: Awaiting acceptance
Run state:      None running
Delivery state: Changes requested
Attention:      Needs you — inspect reviewer feedback
```

## Chat should compile into a task brief

Conversation remains valuable, especially while the user is still discovering what the task should be. The mistake is treating the transcript as the only durable specification.

A task may begin with one sentence:

> Investigate why evaluation quality fell last week.

The user and AI then discuss possible causes, constraints, evidence, and tradeoffs. During the conversation, the system should propose explicit changes to a canonical brief:

```diff
 Goal:
- Improve the evaluation.
+ Identify the cause of the quality regression and recommend a validated fix.

 Acceptance:
+ Reproduce the regression.
+ Attribute it to one or more measurable causes.
+ Record the supporting evidence.
+ Recommend an intervention and its expected effect.

 Non-goals:
+ Do not deploy a production change during this task.
```

The user accepts, edits, or rejects the patch. The transcript remains available, but the accepted brief becomes the reusable source of intent.

A useful brief contains:

- the desired outcome;
- why it matters;
- acceptance criteria;
- constraints and non-goals;
- important decisions;
- unresolved questions;
- relevant context and files;
- dependencies;
- the expected delivery form;
- the next action.

This is the bridge between free-form note-taking and structured issue tracking: capture can remain effortless while structure emerges progressively.

## Compile context instead of dumping history

A new agent run should receive a compact context packet rather than the entire transcript. The packet should include:

- goal and acceptance criteria;
- current constraints and non-goals;
- selected decisions;
- relevant files and artifacts;
- outputs from completed dependencies;
- the current artifact revision;
- the next action;
- agent-specific permissions and limits.

The full history remains searchable for audit and recovery, but it should not automatically consume every run's context window. Old conversations contain abandoned ideas, superseded requirements, speculation, and repetition. Context compilation should favor current, accepted knowledge while preserving links back to its provenance.

## Use a tree for navigation and a graph for reality

Hierarchical decomposition is still useful:

```text
Evaluation regression
    ├── Reproduce the regression
    ├── Compare sampling configurations
    ├── Diagnose the cause
    └── Recommend an intervention
```

Give each task one primary parent so the system remains easy to browse. Add typed lateral relations for the cases that hierarchy cannot express:

```text
blocks
blocked_by
related_to
shares_context_with
implements
validates
supersedes
duplicate_of
delivered_by
```

Promote work into a first-class subtask when it can have an independent owner, meaningful dependency, or separate deliverable. An agent's temporary implementation checklist should usually remain inside its run rather than flooding the user's task graph.

## The end-to-end workflow

### 1. Capture

Task creation should require only a title. From anywhere, the user can write:

> Add task: investigate flaky benchmark.

The system creates a `Captured` task immediately. AI may suggest a project, type, parent, or related task, but it should not silently reorganize the graph.

### 2. Shape

The task opens in a shaping room. The user can discuss the problem normally while AI proposes:

- brief revisions;
- acceptance criteria;
- decisions and open questions;
- candidate subtasks;
- dependencies;
- relevant earlier work;
- a delivery contract.

Selected text can be promoted into a subtask, decision, constraint, question, note, or acceptance criterion.

### 3. Pass a ready gate

Before substantial execution, the system checks whether the next attempt is actionable:

```text
Goal               clear
Acceptance         clear enough for this attempt
Required context   available
Dependencies       satisfied or explicitly handled
Permissions        compatible
Delivery target    selected
```

`Ready` does not mean that all uncertainty has disappeared. It means there is enough clarity for a bounded next attempt.

### 4. Dispatch

The user or policy chooses:

- agent and provider;
- local, remote, or cloud execution;
- an existing or new workspace;
- autonomy and permission level;
- cost, time, or turn limits.

The run records the exact task-brief revision it received. Existing ad hoc sessions should also be attachable; a task system that only understands sessions it created will inevitably develop blind spots.

### 5. Supervise quietly

Several agents may run concurrently, but the system should not demand continuous observation. The running view shows:

- task and agent;
- workspace;
- current phase;
- last meaningful activity;
- whether input is needed;
- runtime, cost, or turn budget when available;
- a direct jump to the native chat or terminal.

Routine output remains quiet. Questions, failures, suspicious stalls, and review-ready results surface in the attention inbox.

The system should distinguish activity from progress. A stream of messages is not evidence that an artifact changed or a lifecycle stage advanced.

### 6. Review a result package

When a run ends, the primary view should not be the raw transcript. Show a compact result package:

```text
What changed
Why it changed
Artifacts and revisions
Validation performed
Evidence
Known risks
Unresolved questions
Suggested next action
```

The user can accept the result, request revision, launch a review agent, switch agents, edit manually, split follow-up work, or reject the approach while preserving useful discoveries.

### 7. Deliver and follow through

Submitting a pull request or document does not close the task. It creates a waiting obligation. When feedback arrives, the original task should resurface with:

- the exact comment or failure;
- the artifact revision to which it applies;
- the original task brief and decisions;
- the correct workspace;
- a prepared context packet for the next run.

Mechanical feedback may be delegated automatically under policy. Semantic disagreements and tradeoffs belong in the human attention queue.

The task closes only when its delivery contract is satisfied.

### 8. Extract reusable knowledge

At completion, AI can propose extracting a reusable decision, convention, debugging insight, experiment result, new automation, or follow-up task. This is where note-taking and task management meet: durable knowledge becomes a by-product of completed work rather than a disconnected pile of summaries.

## The home screen should be an attention inbox

The default screen should answer:

> What needs me next, and why?

Each item should include the task, the concrete reason it surfaced, its age, the owner of the next action, the freshness of the evidence, and one primary action.

| Task | Reason | Primary action |
|---|---|---|
| Fix cache invalidation | Implementation exists locally, but no submitted change is linked | Review and submit |
| Update benchmark pipeline | Reviewer requested a semantic change | Inspect feedback |
| Investigate regression | Agent needs a choice between two hypotheses | Answer question |
| Improve evaluation report | Approval and required checks apply to the current revision | Land change |
| Migrate dataset loader | Waiting for a reviewer for two working days | Follow up |
| Refactor experiment runner | Session disappeared and workspace state is unknown | Inspect workspace |

Repeated signals should update one obligation rather than create notification spam. Ten failed CI retries are one unresolved problem unless materially different evidence appears.

## UI projections over one work graph

The underlying graph should support several views without duplicating state:

- **Outline** for decomposition, notes, and progressive structure.
- **Board** for flow through a lifecycle.
- **Dependency graph** for blockers and entanglement.
- **Attention inbox** for human decisions.
- **Running view** for live execution.
- **Waiting view** for external obligations and wake-up conditions.
- **Timeline** for events, revisions, reviews, and delivery.
- **Knowledge view** for decisions and reusable context.

Kanban is useful, but it should be a projection over the graph rather than the canonical model. Dragging a card on a task-lifecycle board should not silently overwrite run or delivery state.

### A task room

The central screen should be the task room rather than the conversation:

```text
┌───────────────────────────────────────────────────────────────────┐
│ Inbox   Today   Running   Waiting   Projects   Knowledge           │
├───────────────┬─────────────────────────────────┬─────────────────┤
│ Project       │ Task room                       │ Context         │
│ outline       │                                 │                 │
│               │ Goal and lifecycle              │ Relations       │
│ ▾ Evaluation  │ NOW: review result              │ Dependencies    │
│   ▾ Regression│ Next action: inspect diff       │ Decisions       │
│     Reproduce │                                 │ Artifacts       │
│     Diagnose  │ Brief | Plan | Work | Delivery  │ Runs            │
│     Recommend │ Decisions | Timeline            │ Freshness       │
│               │                                 │                 │
│               │ Shape | Explore | Execute       │                 │
│               │ Review | Reflect                │                 │
└───────────────┴─────────────────────────────────┴─────────────────┘
```

The top of the task room should always contain a short re-entry brief:

```text
Goal
Last verified progress
Important decisions
Current blocker
Next action
Artifact and evidence revisions
Freshness of external observations
```

A user returning after a week should not need to reread the entire chat to resume the work.

## Existing systems and the ideas to borrow

This research snapshot reflects public documentation available in September 2026. Products will change; the architectural conclusions above should not depend on any one product.

| System | Strongest idea to borrow | Remaining gap for this design |
|---|---|---|
| [Agent Orchestrator](https://github.com/Untrivial-ai/agent-orchestrator) | Project-level planning, focused workers, isolated workspaces, and a live board derived from session, PR, CI, and review facts | Still primarily a coding and pull-request workflow; the durable task and knowledge model can be broader |
| [Vibe Kanban](https://github.com/BloopAI/vibe-kanban) | Issues and child issues remain distinct from the agent workspaces that execute them | Product and hosting status can change; use it as a design and source reference rather than a foundational dependency |
| [Conductor](https://www.conductor.build/docs) | Every independent unit of work gets an isolated workspace, branch, terminal, and review path | Workspace organization does not by itself prove acceptance or delivery |
| [Linear](https://linear.app/docs/assigning-issues) | A human remains accountable while an agent is a replaceable delegate | Local execution, workspace state, and non-Linear deliveries still need adapters |
| [GitHub coding agents](https://docs.github.com/en/copilot/concepts/agents/about-third-party-coding-agents) | A strong issue-to-agent-to-pull-request-to-review loop | GitHub issues and PRs are too narrow as the universal identity for research, documents, experiments, and cross-system work |
| [T3 Code](https://github.com/pingdotgg/t3code) | A provider-neutral control surface over several coding-agent harnesses | Sessions and agents remain more central than durable outcomes |
| [HERDR](https://herdr.dev/docs/agents/) | Persistent terminal processes, aggregated agent state, and fast navigation to work needing attention | Runtime observation cannot establish review acceptance, landing, rollout, or non-code delivery |
| [Beads](https://github.com/steveyegge/beads) | Persistent, dependency-aware task memory designed for agents | A task graph and CLI do not supply the complete human planning, review, and delivery experience |
| [Symphony](https://github.com/openai/symphony/blob/main/SPEC.md) | A written orchestration contract for tracker polling, bounded runs, workspace reuse, retries, and reconciliation | It is an execution specification, not a full personal task UX |

No single product completely supplies the desired system. The practical direction is to put a task control plane above Codex, Claude Code, Antigravity, T3, terminal agents, and future execution tools.

## What to borrow from trackers and outliners

Engineering trackers and flexible note systems solve different halves of the problem.

From issue trackers such as [Linear](https://linear.app/docs/parent-and-sub-issues), [GitHub Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects), and [Plane](https://docs.plane.so/core-concepts/issues/overview), borrow:

- stable issue identity;
- ownership and delegation;
- child tasks and dependencies;
- multiple saved views;
- artifact and review links;
- explicit lifecycle fields.

From relational workspaces such as [Fibery](https://fibery.io/) and document databases such as [Notion](https://www.notion.com/help/guides/creating-links-and-backlinks), borrow:

- typed entities and relations;
- documents and structured records living together;
- several projections over one data model;
- reusable decisions and context.

From outliners such as [Tana](https://tana.inc/), [Workflowy](https://workflowy.com/), [Logseq](https://github.com/logseq/logseq), and [Org mode](https://orgmode.org/), borrow:

- instant capture;
- progressive structure;
- unlimited nesting and zooming;
- local-first or text-oriented recovery;
- the ability for a note to become a project gradually.

The synthesis is not “choose Kanban or hierarchy.” It is:

> Store a typed graph, navigate it primarily as an outline, and project it as boards, dependency graphs, inboxes, timelines, and knowledge views when needed.

## A small implementation architecture

A first implementation does not need to replace every agent or tracker. It can be a local control plane attached to existing tools:

```text
Task store
Task-brief revisions
Run registry
Workspace registry
Artifacts and deliveries
Immutable event log
Reconciler
Attention rules
Agent adapters
Review and source-control adapters
UI and CLI
AI shaping and context compiler
```

SQLite is a practical local source of truth: it offers transactions, indexing, recovery, and simple export without requiring several agents to rewrite one shared Markdown board concurrently. Human-readable briefs can still be exported as Markdown.

### Agent adapter

```ts
interface AgentAdapter {
  startRun(input: StartRunInput): Promise<RunHandle>;
  attachRun(input: AttachRunInput): Promise<RunHandle>;
  send(runId: string, message: string): Promise<void>;
  observe(runId: string): Promise<RunObservation>;
  cancel(runId: string): Promise<void>;
  collectResult(runId: string): Promise<RunResult>;
  openNative(runId: string): Promise<void>;
}
```

Each provider should advertise capabilities rather than being forced into a false common denominator:

```text
structured events
resume session
workspace isolation
mid-run message
file-change observation
cost reporting
permission control
remote execution
```

### Delivery adapter

```ts
interface DeliveryAdapter {
  discoverArtifacts(taskId: string): Promise<Artifact[]>;
  refresh(deliveryId: string): Promise<DeliveryObservation>;
  submit?(artifactId: string): Promise<Delivery>;
  comment?(deliveryId: string, body: string): Promise<void>;
  land?(deliveryId: string): Promise<void>;
}
```

GitHub, an internal review system, documents, experiments, and deployments can preserve their native identifiers while contributing normalized observations.

### Reconciliation

Hooks provide timely signals but can be lost. Polling authoritative systems repairs stale state. Every observation should include:

```text
source
observed_at
artifact_revision
confidence or authority
```

“Agent reported that tests passed” and “CI confirmed that revision 9 passed” are different facts. Validation must be bound to the artifact revision to which it applies.

Keep automated repair bounded by time, cost, and retry limits. Repeated failure or lack of meaningful progress should produce one clear escalation instead of an infinite agent loop.

## Build in complete vertical slices

### Phase 1: complete manual lifecycle

Implement stable tasks, quick capture, task rooms, hierarchy and relations, versioned briefs, manual session attachment, artifact links, re-entry briefs, the attention inbox, waiting reminders, and delivery contracts.

The entire path from vague idea to confirmed outcome should already work even if source updates are manual.

### Phase 2: eliminate bookkeeping

Add supported hooks, workspace and Git inspection, read-only review and CI adapters, reconciliation, automatic result packages, and generated daily briefs. Prioritize detection of this failure mode:

> A useful local result exists, but it has not been reviewed or submitted.

### Phase 3: bounded follow-up assistance

Add agent selection suggestions, compiled context packets, reviewer-feedback packets, workspace resumption, failed-check evidence, and limited retries. Keep permission-changing actions—submitting, contacting reviewers, landing, deploying—separate and policy-controlled.

### Phase 4: richer coordination

Add dependency-aware dispatch, milestones, multiple linked deliveries, cross-project search, shared context nodes, and adaptive concurrency only after the daily workflow is trustworthy.

## Acceptance scenarios for the first useful version

The first release should pass these practical tests:

| Scenario | Required behavior |
|---|---|
| An agent finishes and the user switches away | The task remains in the review or submit inbox |
| A reviewer responds three days later | The original task resurfaces with the comment, relevant revision, decisions, and workspace |
| The user changes agents | Task identity, accepted brief, decisions, artifacts, and delivery requirements remain intact |
| A session crashes | The task remains open; the run becomes failed or unknown; the workspace remains recoverable |
| A large task splits into independent work | Child tasks get their own owners and deliveries while preserving the parent outcome |
| The user returns after a week | The task room shows last verified progress, current blocker, next action, and evidence freshness |
| Several agents are active | The running view remains quiet while the inbox surfaces only actionable obligations |
| A run says it succeeded | The system does not mark the task delivered without satisfying its acceptance contract |

## The product promise

The design succeeds when the user can leave a task without keeping its state in working memory, and the system brings it back when the next action becomes theirs.

That promise changes the center of gravity:

```text
Not:  manage many agent conversations
But:  manage durable outcomes through many conversations and agents
```

Chats, models, terminals, worktrees, pull requests, and documents are all replaceable mechanisms. The durable task—and the evidence that it was truly delivered—is the product's source of truth.
