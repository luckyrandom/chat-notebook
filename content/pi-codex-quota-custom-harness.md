---
date: 2026-09-12
title: How Pi Uses Codex Quota Without the Codex Harness
description: Reuse ChatGPT-backed Codex access through Pi's model provider while owning the agent loop, tools, task state, and execution policy.
---

**Reviewed:** September 12, 2026, America/Los_Angeles.  
**Scope:** Pi's `openai-codex` provider and the integration boundary for a new custom agent. Implementation references are pinned to Pi commit `71dca871bc80b6bc97be37f0ca3189399d651fff`; the accompanying example targets `@earendil-works/pi-ai@0.85.1`. This is source-based research, not a live authentication or quota-consumption experiment.

## Key idea

**Pi can use ChatGPT-backed Codex access without running the Codex agent.** Its model library implements ChatGPT OAuth and the Codex Responses transport directly. Pi's own runtime supplies the instructions, conversation, tools, and model-to-tool loop above that connection.[^provider][^transport][^agent-loop]

The reusable boundary is therefore:

```text
Your task system and agent harness
    ├── instructions and context construction
    ├── tool validation, permissions, and execution
    └── persistence, scheduling, and stopping policy
                 ↓
pi-ai: openai-codex provider
    ├── ChatGPT OAuth and token refresh
    └── Codex Responses request/response transport
                 ↓
OpenAI backend: model execution and account usage enforcement
```

