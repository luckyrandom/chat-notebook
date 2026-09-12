---
title: How T3 Code Uses Codex and ChatGPT Authentication
description: A source-grounded guide to T3's Codex app-server integration, official SDK alternatives, credential ownership, and the smallest useful client examples.
---

**Reviewed:** September 11, 2026, America/Los_Angeles.  
**Scope:** T3 Code (`pingdotgg/t3code`), not T3 Chat. The implementation discussion is pinned to T3 commit `4a4c6dd2adc350a68ba18bb28b24b5a7e4660dab` and Codex commit `c4017a87aacc7558002b7cb510025e967c1d765e`. These are source snapshots, not claims about the version installed on a particular machine.

## Key idea

T3 Code's interactive Codex integration launches the installed **`codex app-server`** and talks to it through a typed local client. The inspected session launcher supplies a working directory, process environment, launch arguments, and optionally `CODEX_HOME`. It does not construct model-service bearer-token requests itself. Codex resolves its own authentication and performs the upstream model requests.[^runtime][^client][^bearer]

The reusable pattern is therefore **“control an authenticated Codex runtime,” not “extract a ChatGPT token and call the web chat.”**

```text
T3 Code frontend
    ↓
T3 server: provider driver → adapter → session runtime
    ↓  local bidirectional JSON messages over stdin/stdout
codex app-server
    ├─ conversation state, agent execution, tools, and approvals
    ├─ Codex-managed authentication and credential refresh
    └─ authenticated requests to the selected model provider
```

The local process is an agent runtime, not a local copy of the hosted language model. Its upstream provider is selected and authenticated within Codex.[^runtime][^provider-info]

## There is an official SDK; T3 uses a different client

The official **TypeScript Codex SDK, `@openai/codex-sdk`, exists**. T3's inspected interactive path instead uses its own `effect-codex-app-server` client. The choice is not between an SDK and no SDK: it is between interfaces around the same Codex runtime.[^sdk-readme][^sdk-exec][^client]

| Interface | Underlying mechanism | Useful abstraction |
| --- | --- | --- |
| Official TypeScript SDK: `@openai/codex-sdk` | Spawns `codex exec` and consumes JSONL events. | `startThread`, `run`, `runStreamed`, and `resumeThread`. |
| Official Python SDK: `openai-codex` | Controls local `codex app-server` over JSON-RPC. | An official higher-level app-server client. |
| T3's `effect-codex-app-server` | Communicates with the spawned app-server through stdin/stdout. | Typed bidirectional requests, notifications, and UI-driven interactions. |

The TypeScript/Python transport distinction matters: “the SDK uses exec” describes the inspected TypeScript SDK, not every Codex SDK. The Python architecture is documented by OpenAI; this note does not contain a Python runtime test.[^sdk-exec][^sdk-docs]

### The shortest useful TypeScript example

Install the package and authenticate the Codex environment it will use:

```bash
npm install @openai/codex-sdk
codex login
```

Choose ChatGPT sign-in for ChatGPT-backed Codex access. The SDK does not turn subscription access into general API credit.[^auth]

```typescript
import { Codex } from "@openai/codex-sdk";

async function main() {
  const codex = new Codex();
  const thread = codex.startThread({
    workingDirectory: process.cwd(),
    sandboxMode: "read-only",
    approvalPolicy: "never",
  });

  const result = await thread.run(
    "Explain this repository's architecture without changing files."
  );
  console.log(result.finalResponse);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

This is a TypeScript snippet for a Node.js project, not a browser API. Run it through the project's normal TypeScript toolchain from a trusted Git repository; `skipGitRepoCheck: true` is available for an intentional non-repository working directory. The SDK handles spawning and event parsing. It supports streaming, conversation continuation/resumption, images, and structured output.[^sdk-readme][^sdk-exec]

By default, the SDK inherits the process environment, including `CODEX_HOME`. Supplying an explicit `apiKey` causes it to set `CODEX_API_KEY`; without a competing credential or provider override, Codex can use its cached ChatGPT login. A custom SDK `env` replaces the inherited environment, so preserve the variables needed for the intended home and runtime. No access-token extraction is needed.[^sdk-exec][^auth]

### Why app-server fits T3

T3 needs account/model discovery, ongoing conversation state, cancellation, approvals, and requests for user input. Its client exposes those bidirectional operations. This is an architectural explanation of the fit, not a verified maintainer statement about why T3 rejected the official SDK.[^runtime][^provider][^client]

Do not reduce the comparison to “SDK cannot stream or resume”: the TypeScript SDK supports both. For personal TypeScript automation, start with the official SDK; for a T3-like interactive client, evaluate app-server directly or an appropriate app-server SDK.[^sdk-readme][^sdk-docs]

## The app-server core script, without the plumbing

Sign in using the Codex installation and account home that the integration will use:

```bash
codex login
```

Choose ChatGPT sign-in to use ChatGPT-backed Codex access. API-key sign-in is a different authentication and billing path.[^auth]

The following is **core pseudocode**. `jsonLinesRpc` stands for transport code that correlates request IDs, dispatches notifications, answers server requests, and handles process failures. It is not the name of an OpenAI package. A complete implementation accompanies this note as [codex-app-server-demo.mjs](assets/codex-app-server-demo.mjs), with [offline transport tests](assets/codex-app-server-demo.test.mjs).

```js
const rpc = jsonLinesRpc(spawn("codex", ["app-server"], {
  cwd,
  env: { ...process.env }, // Inherit CODEX_HOME; no token extraction.
  stdio: ["pipe", "pipe", "inherit"],
}));

