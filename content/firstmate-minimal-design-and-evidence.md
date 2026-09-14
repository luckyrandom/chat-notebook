---
title: "Firstmate: Minimal Design and Evidence Companion"
description: A source map, durable messaging and recovery protocols, a staged implementation plan, and failure tests for adopting Firstmate's core ideas without its entire distribution.
---

This supports [Firstmate: Durable Supervision Beyond Native Subagents](firstmate-durable-agent-supervision.md). The main note explains the workflow, native-agent comparison, and Herdr boundary. This companion preserves the engineering details needed to evaluate or reimplement the idea.

**Evidence scope:** Firstmate commit [`b182d0f908b78d08c7ccb8dce3775bdca8c5d657`][commit], inspected September 13, 2026. Selected source sections and repository contracts were read, along with official Codex and Claude documentation. Large scripts were not exhaustively audited. Firstmate, Herdr, and the upstream regression suites were not executed for this research. No runtime dependency percentage, token-savings figure, throughput comparison, or reliability rate was measured.

The designs and pseudocode below are **proposals**, not a claim that the upstream repository uses these exact schemas or APIs.

## A small implementation boundary

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

## The data model: tasks outlive runs

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

## The messaging snippet: durable payload, disposable doorbell

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

## State is a projection of evidence, not the latest line

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

## Recovery is a reconciliation operation

A lightweight recovery pass should acquire the appropriate ownership lock, load the recorded task and current attempt, and inspect the exact endpoint and workspace. Reattach when the worker is genuinely alive. When it is positively dead, preserve unlanded work and establish that a replacement can safely own it. When liveness or identity is unknown, preserve the task and surface the uncertainty.

Creation itself needs a recovery story. There is a crash window between requesting a terminal/worktree and storing its returned identity. Persist a launch operation before allocation and make allocation discoverable or idempotent. When the response is lost, reconcile the operation's exact resources rather than blindly create another worker. Firstmate's spawn contracts include task-scoped serialization and guarded endpoint recovery; its Herdr presentation journals illustrate both the value and the complexity of explicit creation identity. [Sources: spawn contract][spawn], [Herdr setup and presentation][herdr]

Delivery checks must bind to the intended revision. A green check on an earlier head is not proof about a later commit. Similarly, a permission to merge one scoped change should not silently become authority to merge a changed, unreviewed head. Firstmate records the PR head when arming the delivery check and assigns current validation ownership to the attributed run. [Source: validation and PR-ready lifecycle][lifecycle]

The minimal design should prefer **at-least-once attention with deduplicated handling** over losing an event. It should not promise exactly-once external side effects. Unknown state is a first-class result, not another spelling of dead, failed, or safe to delete.

## What Herdr would change in this minimal design

Adding Herdr replaces or extends the terminal adapter, not the task planner. Keep the shared contract small: create an endpoint, capture bounded output, deliver a notification, observe activity and process liveness, perform supported control operations, and dispose of a proven-owned idle endpoint when authorized.

The selected backend must be recorded on each task; later configuration changes must not reroute an existing task to another backend. A selected-backend failure should remain a failure, not silently trigger a fallback that creates a duplicate worker. These are explicit boundaries in Firstmate's selector and spawn contracts. [Sources: backend abstraction][backend], [spawn refusal rules][spawn]

Native push is an optimization. Firstmate's protocol-16 path subscribes before reconciling current status, buffers transitions during that reconciliation, and keeps polling every cycle. This avoids relying entirely on edges that could have occurred before the subscription. Implementing only an event listener without a current-state reconciliation path would lose part of the design. [Source: push and polling contract][herdr-events]

Do not adopt the remote-secondmate requirement accidentally. In the audited Firstmate mode, the remote deputy uses Herdr. Supporting remote workers with a different transport in a new manager is a new design and verification obligation, not a capability demonstrated by Firstmate's tmux path. [Source: backend setup][herdr]

## Failure tests before trusting a small manager

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

## Source map for further reading

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
