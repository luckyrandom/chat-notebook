---
title: Durable Task Supervision Kernel
description: A minimal task-first supervision architecture that separates task state from executor state and avoids assumptions about Git, specific coding agents, or terminal backends.
---

A useful lesson from First Mate is that durable supervision should be **task-first**. The system should preserve an obligation to produce an outcome even when the current agent, process, workspace, conversation, or delivery mechanism disappears.

The smallest reusable design is not a clone of First Mate. It is a **durable task supervision kernel** with a narrow domain model and pluggable execution and workspace adapters.

The kernel should not assume Git, pull requests, Codex, Claude, tmux, Herdr, or even that the executor is an LLM. Those are integrations below the core model.

## The core mechanism

The distinctive mechanism is a separation between durable responsibility, execution evidence, and derived state:

```text
                         Task
              "What outcome do we owe?"
                         |
                         | owns
                         v
                 ExecutionAttempt
            "Who is trying this time?"
                         |
              +----------+----------+
              v                     v
        ExecutorDriver        WorkspaceDriver
              |                     |
              | observations        | observations
              +----------+----------+
                         v
                    Observation
                 "What did we see?"
                         |
                         v
                    Reconciler
             "What do the facts imply?"
                    /           \
                   v             v
          ExecutionState       TaskState
         liveness/activity    obligation progress
                   \             /
                    \           /
                     v         v
                    AttentionState
               "Who needs to act now?"
                         |
                         v
                    Supervisor
```

Three rules preserve the architecture:

1. **Task identity is stable; executor attempts are replaceable.**
2. **Important communication and wakes are persisted before notification.**
3. **The supervisor reconciles current evidence before taking external action.**

This is the smallest part worth copying. Git worktrees, terminal panes, provider-specific APIs, CI systems, and pull requests are useful adapters, not the kernel itself.

## The six domain records

A minimal implementation can be built around six records.

### Task

A task is the durable obligation.

```ts
interface Task {
  id: string
  objective: string
  acceptanceCriteria: string[]
  constraints: string[]
  authority: Authority
  state: TaskState
}
```

The task answers: **what result is still owed?**

It should survive chat deletion, process crashes, executor replacement, workspace changes, and delivery delays.

### ExecutionAttempt

An execution attempt records one actor trying to advance a task.

```ts
interface ExecutionAttempt {
  id: string
  taskId: string
  executorKind: string
  handle: string
  workspaceId?: string
  state: ExecutionState
}
```

A task may have several attempts:

```text
Task 42
  |- Attempt 1 -> executor crashed
  |- Attempt 2 -> interrupted
  `- Attempt 3 -> produced an acceptable result
```

The important invariant is:

```text
executor failure != task failure
```

A dead worker means the current execution path failed or disappeared. It does not erase the obligation.

### Workspace

A workspace is where work happens. It must not mean "Git worktree" in the domain model.

```ts
interface Workspace {
  id: string
  kind: string
  locator: string
}
```

Possible implementations include:

- a Git worktree;
- an ordinary directory;
- a container;
- a remote VM;
- a browser sandbox;
- a database environment;
- a document or design file;
- no persistent workspace at all.

Optional capabilities can be attached independently:

```ts
interface ChangeTracking {
  inspectChanges(workspace: Workspace): Promise<ChangeSet>
}

interface Checkpointing {
  checkpoint(workspace: Workspace): Promise<Checkpoint>
  restore(checkpoint: Checkpoint): Promise<void>
}
```

Git is therefore one adapter that may implement workspace isolation, change tracking, and checkpointing. It is not part of Task itself.

### Message

Supervisor-to-executor communication must be durable.

```ts
interface Message {
  id: string
  taskId: string
  attemptId?: string
  direction: "to-executor" | "from-executor"
  body: string
  status: "stored" | "notified" | "acknowledged" | "answered"
}
```

These states must remain distinct:

```text
stored != notified != acknowledged != answered
```

A terminal keystroke, RPC ping, or push event is only a doorbell. The stored message is the source of truth.

Correct ordering is:

```text
persist message
    -> notify executor
```

not:

```text
notify executor
    -> hope the message was remembered