try {
  await rpc.request("initialize", {
    clientInfo: { name: "my_client", title: "My Client", version: "0.1.0" },
  });
  rpc.notify("initialized");

  const { account } = await rpc.request("account/read", {});
  if (account?.type !== "chatgpt") throw new Error("Expected ChatGPT sign-in");

  const { thread } = await rpc.request("thread/start", {
    cwd, sandbox: "read-only", approvalPolicy: "never",
  });

  // Install listeners BEFORE sending the prompt; notifications may arrive early.
  rpc.onNotification(message => {
    if (message.method === "item/agentMessage/delta" &&
        message.params.threadId === thread.id) {
      process.stdout.write(message.params.delta);
    }
  });
  const done = rpc.waitFor(message =>
    message.method === "turn/completed" && message.params.threadId === thread.id);

  await rpc.request("turn/start", {
    threadId: thread.id, input: [{ type: "text", text: prompt }],
  });
  const completion = await done;
  if (completion.params.turn.status !== "completed") throw new Error("Turn failed");
} finally {
  rpc.close();
}
```

The important mechanism is the process launch plus `initialize → thread/start → turn/start`, followed by streamed events. T3 adds type validation, application state, resumability, approvals, attachments, model options, logging, and lifecycle management around that mechanism.[^runtime][^provider][^client]

`approvalPolicy: "never"` does not mean unrestricted access: it prevents permission escalation prompts, while `sandbox: "read-only"` independently requests read-only local execution. This demonstration is intentionally more restrictive than some T3 runtime modes. Inherited tools, MCP servers, and hooks require separate trust; a local filesystem sandbox is not a universal prohibition on remote side effects.[^runtime]

## What T3 actually does

### 1. It creates a provider instance

`CodexDriver.ts` constructs a session adapter, a status snapshot, and a separate text-generation helper. The driver binds those components to an instance's configuration and environment. Multiple instances can use different Codex homes.[^driver]

### 2. It launches and initializes the runtime

`CodexSessionRuntime.ts` expands the selected home path, places it in `CODEX_HOME` when configured, resolves the executable, and spawns Codex with app-server arguments. It wraps that process using `CodexClient.layerChildProcess` from T3's own `effect-codex-app-server` package.[^runtime]

T3's initialization identifies its client as `t3code_desktop`, with title `T3 Code Desktop` and the application's package version; it also opts into `experimentalApi`. A custom client should use its own identity rather than impersonating T3.[^initialize]

### 3. It asks Codex about the account and available capabilities

The provider probe calls `account/read`, `model/list`, `skills/list`, and `account/rateLimits/read`. It uses account metadata to show an authentication label and distinguish ChatGPT-backed access from API-key authentication. Missing required authentication produces an instruction to run `codex login`.[^provider]

This is account-status discovery, not retrieval of a raw OAuth bearer token. The inspected `account/read` path returns account information used by T3's status UI.[^provider]

### 4. It opens a thread and starts a turn

A new session uses `thread/start`. A saved Codex thread ID can be used with `thread/resume`; T3 stores it in a resume cursor. A turn supplies text and optional image inputs, plus settings such as model, reasoning effort, service tier, approval policy, and sandbox policy.[^runtime]

One naming trap is visible in T3's source: thread configuration uses sandbox strings such as `read-only` or `workspace-write`, whereas turn-level sandbox policy uses objects with types such as `readOnly` or `workspaceWrite`. Those are different protocol fields, not interchangeable spellings.[^runtime]

### 5. It processes a bidirectional event stream

The client separates requests, responses, and notifications. The runtime recognizes text deltas, tool output, approvals, token-usage updates, and turn completion, among other events.[^client][^runtime]

A response to `turn/start` is not the final answer. The client must continue processing events until the matching turn completes. Production-quality integration also needs cancellation, request timeouts, child-process cleanup, and sensible treatment of unknown events. The accompanying demonstration implements the minimum of that plumbing, not T3's entire UI or session manager.

## What “the Codex token” actually means

There are several distinct objects that can be confused under that phrase.

| Object | Purpose | What the inspected T3 path does with it |
| --- | --- | --- |
| OAuth access token | Authenticates upstream requests in ChatGPT-backed mode. | Leaves authentication to Codex rather than attaching the token to local turn requests. |
| OAuth refresh token | Allows Codex-managed credentials to be renewed. | Does not implement refresh in the inspected session launcher. |
| ID token and account ID | Supply identity, plan, and account/workspace context. | Obtains displayable account metadata through Codex's account API. |
| Input/output/reasoning token counts | Measure model usage, not identity. | Tracks usage through runtime events and account-limit information. |

T3's adapter separately represents input, cached-input, output, and reasoning usage counters.[^usage]

Codex's `TokenData` includes `id_token`, `access_token`, `refresh_token`, and `account_id`. Its authentication manager explicitly returns `access_token` for the ChatGPT bearer credential. The ID token is therefore not the model-request bearer in this inspected path.[^token-data][^auth-manager]

### Credential storage and reuse

Codex supports a credentials file under `CODEX_HOME`—normally `~/.codex/auth.json`—or an operating-system credential store, depending on `cli_auth_credentials_store`. Do not assume every working installation has an `auth.json` file.[^auth]

T3 points its child process at the appropriate environment/home. For example, a separate account can be selected operationally by using the same explicit home for login and subsequent execution:

```bash
mkdir -p "$HOME/.codex-personal"
CODEX_HOME="$HOME/.codex-personal" codex login
CODEX_HOME="$HOME/.codex-personal" \
  node codex-app-server-demo.mjs /absolute/project "Explain this repository."