This differs from [T3's Codex integration](how-t3-code-uses-codex.md), where an application controls a Codex runtime through app-server. **Reusing subscription access and reusing an agent runtime are separate decisions.**

## The core snippet

The distinctive technique is to reuse Pi's **model provider**, not necessarily its agent runtime. The following is core pseudocode using real Pi API names. `credentialStore`, `loginUI`, `context`, and `executeAllowedTool` are application-owned components, not hidden Pi APIs. The [complete demonstration](assets/pi-codex-harness-demo.mts) supplies the login interaction and a read-only synthetic task tool.[^pi-ai][^credentials]

```typescript
const models = createModels({ credentials: credentialStore });
models.setProvider(openaiCodexProvider());

// Run once when sign-in is needed; subsequent calls resolve and refresh auth.
await models.login("openai-codex", "oauth", loginUI);
const model = models.getModel("openai-codex", selectedModelId);
if (!model) throw new Error("Unknown model");

async function run(context) {
  for (let step = 0; step < MAX_REQUESTS; step++) {
    const reply = await models.completeSimple(model, context, {
      sessionId, transport: "sse", signal, maxRetries: 0,
    });

    // Do not execute calls from truncated, failed, or interrupted output.
    if (reply.stopReason !== "stop" && reply.stopReason !== "toolUse") {
      throw new Error(reply.errorMessage ?? reply.stopReason);
    }
    context.messages.push(reply); // Preserve the whole message, not just text.
    const calls = reply.content.filter(b => b.type === "toolCall");
    if (calls.length === 0) return reply;

    for (const call of calls) {
      const args = validateToolCall(context.tools, call);
      // Authorize, execute, and return a correctly correlated toolResult.
      context.messages.push(await executeAllowedTool(call, args, signal));
    }
  }
  throw new Error("Task request budget exhausted");
}
```

Everything inside `run` is the new harness. There is no Codex subprocess. There is also no requirement to import Pi's coding-agent application or `pi-agent-core` merely to obtain this model connection.[^provider][^pi-ai]

The essential invariants are that tool arguments are validated before execution, each result retains the original call ID, failed or truncated output cannot trigger tools, and complete assistant messages survive into the next request. The pseudocode omits routine interaction and error-result plumbing; the linked demonstration includes them.

## Three things commonly called Codex

| Layer | Responsibility | What a Pi-based custom harness reuses |
| --- | --- | --- |
| Model backend | Interpret context and return text, reasoning metadata, or tool calls. | The authenticated Codex model-service connection. |
| Agent harness | Select context and tools, execute authorized calls, and decide what happens next. | Optional: reuse Pi agent-core, or implement this layer yourself. |
| Account entitlement | Decide whether access is allowed and which allowance or billing path applies. | ChatGPT-backed access through the account's OAuth credential. |

Pi separates its model library, agent runtime, and coding-agent application. OpenAI separately documents ChatGPT sign-in for subscription access and API-key sign-in for Platform billing.[^pi-ai][^agent-core][^auth]

Consequently, the same model and account do not imply the same agent behavior. Different prompts, tools, compaction, execution policies, and stopping rules can change outcomes. That is an architectural inference, not a claim that either harness is universally better.

## How Pi authenticates and sends requests

### OAuth belongs to Pi's provider

Pi's coding-agent interface documents ChatGPT/Codex login, stores its credentials in `~/.pi/agent/auth.json`, and refreshes them automatically. A custom application using only `pi-ai` supplies its own credential store; the library's default is in-memory. It does not automatically inherit the coding-agent application's storage merely because both use Pi packages.[^coding-agent][^pi-ai]

The implementation in `packages/ai/src/auth/oauth/openai-codex.ts` performs an authorization-code flow with PKCE and state checking. It also offers a device-code path for headless sign-in.[^oauth]

```text
Authorization:  https://auth.openai.com/oauth/authorize
Token exchange: https://auth.openai.com/oauth/token
Local callback: http://localhost:1455/auth/callback
Scopes:         openid profile email offline_access
```

The browser flow opens an authorization URL containing a PKCE challenge and state. Pi receives a callback or manual authorization input, exchanges the code with its verifier, and obtains access/refresh credentials and an expiry. Later, the refresh token is exchanged at the token endpoint. The provider passes the access token to its request implementation.[^oauth]

**This does not turn a ChatGPT subscription into an ordinary OpenAI API key.** Pi's `openai-codex` provider is distinct from its ordinary `openai` provider. The former registers OAuth-backed subscription access and a ChatGPT backend URL; OpenAI's ordinary API-key path has separate billing semantics.[^provider][^auth]

### The request goes directly to the Codex backend

For HTTP streaming, the inspected adapter resolves its endpoint to:

```text
POST https://chatgpt.com/backend-api/codex/responses
```

A reduced wire-level sketch shows the important parts:

```http
Authorization: Bearer <ChatGPT OAuth access token>
chatgpt-account-id: <account identifier>
originator: pi
OpenAI-Beta: responses=experimental
Content-Type: application/json
Accept: text/event-stream
```

```json
{
  "model": "<supported model ID>",
  "instructions": "<your harness's instructions>",
  "input": [],
  "tools": [],
  "store": false,
  "stream": true,
  "include": ["reasoning.encrypted_content"],
  "prompt_cache_key": "<session identifier>"
}
```

Here `input` stands for the encoded conversation and tool results, and `tools` for the harness's tool schemas. The adapter extracts the account identifier from the access-token claims and assembles the request headers. The account credential authorizes access; `originator` is client metadata, not a quota-granting switch.[^transport]

This sketch is **not a complete substitute for the adapter**. The source includes message and tool conversion, streamed event handling, response-status checks, timeouts, and retry/error classification. It also supports WebSockets, connection reuse, and connection-scoped continuation, with fallback handling. A session identifier assists caching and transport affinity; it is not a replacement for durable application state.[^transport][^pi-ai]

The inspected backend path requires `store: false`. That request flag alone is not a complete privacy or retention guarantee. Apply the relevant service and account policies, and keep credentials out of model-visible context.

### The harness executes the tools

The backend returns a tool request, not a completed local filesystem operation. Pi's own agent loop collects tool calls, executes its registered tools, appends the results, and requests another model response. It explicitly avoids executing potentially truncated tool arguments after a length-limited response.[^agent-loop]

That separation is what permits a custom tool such as `read_task`, `request_review`, or `run_evaluation` without adopting Codex's shell wrapper, editing tools, or execution loop. The new application must still enforce authorization itself.

## What using Codex quota actually means

The request uses ChatGPT-backed Codex access rather than separately billed Platform credentials. It does not create a new allowance for each application or worker. OpenAI documents API-key usage as a distinct billing path, and its current usage documentation describes an account allowance rather than a fixed charge per conversational turn.[^auth][^usage]

Usage varies with factors including the model, task, context, reasoning, tools, and execution mode. The September 12 documentation also describes a shared allowance and credit pool across Codex, ChatGPT Work, ChatGPT for Excel, and Workspace Agents where those features are available; ordinary Chat is not part of that pool.[^usage]

Keep three measurements separate:

```text
Request token usage       → diagnostics and optimization
Account allowance/reset   → authoritative account/backend information
Application task budget   → a limit enforced by the custom harness
```

Do not compute an exact remaining subscription percentage from token counts or Pi's estimated API-price cost field. Such estimates are not the account's billing ledger. Avoid promising a fixed message allowance in an implementation note; the live account display and current plan rules are authoritative.

For applications already using Codex app-server, OpenAI documents `account/rateLimits/read` and `account/rateLimits/updated`. Those are app-server operations, not methods automatically exposed by Pi's `Models` collection.[^app-server]

Pi's inspected provider labels its login “ChatGPT Plus/Pro.” That label should not be treated as an exhaustive current eligibility rule: OpenAI's current documentation describes Codex availability across plans, with differing limits. Whether a particular Pi request and model are accepted remains a backend entitlement decision.[^provider][^usage]

## Choose the integration boundary deliberately

| Goal | Starting point | Who owns the inner agent loop? |
| --- | --- | --- |
| A custom UI, task manager, or orchestrator around Codex | Codex app-server or an appropriate Codex SDK | Codex. |
| A new harness with its own tools, context, and stop policy | `pi-ai` plus `openaiCodexProvider()` | Your application. |
| A custom application that accepts Pi's loop semantics | `pi-ai` plus `pi-agent-core` | Pi's reusable runtime, configured by your application. |
| Independent authentication and transport implementation | Reimplement the inspected protocol | Your application, including protocol maintenance. |

The official TypeScript Codex SDK wraps the CLI and exchanges JSONL events with a subprocess; it is an interface to the Codex runtime, not just a low-level model client. App-server exposes richer bidirectional account, thread, turn, event, and approval interactions. Pi agent-core instead offers its own reusable loop, context transforms, steering, and tool/lifecycle events.[^sdk-readme][^app-server][^agent-core]

A Codex SDK call can be as small as:

```typescript
const codex = new Codex();
const thread = codex.startThread({
  workingDirectory: process.cwd(),
  sandboxMode: "read-only",
  approvalPolicy: "never",
});
const result = await thread.run("Explain this repository without changing files.");
```

This excerpt uses `Codex` from `@openai/codex-sdk`. Authenticate the Codex environment with ChatGPT sign-in rather than injecting an API key when subscription-backed access is intended. See the [T3/Codex note](how-t3-code-uses-codex.md) for complete setup and the SDK-versus-app-server distinction.[^sdk-readme][^auth]

For a task-first system, keep both adapters available: a custom Pi-backed harness when the execution strategy is the feature, and a Codex worker when Codex's existing behavior is useful. The durable task should not be tied to either runtime.

## Requirements beyond the demonstration

### Serialize credential refresh

Pi's `CredentialStore` has `read`, metadata-only `list`, `modify`, and `delete` operations. `modify` is a serialized read-modify-write path, and OAuth refresh runs inside it. Correct persistent implementations must coordinate concurrent workers and, when applicable, processes so they do not race to refresh a rotated token.[^credentials]

A practical design is a single credential owner per account with controlled access for workers. Do not copy one refresh token into several independently refreshing stores. Protect persistence with appropriate permissions, atomic updates, and locking or a transactional secret store. Never expose tokens to model tools, transcripts, telemetry, or browser-delivered application bundles.

### Enforce permissions outside the prompt

Reusing Pi's provider does not import Codex's sandbox. The custom application owns the executor. Start with a narrow read-only tool set; place shell and filesystem tools behind explicit policy and process/container isolation. Treat tool arguments and retrieved content as untrusted inputs.

A tool description or system instruction is not an authorization boundary. Keep the credential manager outside the tool execution environment, and separate approval to inspect a resource from approval to modify or publish it.

### Preserve complete messages and execution records

Pi's message types carry tool-call IDs and provider-specific replay metadata, including opaque reasoning signatures. Persist complete assistant and tool-result objects rather than only visible text. Preserve opaque metadata for provider continuation; do not attempt to interpret encrypted reasoning as readable content.[^message-types]

Persist tool execution records before continuing the model loop. Retrying a failed model request must not silently repeat a side-effecting tool action. Use stable action identifiers and deduplication or transactional execution where needed.

### Keep task state separate from conversation state

The task system should own the goal, acceptance criteria, dependencies, approvals, artifacts, and next action. An agent session should own its transcript, execution events, model selection, and usage measurements. Compile model context from those records instead of making the transcript the only place where completion is defined.

This is the same separation developed in [the task-first agent-manager design](task-first-agent-manager.md): a run can finish while delivery and acceptance remain incomplete.

### Make limits and billing explicit

Set per-task request and time budgets, cancellation behavior, output limits, and action limits. Distinguish transient connection failures from an exhausted allowance. Do not rotate identities or retry indefinitely to defeat backend enforcement.

Treat subscription access and Platform API billing as separate configured modes. A fallback that can incur API charges should follow explicit application/user policy, never silently activate because subscription access failed.

## Support and maintenance boundary

OpenAI's Codex for Open Source page explicitly names Pi among tools developers may prefer in a program offering ChatGPT Pro with Codex. This is evidence that third-party tooling is contemplated; it is not a blanket integration agreement or a guarantee that every direct backend detail is a stable public API.[^oss]

The OAuth module contains a public client identifier and fixed login configuration. Those are source facts, not proof that an unrelated application has an independently registered OAuth integration. A successful request likewise does not establish permission to pool personal credentials or resell access. Confirm the supported authentication, account, and billing arrangement for a distributed multi-user product.

For a personal/local custom harness, the practical recommendation is to reuse Pi's maintained provider, pin the package version, and keep protocol code behind a small adapter. Reimplement OAuth, SSE, WebSocket continuation, and message replay only when there is a concrete reason to own that maintenance.

## Run the supporting example

The [TypeScript demonstration](assets/pi-codex-harness-demo.mts) prints the provider's model catalog, asks for a model ID, performs interactive browser or device-code login, and runs a bounded loop around the synthetic read-only `DEMO-1` task. Its credential store is deliberately in-memory, so each process authenticates again.[^pi-package][^pi-ai]

In a separate demonstration directory, save the linked file and run:

```bash
npm init -y
npm install --save-exact @earendil-works/pi-ai@0.85.1
npm install --save-dev tsx
npx tsx pi-codex-harness-demo.mts
```

Use Node.js 22.19 or newer, matching the inspected package requirement. Choose a catalog model that is available to the signed-in account; a catalog entry is not a promise of entitlement. The example uses SSE for a simpler transport path and disables automatic request retries. It has no shell tool, no filesystem tool, and no repository-writing capability.[^pi-package][^provider]

**Verification boundary:** the example was reviewed against the inspected source interfaces. A live OAuth exchange, real model request, token refresh, and observed quota decrement were not performed in this research. Repository/MyST checks validate publication, not subscription access or the example's live service behavior.

## Source map

| Source | What to inspect |
| --- | --- |
| Pi provider factory[^provider] | `openaiCodexProvider`: provider ID, base URL, and subscription-backed OAuth registration. |
| Pi OAuth module[^oauth] | Authorization-code/PKCE flow, device-code login, token exchange, and refresh. |
| Pi Codex transport[^transport] | `buildRequestBody`, URL/header construction, SSE, WebSockets, and response/error handling. |
| Pi credential types[^credentials] | Serialized storage contract and separation of refresh from request auth. |
| Pi agent loop[^agent-loop] | Model response, validated tool execution, continuation, and truncated-output handling. |
| Pi library documentation[^pi-ai] | Provider collections, login interaction, model calls, message types, and migration guidance. |
| OpenAI authentication and usage docs[^auth][^usage] | Subscription-versus-API billing and current account allowance semantics. |
| Codex SDK and app-server docs[^sdk-readme][^app-server] | Interfaces that reuse the Codex runtime instead of replacing its inner loop. |

[^provider]: Pi, [`packages/ai/src/providers/openai-codex.ts`](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/ai/src/providers/openai-codex.ts).
[^transport]: Pi, [`packages/ai/src/api/openai-codex-responses.ts`](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/ai/src/api/openai-codex-responses.ts).
[^agent-loop]: Pi, [`packages/agent/src/agent-loop.ts`](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/agent/src/agent-loop.ts).
[^pi-ai]: Pi v0.85.1, [`packages/ai/README.md`](https://github.com/earendil-works/pi/blob/v0.85.1/packages/ai/README.md). The current collection/provider API should not be mixed with older global-API examples without checking the migration section.
[^credentials]: Pi v0.85.1, [`packages/ai/src/auth/types.ts`](https://github.com/earendil-works/pi/blob/v0.85.1/packages/ai/src/auth/types.ts).
[^agent-core]: Pi, [`packages/agent/README.md`](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/agent/README.md).
[^auth]: OpenAI, [Authentication](https://learn.chatgpt.com/docs/auth), checked September 12, 2026.
[^coding-agent]: Pi, [`packages/coding-agent/README.md`](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/README.md).
[^oauth]: Pi, [`packages/ai/src/auth/oauth/openai-codex.ts`](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/ai/src/auth/oauth/openai-codex.ts).
[^usage]: OpenAI, [Using Codex with your ChatGPT plan](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan), checked September 12, 2026. Plan availability, shared pools, rates, and limits are time-sensitive.
[^app-server]: OpenAI, [Codex App Server](https://learn.chatgpt.com/docs/app-server), especially authentication, account operations, and rate-limit reporting; checked September 12, 2026.
[^sdk-readme]: OpenAI Codex, [TypeScript SDK README](https://github.com/openai/codex/blob/c4017a87aacc7558002b7cb510025e967c1d765e/sdk/typescript/README.md). The TypeScript SDK is the subprocess/JSONL integration discussed here, not a claim about every SDK language.
[^message-types]: Pi v0.85.1, [`packages/ai/src/types.ts`](https://github.com/earendil-works/pi/blob/v0.85.1/packages/ai/src/types.ts).
[^oss]: OpenAI, [Codex for Open Source](https://developers.openai.com/community/codex-for-oss), checked September 12, 2026.
[^pi-package]: Pi v0.85.1, [`packages/ai/package.json`](https://github.com/earendil-works/pi/blob/v0.85.1/packages/ai/package.json).