```

### Observation

Drivers report evidence rather than authoritative high-level state.

```ts
interface Observation {
  id: string
  taskId: string
  attemptId?: string
  source: string
  kind: string
  value: unknown
  observedAt: Date
}
```

Examples include:

```text
process_started
process_exited
heartbeat_received
terminal_output_changed
tool_started
tool_finished
executor_reported_idle
artifact_created
validation_passed
validation_failed
```

An observation is evidence, not necessarily a conclusion. `executor_reported_idle` does not prove that the executor is actually idle, just as silence for ten minutes does not prove a stall.

### Delivery

Execution completion and delivery completion are different obligations.

```ts
interface Delivery {
  taskId: string
  targetKind: string
  targetRef?: string
  requirements: string[]
  state: string
  evidence: Observation[]
}
```

A delivery target might be a pull request, a document, a deployed service, an experiment result, a database change, an uploaded artifact, or merely a retained local output.

The important separation is:

```text
executor succeeded
    != task accepted
    != result delivered
```

## Task state and executor state are separate state machines

A common mistake is to make the task status mirror the current agent status. That collapses two different questions.

Executor state asks:

> What is happening with this execution attempt?

Task state asks:

> How far are we from satisfying the durable obligation?

They should therefore be modeled independently.

### ExecutionState should be multidimensional

Avoid one overloaded field such as `status = working`.

A better model has at least three dimensions:

```ts
interface ExecutionState {
  liveness:
    | "unknown"
    | "starting"
    | "alive"
    | "exited"
    | "unreachable"

  activity:
    | "unknown"
    | "active"
    | "waiting"
    | "idle"
    | "possibly_stalled"

  outcome:
    | "none"
    | "succeeded"
    | "failed"
    | "cancelled"
}
```

This avoids misleading states. For example:

```text
liveness = alive
activity = waiting
outcome = none
```

is materially different from:

```text
liveness = exited
activity = idle
outcome = succeeded
```

### TaskState describes obligation progress

A minimal task lifecycle might be:

```text
pending
  -> in_progress
  -> blocked
  -> validating
  -> ready
  -> completed
```

with cancellation or terminal failure modeled explicitly when needed.

The mapping is not one-to-one.

An executor can be alive while the task is blocked because the worker needs a user decision. An executor can have exited successfully while the task remains `validating`. An executor can die while the task stays `in_progress` because the supervisor is starting a replacement attempt.

Therefore:

```text
TaskState = f(
  task obligations,
  execution attempts,
  observations,
  decisions,
  validation evidence,
  delivery evidence
)
```

Executor state is only one input.

## How to know executor state without pretending to know too much

The kernel should not directly ask, "What is the agent state?" as though one authoritative answer always exists.

Instead:

```text
Executor
   -> Driver
   -> Observations
   -> Reconciler
   -> ExecutionState
```

An executor-specific driver contributes facts it can actually observe.

A local process driver might report:

```text
process alive
last output at T
foreground tool = pytest
exit code
```

A remote runtime might report:

```text
heartbeat
run event stream
connection status
remote completion event
```

A terminal-based driver might report:

```text
pane exists
foreground process
terminal output changed
```

A human executor could report:

```text
checked in
message acknowledged
result submitted
```

The reconciler combines evidence and preserves uncertainty.

For example:

```text
process alive
no output for 8 minutes
foreground tool = pytest
```

should normally derive something like:

```text
liveness = alive
activity = active
```

not `stalled`.

But:

```text
process alive
no output for 30 minutes
no known foreground tool
no pending input
```

may justify:

```text
activity = possibly_stalled
```

with an explicit confidence or reason.

Self-reported agent status is useful evidence but should not automatically override contradictory process, tool, or transport evidence.

## Drivers provide facts; the supervisor owns semantics

The integration boundary can remain small.

```ts
interface ExecutorDriver {
  start(spec: ExecutionSpec): Promise<ExecutionHandle>
  observe(handle: ExecutionHandle): Promise<Observation[]>
  send(handle: ExecutionHandle, message: Message): Promise<void>
  stop(handle: ExecutionHandle): Promise<void>
}
```

```ts
interface WorkspaceDriver {
  create(task: Task): Promise<Workspace>
  observe(workspace: Workspace): Promise<Observation[]>
}
```

Optional adapters can provide validation, change tracking, delivery, checkpointing, or environment lifecycle.

The domain layer should not contain provider names such as Codex or Claude. A `CodexDriver`, `ClaudeDriver`, shell driver, remote agent driver, CI worker, or human adapter can all implement the same execution contract.

Likewise, Git, Docker, a remote host, or a plain directory can implement workspace capabilities without changing the task model.

## The watcher should be cheap and deterministic

The watcher exists to observe and persist evidence, not to reason continuously with an LLM.

```python
for attempt in active_attempts():
    observations = []
    observations += executor_driver.observe(attempt.handle)
    observations += workspace_driver.observe(attempt.workspace)
    observations += delivery_driver.observe(task.delivery)

    for observation in observations:
        store_if_new(observation)

    if may_require_attention(observations):
        persist_wake(task.id, observations)