```

A home path is not itself a credential. It tells Codex where to resolve configuration and account state. The account must already be authenticated through the configured storage mechanism.[^runtime][^auth-manager]

T3 also implements an optional authentication-overlay layout: session-related directories can be shared while private entries such as `auth.json` and `models_cache.json` remain separate. This is more nuanced than copying one token into every instance.[^home]

### Refresh stays inside Codex

Codex-managed ChatGPT sessions have built-in refresh and authorization-recovery logic. Successful refresh updates stored credentials. Revoked, expired, or otherwise unusable refresh credentials can still require sign-in again; this is not permanent authorization.[^ci-auth][^auth-manager]

For trusted automation, OpenAI's guidance emphasizes preserving refreshed state rather than repeatedly restoring an old credential bundle, and avoiding concurrent copies of one managed-auth file across runners. Most CI/CD jobs should use API-key authentication instead. A desktop-style local integration and a shared production service are different deployment cases.[^ci-auth]

## Where the bearer token goes

The default model-provider mapping in the inspected Codex source distinguishes these bases:[^provider-info]

```text
ChatGPT-backed Codex:  https://chatgpt.com/backend-api/codex
API-key-backed path:   https://api.openai.com/v1
```

Provider configuration can override the base. These are implementation details of Codex, not a recommendation to couple a new client directly to an internal service URL.

The bearer provider constructs headers of this form:[^bearer]

```http
Authorization: Bearer <access_token>
ChatGPT-Account-ID: <selected_account_id>
```

The account header is added when an account ID is available. Codex's inspected provider definition uses the Responses wire protocol, not a ChatGPT browser-conversation endpoint.[^bearer][^provider-info]

This explains how a T3 session can use the user's ChatGPT-backed Codex access without requiring T3 to make an ordinary API-key model call. It does **not** turn the ChatGPT credential into unrestricted OpenAI API credit; account entitlements and service limits still apply.[^auth][^provider]

Nor does this imply that a Codex thread has the same tools, settings, or product behavior as a conversation in the ChatGPT web interface. The integration controls the Codex runtime.

## A separate advanced option: host-managed tokens

The app-server API also documents experimental `chatgptAuthTokens` login. An authorized host that already manages the user's authentication can supply `accessToken`, `chatgptAccountId`, and an optional plan type to `account/login/start`. It must answer `account/chatgptAuthTokens/refresh` when fresh credentials are requested. This is a different ownership model, not the ordinary T3 process-launch path described above.[^app-server][^runtime]

For a personal integration, delegating sign-in and refresh to the installed Codex runtime avoids implementing that additional credential lifecycle.

## The simpler alternative: `codex exec`

For a single task rather than an interactive UI, a subprocess may be all that is needed:

```bash
cd /absolute/project
codex exec --ephemeral -s read-only \
  "Explain the structure of this repository without changing anything."
