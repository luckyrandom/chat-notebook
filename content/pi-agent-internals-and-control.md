---
date: 2026-09-13
title: "Inside Pi: Minimal Agents, Extensibility, and Control"
description: Understand Pi's agent loop, context boundaries, extension system, and practical trade-offs against Codex, Claude Code, and T3 Code.
---

## The durable insight

**[Pi](https://github.com/earendil-works/pi)'s important idea is not a new agent algorithm. It is making the boundaries around an ordinary agent loop unusually easy to inspect, replace, and compose.** Its model connection, execution loop, session/context machinery, and interface are separate pieces. Its default coding vocabulary is small, but its extension surface reaches well beyond adding another tool.[^ai][^agent][^coding]

That distinction explains the appeal: someone can keep Pi's working terminal agent while changing how it chooses context, executes tools, stores application state, or presents a workflow—without immediately maintaining a fork. The trade-off is that more workflow and safety policy becomes the integrator's responsibility.[^extensions][^coding]

A useful shorthand is **minimal policy, not minimal engineering**. Read that as an interpretation of the design, not a claim that every part of Pi is small or that its choices always outperform alternatives.

### The core snippet: the boundary before every model call

This is source-shaped pseudocode. The conversion names are Pi's real interfaces; `streamModel`, `record`, and `executeWithPolicy` are explanatory placeholders, not additional Pi APIs.[^agent][^loop]

```typescript
// history is the agent's record, not necessarily the model's next input.
const selected = await transformContext(history, signal);
const messages = await convertToLlm(selected);

const reply = await streamModel({ systemPrompt, messages, tools });
record(reply); // Keep complete content, call IDs, and provider metadata.

// Inspect completion status before attempting any requested operation.
if (replyIsUsable(reply)) {
  const results = await executeWithPolicy(reply.toolCalls);
  record(results); // Each result refers to its original tool-call ID.
}
// A later turn can select a different view of the same recorded history.
```

The distinctive mechanism is the separation between **what happened** and **what should be shown to the model now**. Tool execution has another explicit boundary: validate arguments, apply pre-execution policy, execute, then process the result. The real implementation also handles streaming events, errors, cancellation, queues, ordering, and stopping.[^loop]

This gives us four different objects that should not be confused:

```text
Session history     = the recorded conversation and session entries
Model context       = the selected and converted input for one request
Workspace state     = files, processes, Git state, and other external effects
Task state          = goal, acceptance criteria, approvals, and delivery status
```

Pi supplies useful machinery for the first two. Neither a transcript nor a final assistant message automatically proves the last two are correct.

## What does a minimal agent actually require?

For the coding-agent case, the conceptual minimum is a model that can select actions, a description of available actions, an executor, an observation channel, and a loop that feeds observations into the next decision. Some state must survive between decisions. An instruction such as “fix this failing test” supplies a goal; it need not become an elaborate planning object.

```text
Goal + current observations
          ↓
Model chooses an action or a final answer
          ↓
Host executes an allowed action
          ↓
Result becomes a new observation
          └───────────────────────→ next decision
```

A tool request is not execution. The model might request `read("test.ts")`; the host actually reads the file. A shell command is not a successful repair either: its result must be inspected, and the relevant test may need to run again. This feedback cycle—not the number of agents or the presence of a planning dashboard—is the essential mechanism. OpenAI's Codex engineering explanation describes the same basic loop.[^codex-loop]

Structured function calling is Pi's chosen interface. Conceptually, a host could parse textual actions instead, but structured calls give the application a clearer contract. Pi's model library deliberately targets tool-capable models.[^ai]

A vector database, separate planner model, multiple agents, MCP connection, browser, or persistent memory service is **not required to demonstrate that loop**. These are possible capabilities and implementation choices, not the definition of an agent.

A reliable agent needs considerably more than the demonstration. It must preserve call/result correlation, reject malformed output, distinguish validation from authorization, bound work, handle cancellation, recover from context exhaustion, and record enough evidence to understand failures. Repeated external actions need their own deduplication or transactional design. Those are engineering requirements derived from allowing a probabilistic component to request real effects—not features that a small loop magically provides.

**The minimal conceptual agent and the minimum acceptable production system are different things.** Pi's implementation is worth studying precisely because it exposes much of the engineering around the simple loop.[^loop][^compaction]

## The architecture: choose how much Pi to adopt

| Layer | Main responsibility | When to use it directly |
| --- | --- | --- |
| [pi-ai](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/ai/README.md) | Model/provider abstraction, authentication resolution, streaming, message and tool formats, usage metadata. | You want to own the loop and only reuse model connectivity. |
| [pi-agent-core](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/agent/README.md) | Stateful execution loop, tool dispatch, events, context conversion, steering, and follow-up queues. | You want a reusable agent runtime with application-defined tools and policy. |
| [pi-coding-agent](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/README.md) | Coding tools, sessions, compaction, resource loading, extensions, and the application workflow. | You want Pi's working coding agent or its session SDK. |
| [pi-tui](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/tui/README.md) / interactive application | Terminal components, rendering, editor, and interaction. | You want the terminal experience, or want to customize it rather than build a new UI. |

These are integration boundaries, not four independent products that must all be imported by every application.[^ai][^agent][^coding][^extensions]

The distinction between the first two is especially valuable. A model library returns tool requests; an agent runtime decides how to process them. A custom application can reuse `pi-ai` without adopting Pi's loop, or reuse `pi-agent-core` without adopting the coding agent's terminal and built-in filesystem tools.[^ai][^agent]

At the application layer, Pi offers interactive operation, print/JSON output, an embedding SDK, and process integration through `pi --mode rpc`. RPC lets another language control a Pi process; it does not mean that caller now owns the inner execution algorithm. The SDK and lower-level packages provide different degrees of ownership.[^coding][^sdk][^rpc]

This is also why [using Pi's Codex provider](pi-codex-quota-custom-harness.md) is different from embedding Codex. Pi can reuse a model-service connection while running its own harness. A Codex app-server client instead controls a Codex runtime. Account access, model choice, and harness choice are separate decisions.[^codex-app]

## Why four default tools can accomplish so much

Pi exposes `read`, `write`, `edit`, and `bash` by default.[^coding] They form a compact working vocabulary:

| Tool | Role in the feedback loop |
| --- | --- |
| `read` | Inspect the code and evidence that matter next. |
| `edit` | Make a targeted change to existing text. |
| `write` | Create or replace an artifact. |
| `bash` | Reach the project's existing commands, tests, build tools, Git, and installed utilities. |

The shell is a compositional interface to a large existing environment. Pi does not need a bespoke “run this repository's test suite” integration when the repository already has a test command. Reading a command's documentation can supply the missing usage knowledge. This is the practical rationale behind the project's preference for command-line tools and skills rather than mandatory built-in MCP.[^coding]

**Four tools does not mean four capabilities, and it certainly does not mean four permissions.** A shell can launch other programs, modify many files, or access a network when the surrounding environment allows it. A small visible schema can hide an enormous action space.

The advantages are plausible rather than universal: fewer always-visible tool descriptions, reuse of existing developer tools, and less need to translate every workflow into a framework-specific integration. The costs are also real: commands can have fragile output, model-generated argument errors, hidden side effects, and weakly structured results. For a high-value operation, a narrow typed tool can be a better interface than arbitrary shell access.

For example, an application might replace unrestricted commands with `run_test_suite`, `read_task`, and `request_review`. The point of extensibility is not to preserve the four-tool set at all costs. It is to let the application decide which vocabulary and execution boundary fit its task.

A missing built-in plan mode does not prevent planning. A plan can live in a file. A missing built-in subagent manager does not prevent delegation. Those choices move workflow design into files, extensions, packages, or an external orchestrator.[^coding]

## Context and sessions: Pi's most useful design boundary

### Recorded history is not the next prompt

`AgentMessage` can include application-specific messages that do not directly fit a provider's message format. `transformContext` selects or changes the agent-level view; `convertToLlm` then translates that view into provider-compatible messages. This happens at the model-call boundary.[^agent][^loop]

As a design example, a task manager might record task-status events, UI notices, test results, and previous conversations. The model only needs the current acceptance criteria and selected evidence. The UI may still need the complete record. Encoding everything as model-visible chat would mix those responsibilities.

Pi's session format makes another useful distinction: a custom entry can persist extension state without entering model context, while a custom message can participate in the conversation. Storing something and showing it to the model are separate actions.[^session]

That is more powerful than merely saying “the system prompt is customizable.” It permits an application to construct context as a deliberate projection of its state. The integrator must still preserve required tool-call pairs and provider replay metadata; an arbitrary filter can make a conversation invalid.[^session][^loop]

### A session is a tree, not just a transcript

Pi's coding-agent sessions are JSONL records linked by `id` and `parentId`. A selected leaf determines the active conversation path. `/tree` navigates within that history; `/fork` creates another session from an earlier point, and `/clone` duplicates the active branch.[^session][^coding]

An illustrative experiment looks like this:

```text
Task and shared investigation
        ├── approach A → failure → useful lesson
        └── approach B → different implementation
```

The second approach does not have to include every unsuccessful step from the first. Pi can summarize the abandoned path when switching, preserving a lesson without replaying all the intermediate noise.[^compaction]

**Conversation branching is not filesystem rollback.** Files changed during approach A still exist unless some separate mechanism restores them. Pi's extension examples include Git checkpointing precisely because workspace restoration is an additional concern.[^extensions] Use an isolated worktree, checkpoint mechanism, or other explicit workspace policy when comparing branches.

### Compaction changes the working view, not the existence of history

The coding agent can compact proactively near its context limit or recover from overflow. It appends a summary entry with a retained-history boundary and rebuilds the next context from the summary plus recent messages. The original history remains available in the session file.[^coding][^compaction]

This is lossy compression. A summary may omit a constraint or compress away the evidence for a decision. The fact that the full transcript survives on disk does not mean the model is still receiving it.

For important workflows, my recommendation is to keep acceptance criteria, critical decisions, and verification results in explicit task records or files, then deliberately include the relevant state in context. Do not make a summarizer the only keeper of the task's meaning. This follows the same separation as the [task-first agent-manager design](task-first-agent-manager.md).

## Extensibility: access to behavior, not just more buttons

Pi has several customization mechanisms with different responsibilities.[^coding][^extensions]

| Mechanism | What changes |
| --- | --- |
| Project instructions / system prompt | General instructions and project conventions. |
| Prompt template | Reusable input text. |
| Skill | On-demand instructions and supporting resources for a particular activity. |
| Extension | Executable TypeScript that participates in the application's lifecycle. |
| Theme | Presentation. |
| Pi package | Distribution of extensions, skills, prompts, and themes through npm or Git. |

The extension mechanism is the deepest. A factory receives `ExtensionAPI`; it can register tools and commands, intercept input and tool events, alter context, customize compaction, contribute UI, persist state, and register providers. These are different intervention points, not synonyms for a plugin menu.[^extensions]

A source-shaped configuration sketch shows what that means at the lower-level runtime. The callback names on the right are application-owned implementations, not built-in policies. This is an architectural sketch, not a ready-to-run security wrapper.[^agent]

```typescript
const agent = new Agent({
  initialState: { model, systemPrompt, tools: applicationTools },
  streamFn: models.streamSimple.bind(models),
  transformContext: selectRelevantContext,
  convertToLlm: encodeApplicationMessages,
  beforeToolCall: checkApplicationPolicy,
  afterToolCall: processExecutionResult,
  shouldStopAfterTurn: checkHostStoppingPolicy,
});
```

The same runtime can support a read-only research assistant, a coding worker, or a review workflow because those policies are passed across explicit interfaces. This does not remove the need to implement them correctly.

At the coding-agent layer, extensions can reach even the provider request boundary. `before_provider_request` sees the serialized payload and can replace it. The documentation warns that payload-level changes need not match the system prompt reported by the higher-level context API. That is useful for protocol debugging, but it also means a high-level prompt display is not proof of the exact request sent.[^extensions]

This explains the “ask Pi to extend itself” experience. The agent can write an extension file; the user can inspect it and load or reload it. It is modifying executable application behavior, not training new model weights or proving that the generated code is safe. Auto-discovered extensions support `/reload`; factories and lifecycle cleanup still have to be correct.[^extensions]

The costs deserve equal attention. Extensions share a privileged process and can interfere through ordering, state, tool names, or incompatible assumptions. Frequent prompt/context changes may reduce provider cache reuse. A flexible boundary is useful only while the application preserves a coherent contract across it.

## Pi versus Codex, Claude Code, and T3 Code

The following is an architectural comparison, not a measured ranking of answer quality or interface polish.

| Product | What you are primarily adopting | Strong reason to choose it | Responsibility you retain |
| --- | --- | --- | --- |
| Pi | A coding harness plus reusable model, loop, and session components. | You want to shape context, tools, lifecycle, or workflow around your own design. | Extension maintenance, custom orchestration, and an appropriate execution/safety boundary. |
| Codex | OpenAI's coding runtime and its supported interfaces. | You want that runtime's behavior, security controls, and integrations, or want to control it through app-server. | Configuration, approvals, external task state, and any client/orchestration you build. |
| Claude Code | Anthropic's coding runtime, CLI, and Agent SDK. | You want its integrated agent behavior and built-in capabilities while extending through supported hooks, tools, skills, and SDK APIs. | Configuration, permission choices, integrations, and deployment responsibilities. |
| T3 Code | A control application around supported agent runtimes. | You want to manage agents across desktop, web, and mobile without replacing their inner loops. | Underlying provider setup, credentials, workspace ownership, and provider-specific limitations. |

The product boundaries are documented by the projects; the “strong reason” column is my interpretation of which problem each boundary best addresses.[^coding][^codex-app][^claude-sdk][^t3][^t3-architecture]

### User experience: one adjustable terminal versus integrated workflows

Pi's terminal makes model selection, context usage, tool output, steering, session navigation, and reloadable customization directly accessible. That is attractive when the terminal is already your working environment and you enjoy adjusting tools. It can be extra work when your main goal is to use a finished workflow rather than design one.[^coding]

Codex and Claude Code should not be reduced to “chat boxes that run commands.” Codex exposes a full runtime through app-server. Claude Code's SDK makes its loop and context management programmable in Python and TypeScript, alongside tools, permissions, sessions, hooks, skills, plugins, and subagents.[^codex-app][^claude-sdk]

T3 solves a different UX problem. Its current README lists Claude Code, Codex, Cursor, Grok Build, OpenCode, and Antigravity, with desktop, web, and mobile interfaces. It is no longer accurate to describe current T3 as merely a Codex-only UI. Pi is not in that verified support list, so this note does not claim an existing native T3–Pi integration.[^t3]

### Technology: who owns the inner loop?

With `pi-ai`, your application owns the loop. With `pi-agent-core`, you adopt Pi's loop and supply its policies. With the coding-agent SDK or RPC interface, you adopt more of Pi's session machinery.[^ai][^agent][^sdk][^rpc]

With Codex app-server, your application speaks a bidirectional protocol to a Codex runtime. Thread, turn, item, and approval events let you build a sophisticated controller; they do not turn the connection into a bare model API. Claude's Agent SDK similarly offers the agent machinery, while Anthropic's separate Client SDK is the lower-level route for implementing the loop yourself.[^codex-app][^claude-sdk]

T3's server owns provider processes and workspace operations. Its orchestration records intent and events, then runs side effects through separate workers. Its clients control that server rather than substituting their own files or credentials. This is valuable systems engineering, but it sits above the model/tool loop rather than replacing it.[^t3-architecture]

A durable task manager can therefore support different worker runtimes. That is a proposed architecture, not a claim that all of these combinations are available as ready-made integrations.

### Control: avoid the false “open versus locked” comparison

Codex is also open source. OpenAI documents model instructions, tools, context construction, and provider configuration in its engineering explanation. Claude Code has substantial hooks; those can control tool execution and modify supported inputs or outputs. Pi is not uniquely capable of customization.[^codex-loop][^claude-hooks]

The more useful question is: **which exact decision can be changed through a supported boundary, and which change would require owning more of the runtime?** Pi makes low-level model and agent packages, context projection, session behavior, and executable terminal extensions part of its design. Codex and Claude expose their own supported control surfaces with different contracts.

Nor does “own the harness” mean “control everything.” A provider still controls model behavior, account eligibility, service limits, and server-side processing. Switching the local loop cannot grant new account rights. In particular, Anthropic's SDK documentation restricts offering claude.ai login or subscription limits in third-party products without prior approval; an available connector or login implementation is not a blanket product entitlement.[^claude-sdk]

## More customization is not automatically more safety

There are three distinct controls:

**Loading control** decides whether project-local executable resources may load. Current Pi has project trust handling; untrusted project extensions are not simply loaded as though they were ordinary text.[^coding]

**Action policy** decides whether a requested operation is allowed. Pi offers tool hooks and custom executors, but does not impose a general built-in per-command permission-popup workflow. A prompt such as “never delete files” is not enforcement.[^coding][^extensions]

**Execution isolation** limits what the process can do even if a model or extension behaves incorrectly. Pi's documentation recommends an external container or an extension-based execution setup when that is needed. Extensions themselves execute with the user's system permissions.[^extensions][^coding]

These controls are not interchangeable. A trusted extension can still be buggy. A hook cannot constrain arbitrary code outside the path it intercepts. A shell-command substring blacklist is not a general sandbox. Removing `write` while leaving unrestricted `bash` does not create a read-only agent.

Codex has OS-enforced sandbox and approval configuration; the documented workspace mode restricts writes and normally disables command network access. Claude Code also documents OS-level filesystem and network sandboxing for Bash and its children, separately from its broader tool permission rules. Compare the actual configuration and scope—not product names or the mere presence of an approval dialog.[^codex-security][^claude-sandbox]

For a custom Pi worker, my recommendation is to start with narrowly scoped tools, separate credentials from the execution environment, and use real filesystem/network isolation for untrusted actions. Add explicit approval for external writes and publication. Keep project trust and extension review as additional controls, not substitutes.

## When should someone actually choose Pi?

Choose Pi when the thing you want to improve is **the harness itself**: context selection, a domain-specific tool vocabulary, session behavior, model routing, custom interaction, or execution policy. Its separated components make it a particularly useful implementation to study and adapt.[^ai][^agent][^extensions]

Prefer an established Codex or Claude Code workflow when the desired outcome is mainly to complete coding work with that runtime's existing behavior. Their programmability is substantial, so investigate the relevant SDK or hook before assuming a new harness is necessary.[^codex-app][^claude-sdk]

Prefer T3 when the principal problem is controlling supported agents and reviewing their work across interfaces or environments. T3's event-sourced orchestration and workspace ownership solve a different class of problem from changing the agent's inner context policy.[^t3][^t3-architecture]

For an engineer studying agent systems, my practical recommendation is **learn and experiment with Pi while keeping a productive native harness as a baseline**. There is no architectural requirement to replace every existing tool before benefiting from Pi.

“More extensible,” “more accurate,” “cheaper,” and “faster” are separate claims. This research establishes concrete extension mechanisms, not a universal win on the other three. A useful evaluation would use isolated copies of the same repository and tasks, comparable models where possible, matched permissions and budgets, and explicit correctness checks. Measure accepted outcomes, regressions, elapsed time, usage, and human intervention—not just how impressive the transcript looks. When models or features cannot be matched, label it a whole-product comparison rather than a harness-only experiment.

## Supporting detail: contracts that matter when building on Pi

### Tool concurrency and ordering

The inspected core defaults to **parallel tool execution**, not the sequential behavior described in some older material. It preflights sibling calls sequentially, then executes allowed calls concurrently. Completion events follow actual completion order; final tool-result messages retain the order of the assistant's original calls. If any tool in the batch declares `executionMode: "sequential"`, the whole batch becomes sequential.[^agent][^loop]

That design separates responsive progress reporting from stable transcript ordering. It does not infer arbitrary data dependencies. Two operations on the same file can still require serialization. A preflight hook must not expect to see results from a sibling that has not executed yet.[^extensions]

### Validation happens before extension mutation

The loop validates arguments before its pre-execution hook. At the coding-agent extension layer, `tool_call` can mutate `event.input`, and the documentation explicitly says those mutations are **not revalidated**. Later handlers see earlier mutations.[^loop][^extensions]

An extension that changes arguments therefore takes responsibility for preserving the tool's contract. Type annotations and a previous successful validation do not establish that the final executable input is valid or authorized. Policy-sensitive executors should validate their final inputs at the appropriate trust boundary.

### Incomplete responses must not trigger operations

If an assistant response ends because of the output length limit, the inspected loop treats its tool arguments as potentially truncated. It generates error results for the calls rather than executing them. Provider error or abort states also end the low-level run without normal tool dispatch.[^loop]

This is an example of important engineering hidden by a toy `while` loop. Receiving a syntactically recognizable tool-call prefix is not sufficient permission to execute it.

### Steering, stopping, and settlement are different

Steering is delivered at a turn boundary after the current assistant response's tool calls finish. Follow-up messages wait until the agent would otherwise stop. Cancellation is a separate operation; steering is not a guarantee that an already running command was interrupted.[^agent][^coding]

The runtime can stop after a completed turn through `shouldStopAfterTurn`. A terminating tool-result hint suppresses automatic continuation only when every finalized result in that batch is terminating; it is not a universal emergency-stop mechanism.[^agent][^loop]

At the coding-agent layer, `agent_end` ends a low-level run. Automatic retry, compaction, or queued work may still continue. `agent_settled` is the more appropriate integration signal for “no automatic continuation remains.” Even that is not “the task was accepted.” Waiting for user interaction has its own UI prompt events.[^extensions]

For an agent manager, keep activity, attention, outcome, and delivery as separate projections, as explained in [the status-observation note](how-agent-managers-know-codex-status.md).

### Persistence does not provide exactly-once external effects

Pi's session records preserve conversation and extension state, including structured tool results and provider metadata.[^session] That does not make a file write, payment, deployment, or remote API operation transactional with the transcript. A crash can occur after an external action succeeds and before its result is durably recorded.

For side-effecting application tools, use durable action identifiers, idempotency where the external system supports it, and explicit reconciliation before retrying. Do not equate replaying a session with safely replaying its effects.

T3 illustrates a related outer-layer design: command intent, events, projections, and receipt are committed together, while reactors perform external effects afterward. Its documentation explicitly distinguishes an acknowledged command from completed work.[^t3-architecture]

### Model portability has limits

Pi normalizes model connections and messages, but providers still differ in supported content, reasoning metadata, context limits, tool behavior, and transport details. Preserve complete messages and treat provider-specific signatures as opaque metadata, not ordinary text to reconstruct.[^ai][^session]

Switching models can be useful, but it need not preserve identical behavior or cache reuse. Similarly, rewriting context on every turn may improve relevance while losing stable cached prefixes. Optimize against observed outcomes and usage rather than assuming that fewer messages or more frequent model switching always reduces cost.[^codex-loop]

### Extensions require operational discipline

Extensions can start resources, intercept events, persist state, and affect later handlers. Their documentation recommends starting session-scoped background resources from the relevant lifecycle event rather than unconditionally in the factory, and cleaning them up idempotently on shutdown. Session changes and reloads require careful state reconstruction.[^extensions]

Pin and review executable packages. Keep important policy outside a model's editable prompt. Also avoid outdated privacy claims: the inspected Pi version documents an anonymous install/update telemetry ping separately from update checks, with separate controls. A local terminal interface does not imply that inference or all supporting operations stay offline.[^coding]

## Read the source in this order

The following path is more useful than reading the monorepo from top to bottom. All Pi references below target the pinned revision.

| Read | Question it answers |
| --- | --- |
| [packages/agent/src/agent-loop.ts](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/agent/src/agent-loop.ts) — especially `runLoop`, `streamAssistantResponse`, and tool execution helpers.[^loop] | What causes another model call, when can tools run, and how are results ordered? |
| [packages/agent/README.md](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/agent/README.md).[^agent] | What can an application configure without adopting the coding UI? |
| [packages/ai/README.md](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/ai/README.md).[^ai] | Where does model connectivity end and application execution begin? |
| Coding-agent session format and compaction documentation.[^session][^compaction] | How does persistent history become a bounded working context? |
| Coding-agent extension documentation.[^extensions] | Which behaviors can be changed in-process, and what are the ordering and privilege consequences? |
| Coding-agent SDK and RPC documentation.[^sdk][^rpc] | Should the host embed Pi or supervise a separate Pi process? |
| T3's architecture and provider-boundary documentation.[^t3-architecture][^t3-providers] | Which responsibilities belong above the agent loop? |

The main lesson survives changes in individual APIs: **choose the layer whose policy you actually need to own.** A better model client, a better agent loop, and a better agent manager solve different problems.

## References

````{dropdown} Research scope, revision, and methodology
**Reviewed:** September 13, 2026, America/Los_Angeles.

**Scope:** Pi, the TypeScript coding-agent project now hosted at [earendil-works/pi](https://github.com/earendil-works/pi). The original question's “PyAgent,” “Cloud Code,” and “T3” are interpreted as Pi, [Claude Code](https://code.claude.com/docs/en/agent-sdk/overview), and [T3 Code](https://github.com/pingdotgg/t3code). This is not a review of an unrelated Python framework named PyAgent. Pi implementation references are pinned to [commit 71dca87](https://github.com/earendil-works/pi/commit/71dca871bc80b6bc97be37f0ca3189399d651fff); competitor documentation was checked on the review date. This is source-based architectural research, not a hands-on usability study or a controlled performance benchmark.
````

[^ai]: Pi, [model-library README](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/ai/README.md). Provider collections, tool-capable models, streaming, authentication, message handling, and cross-provider integration.

[^agent]: Pi, [agent-core README](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/agent/README.md). Context transforms, configurable execution, event settlement, queues, hooks, and stopping behavior.

[^loop]: Pi, [agent-loop implementation](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/agent/src/agent-loop.ts). Source inspection covered the main loop, request construction, truncated-response handling, sequential/parallel execution, argument validation, and termination aggregation.

[^coding]: Pi, [coding-agent README](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/README.md). Four default tools, application modes, terminal interaction, sessions, project trust, customization, telemetry controls, and design philosophy.

[^extensions]: Pi, [extension documentation](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/docs/extensions.md). Executable extension API, lifecycle events, context and provider hooks, mutable tool inputs, result processing, settlement signals, and security warnings.

[^session]: Pi, [session format](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/docs/session-format.md). JSONL trees, message metadata, model changes, compaction entries, and custom state entries.

[^compaction]: Pi, [compaction and branch summarization](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/docs/compaction.md). Retained boundaries, summaries, call/result integrity, and branch-context transfer.

[^sdk]: Pi, [coding-agent SDK documentation](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/docs/sdk.md). Further reading for the embedding route documented in the coding-agent README.

[^rpc]: Pi, [RPC documentation](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/docs/rpc.md). Further reading for the process-integration route documented in the coding-agent README. Pi's framing and command schema are not interchangeable with Codex app-server.

[^codex-loop]: OpenAI, [Unrolling the Codex agent loop](https://openai.com/index/unrolling-the-codex-agent-loop/), January 23, 2026. Engineering explanation of the model/tool loop, instructions, provider interfaces, and cache-sensitive context construction. Historical implementation details are not treated as a complete September feature inventory.

[^codex-app]: OpenAI, [Codex app-server documentation](https://learn.chatgpt.com/docs/app-server), accessed September 13, 2026. Bidirectional runtime control, threads, turns, items, and approvals.

[^codex-security]: OpenAI, [Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security), accessed September 13, 2026. Sandbox, approval, and network-control boundaries.

[^claude-sdk]: Anthropic, [Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview), accessed September 13, 2026. The SDK versus the Client SDK, reusable Claude Code capabilities, and the third-party subscription-login restriction.

[^claude-hooks]: Anthropic, [hooks reference](https://code.claude.com/docs/en/hooks), accessed September 13, 2026. Supported interception, tool decisions, and input/output modification contracts.

[^claude-sandbox]: Anthropic, [sandboxing](https://code.claude.com/docs/en/sandboxing), accessed September 13, 2026. Bash-process filesystem/network isolation and its distinction from tool permission rules.

[^t3]: T3 Code, [README](https://github.com/pingdotgg/t3code/blob/main/README.md), accessed September 13, 2026. Current supported runtimes and desktop/web/mobile control surfaces. This source is a moving branch, not a permanently pinned feature list.

[^t3-architecture]: T3 Code, [architecture overview](https://github.com/pingdotgg/t3code/blob/main/docs/internals/overview.md), accessed September 13, 2026. Workspace ownership, shared client runtime, durable command intent, transactional projections, reactors, and checkpoint boundaries.

[^t3-providers]: T3 Code, [provider constraints](https://github.com/pingdotgg/t3code/blob/main/docs/internals/providers.md), accessed September 13, 2026. Provider-specific protocols, permissions, account isolation, and capability limits.