```

Routine activity should remain quiet. Only potentially actionable evidence needs to wake the supervisor.

A wake must also be durable. Notification is a retryable hint, not the only record that attention is needed.

## The supervisor loop is the semantic core

The supervisor should wake on a durable event, user action, restart, or explicit schedule. Its ordering matters more than the sophistication of its planner.

```python
for wake in pending_wakes():
    task = load_task(wake.task_id)

    facts = reconcile(
        task=task,
        attempts=load_attempts(task.id),
        observations=load_recent_observations(task.id),
        messages=load_messages(task.id),
        delivery=load_delivery(task.id),
    )

    execution_states = derive_execution_states(facts)
    task_state = derive_task_state(task, facts)
    attention = derive_attention(task, facts)

    action = choose_next_action(task, facts, attention)

    persist_action_intent(action)
    apply_or_reconcile_external_effect(action)
    checkpoint()
    acknowledge(wake)
```

The durable ordering is:

```text
record before notify
reconcile before act
checkpoint before acknowledge
```

This does not magically create exactly-once behavior across arbitrary external systems. External effects still need stable operation identifiers, idempotency where possible, and reconciliation when the outcome is uncertain.

## Attention is a separate projection

Task lifecycle alone is not enough for supervision. The useful operational question is often:

> Who needs to act now?

A separate attention projection can be small:

```ts
type AttentionState =
  | "none"
  | "needs_executor"
  | "needs_supervisor"
  | "needs_user"
  | "needs_validation"
  | "needs_delivery"
```

Examples:

```text
Task: in_progress
Executor: alive / active
Attention: none
```

No model turn is needed merely because work is happening.

```text
Task: blocked
Executor: alive / waiting
Attention: needs_user
```

The worker needs a decision outside its authority.

```text
Task: in_progress
Executor: alive / possibly_stalled
Attention: needs_supervisor
```

Now supervision is warranted.

This is a better control-plane question than continuously asking whether every agent is "working."

## Minimal persistence

A small relational database is enough for a first implementation:

```text
tasks
execution_attempts
workspaces
messages
observations
deliveries
wakes
```

The records matter more than the database technology. SQLite is a natural local choice, but the architecture does not depend on it.

The first implementation does not need event sourcing, multiple terminal backends, remote deputies, automatic model routing, quota balancing, complex visual layouts, or fully autonomous merging.

It does need durable identity, evidence, and recovery semantics.

## The invariants to test

A minimal implementation should prove these behaviors before adding features:

1. **Conversation loss does not lose the task.** After restart, the system can still say what is owed, which attempts exist, what evidence is current, and what needs attention.
2. **Executor loss does not lose task ownership.** A replacement attempt can continue against the same task and workspace or a reconciled replacement workspace.
3. **Notification loss does not lose communication.** Stored messages and wakes remain pending even if a doorbell or push event disappears.
4. **Stale state does not cause blind duplicate action.** Before spawning, retrying, cancelling, or delivering, the supervisor reconciles live evidence.
5. **Executor completion does not imply task completion.** Acceptance and delivery obligations remain visible until independently satisfied.
6. **Integration details do not leak into the domain model.** Replacing Git, an agent provider, or a terminal backend should not require redesigning Task.

## Relationship to First Mate and the broader task-first design

This design extracts the supervision mechanics from [Firstmate: Durable Supervision Beyond Native Subagents](firstmate-durable-agent-supervision.md) and generalizes them beyond its concrete terminal, worktree, and harness conventions. The accompanying [Firstmate implementation and evidence note](firstmate-minimal-design-and-evidence.md) remains the source-oriented analysis of how that project implements its guarantees.

The broader [Task-First Operating System for Coding Agents](task-first-agent-manager.md) describes the product-level model: versioned briefs, task rooms, dependency graphs, delivery workflows, and an attention inbox. This note is narrower. It describes the **kernel underneath that product**: stable tasks, replaceable execution attempts, pluggable drivers, evidence reconciliation, and separate execution, task, and attention state.

The central design rule is simple:

> **Keep responsibility durable, execution replaceable, and state derived from evidence.**