```

T3 itself uses an `exec` path for branch names, commit messages, pull-request content, and thread titles. Its implementation supplies a selected model, reasoning options, an output JSON Schema, and an output file; it sends the prompt through stdin and validates the result.[^text-generation]

A schematic structured-output invocation is:

```bash
printf '%s' 'Produce the requested structured result.' |
  codex exec --ephemeral --skip-git-repo-check -s read-only \
    --output-schema ./result.schema.json \
    --output-last-message ./result.json -
```

Here `result.schema.json` is a schema the application provides; the command is not runnable until that file exists. The interactive and one-shot paths both receive the selected instance's Codex environment in T3, so small helper generations can consume the same account's usage.[^driver][^text-generation]

**Design choice:** use app-server when the application needs detailed bidirectional session control and interactive approvals; use `exec` or its TypeScript SDK wrapper when it primarily needs a task result. Streaming and resumption are not exclusive to app-server. None of these paths requires manually extracting a login token.[^sdk-readme]

## Running and verifying the accompanying example

`codex-app-server-demo.mjs` requires a directly executable Codex binary, Node.js 20 or newer, a trusted project/configuration, and a persistent ChatGPT sign-in visible to that process. The local checks used Node.js 22.16.0. The script inherits Codex's configured model/provider and rejects an account reported as API-key mode; use a ChatGPT-backed OpenAI configuration for this example. It is not a general billing-policy enforcement layer.

```bash
codex login
node codex-app-server-demo.mjs /absolute/project \
  "Explain the structure of this repository."
```

The example intentionally has no login UI, external-token refresh handler, conversation resumption, or multi-user server. Unsupported server requests receive an error; command and file-change approval requests are declined. It does not read or print a credentials file.

Before publication, the app-server script passed JavaScript syntax checking and all eight offline test groups: normal completion, completion before its acknowledgment, interleaved server requests with a colliding ID (including declined approvals and unsupported methods), failed turns, unauthenticated and API-key accounts, request/turn timeouts, malformed JSON, and a missing executable. Some groups combine several cases. The committed test harness uses temporary mock processes and no real credentials.

From a repository checkout, reproduce those checks with:

```bash
node --check content/assets/codex-app-server-demo.mjs
node --test content/assets/codex-app-server-demo.test.mjs
```

**Not verified here:** a live authenticated Codex run, actual token refresh, real model availability, or compatibility with a particular installed Codex release. No Codex executable was available in the test environment. The mock verifies the demonstration's message handling, not OpenAI authentication or the real server. The TypeScript SDK snippet was source-reviewed, not executed against a live model.

OpenAI currently labels the app-server command experimental and unsupported for production workloads. Pin compatible versions and check generated schemas from the installed CLI before building against evolving fields.[^app-server]

## Conclusion

The durable architectural lesson is to separate **the frontend**, **the agent runtime**, and **the authentication owner**. In the inspected T3 integration, T3 owns the frontend and orchestration, while the installed Codex runtime handles its agent session and managed credentials. Reproducing the central mechanism means using a Codex client interface—not a copied bearer token or a reimplementation of the whole agent. The official TypeScript SDK is the shorter starting point for a script; the low-level app-server example explains the richer boundary T3 uses.

## Source map

All GitHub links below are pinned to the reviewed commits. Official documentation is live and may subsequently change.

[^driver]: [T3 CodexDriver.ts](https://github.com/pingdotgg/t3code/blob/4a4c6dd2adc350a68ba18bb28b24b5a7e4660dab/apps/server/src/provider/Drivers/CodexDriver.ts) — provider-instance composition, environment, and separate interactive/text-generation paths.
[^runtime]: [T3 CodexSessionRuntime.ts](https://github.com/pingdotgg/t3code/blob/4a4c6dd2adc350a68ba18bb28b24b5a7e4660dab/apps/server/src/provider/Layers/CodexSessionRuntime.ts#L530-L820) — see lines 530–820 for thread/turn parameters and resumption, and lines 1280–1380 for environment and child-process launch.
[^client]: [T3 effect-codex-app-server client.ts](https://github.com/pingdotgg/t3code/blob/4a4c6dd2adc350a68ba18bb28b24b5a7e4660dab/packages/effect-codex-app-server/src/client.ts) — typed requests, notifications, and server-request handlers.
[^provider]: [T3 CodexProvider.ts](https://github.com/pingdotgg/t3code/blob/4a4c6dd2adc350a68ba18bb28b24b5a7e4660dab/apps/server/src/provider/Layers/CodexProvider.ts) — account/model/skills/usage probes and authentication-status interpretation, especially lines 360–560.
[^initialize]: [T3 initialization parameters](https://github.com/pingdotgg/t3code/blob/4a4c6dd2adc350a68ba18bb28b24b5a7e4660dab/apps/server/src/provider/Layers/CodexProvider.ts#L343-L355) — client identity and experimental opt-in.
[^home]: [T3 CodexHomeLayout.ts](https://github.com/pingdotgg/t3code/blob/4a4c6dd2adc350a68ba18bb28b24b5a7e4660dab/apps/server/src/provider/Drivers/CodexHomeLayout.ts) — direct and authentication-overlay layouts; private credential entries.
[^text-generation]: [T3 CodexTextGeneration.ts](https://github.com/pingdotgg/t3code/blob/4a4c6dd2adc350a68ba18bb28b24b5a7e4660dab/apps/server/src/textGeneration/CodexTextGeneration.ts#L160-L290) — `exec`, schema/output files, stdin, environment, and process results.
[^token-data]: [Codex token_data.rs](https://github.com/openai/codex/blob/c4017a87aacc7558002b7cb510025e967c1d765e/codex-rs/login/src/token_data.rs#L11-L42) — access, refresh, ID-token, and account fields.
[^auth-manager]: [Codex authentication manager](https://github.com/openai/codex/blob/c4017a87aacc7558002b7cb510025e967c1d765e/codex-rs/login/src/auth/manager.rs) — auth-storage loading, managed/external variants, bearer-token selection, and refresh failures; inspected lines 1–220 and 280–670.
[^bearer]: [Codex bearer_auth_provider.rs](https://github.com/openai/codex/blob/c4017a87aacc7558002b7cb510025e967c1d765e/codex-rs/model-provider/src/bearer_auth_provider.rs#L31-L47) — actual Authorization and account headers.
[^provider-info]: [Codex model-provider-info](https://github.com/openai/codex/blob/c4017a87aacc7558002b7cb510025e967c1d765e/codex-rs/model-provider-info/src/lib.rs) — Responses protocol and backend constant near the beginning; auth-dependent default base selection in `to_api_provider` around lines 370–410.
[^auth]: [Official Codex authentication documentation](https://learn.chatgpt.com/docs/auth) — ChatGPT/API-key modes, cached credentials, credential stores, and managed refresh.
[^ci-auth]: [Official managed-auth CI/CD guidance](https://learn.chatgpt.com/docs/auth/ci-cd-auth) — preserve refreshed credentials, trusted deployment restrictions, and API-key recommendation.
[^app-server]: [Official Codex app-server documentation](https://learn.chatgpt.com/docs/app-server) — protocol, experimental host-managed tokens, and maturity caveats.

[^usage]: [T3 CodexAdapter.ts](https://github.com/pingdotgg/t3code/blob/4a4c6dd2adc350a68ba18bb28b24b5a7e4660dab/apps/server/src/provider/Layers/CodexAdapter.ts#L120-L155) — model-usage counters, distinct from credentials.

[^sdk-readme]: [Official TypeScript SDK README](https://github.com/openai/codex/blob/c4017a87aacc7558002b7cb510025e967c1d765e/sdk/typescript/README.md) — installation, thread APIs, streaming, images, structured output, and environment control.
[^sdk-exec]: [Official TypeScript SDK exec.ts](https://github.com/openai/codex/blob/c4017a87aacc7558002b7cb510025e967c1d765e/sdk/typescript/src/exec.ts) — `exec` command construction, environment inheritance, explicit API-key injection, and process spawning.
[^sdk-docs]: [Official Codex SDK documentation](https://learn.chatgpt.com/docs/codex-sdk) — interface selection and Python SDK's app-server architecture. Live documentation checked during publication; underlying T3/TypeScript implementation claims remain pinned to the source snapshots above.
