---
date: 2026-09-12
title: How Hermes Uses Codex Quota in Two Runtime Modes
description: Hermes can use ChatGPT-backed Codex access through its own Responses-based agent loop or through an opt-in Codex app-server subprocess.
---

**Reviewed:** September 12, 2026, America/Los_Angeles.  
**Scope:** NousResearch Hermes Agent at commit `819988acb750836387fbb9d5d76203a9b3f530f4`. OpenAI plan and usage documentation was checked on the same date. This is source-based research; it does not include a controlled before-and-after quota-consumption experiment.

## Key idea

Hermes supports **two materially different ways** to use ChatGPT-backed Codex access:

```text
Default: Hermes owns the harness

Hermes conversation and tool loop
        ↓
Hermes openai-codex provider
        ↓  Responses-format requests with ChatGPT OAuth
chatgpt.com/backend-api/codex
        ↓
the authenticated account's Codex allowance
```

```text
Optional: Codex owns the inner harness

Hermes UI, sessions, gateway, and outer workflow
        ↓
codex app-server subprocess
        ↓  Codex threads, tools, sandbox, and approvals
OpenAI Codex backend
        ↓
the account authenticated by codex login
```

Both paths can consume Codex-related account usage. The important difference is **who owns the agent loop, tools, conversation state, and credentials**.

The quota follows the authenticated account and backend request, not the name of the desktop application. Two local token stores do not create two allowances when they represent the same ChatGPT account.

## The core configuration

Hermes' direct provider is declared as a Responses-mode provider with external OAuth and no API-key environment variable:[^provider-profile]

```python
openai_codex = ProviderProfile(
    name="openai-codex",
    aliases=("codex", "openai_codex"),
    api_mode="codex_responses",
    env_vars=(),  # OAuth external — no API key
    base_url="https://chatgpt.com/backend-api/codex",
    auth_type="oauth_external",
)
```

The alternative runtime is explicitly enabled:

```text
/codex-runtime codex_app_server
```

or:

```yaml
model:
  openai_runtime: codex_app_server
```

The pinned Hermes documentation says the default value is `auto`, meaning the Hermes runtime, and that app-server is opt-in rather than an automatic fallback.[^app-server-doc]

## Mode 1: Hermes calls the Codex service directly

### Hermes owns the agent loop

With the normal `openai-codex` provider, Hermes does not need to launch the Codex CLI. Hermes owns:

- the system and user context;
- conversation persistence;
- tool definitions and dispatch;
- permission and retry policy;
- continuation after tool results;
- compression, stopping, memory, and session behavior.

Its Codex runtime contains a direct streaming path described as one `responses.create(stream=True)` call, separate from the app-server path in the same module.[^runtime]

A tool-using **user turn is therefore not necessarily one backend request**. The first request can return a tool call; Hermes executes the tool, appends the result, and makes another model request. Long tool loops, larger context, retries, reasoning, and auxiliary work can all make one apparent message more expensive than another.

This is the same architectural boundary described in [How Pi Uses Codex Quota Without the Codex Harness](pi-codex-quota-custom-harness.md): reuse an authenticated model-service connection while keeping a custom harness above it.

### Hermes maintains its own OAuth session

Hermes performs ChatGPT/Codex device-code authentication and stores the resulting access and refresh state in:

```text
~/.hermes/auth.json
```

The source deliberately distinguishes that store from the Codex CLI's `~/.codex/auth.json`. Hermes can import an existing Codex CLI token pair, but then maintains its own session so refresh-token rotation by one client does not casually invalidate the other.[^auth][^provider-docs]

The direct path therefore does **not** require a Codex CLI installation. Selecting **ChatGPT or Codex Subscription** through `hermes model` is enough to establish the Hermes-owned OAuth session.[^provider-docs]

### Requests identify both Hermes and the ChatGPT account

For the official Codex endpoint, Hermes constructs request identity headers that include:

```http
Authorization: Bearer <ChatGPT OAuth access token>
ChatGPT-Account-ID: <account id extracted from the token>
originator: hermes-agent
User-Agent: HermesAgent/<version>
```

The account ID comes from the token's `chatgpt_account_id` claim. Hermes treats malformed-token parsing as a request/authentication failure rather than inventing an account identity.[^headers]

The bearer token authorizes the request. The account header associates it with the appropriate ChatGPT account or workspace. `originator: hermes-agent` identifies the client; it is not a switch that grants extra quota.

## Mode 2: Hermes delegates the turn to Codex app-server

When `codex_app_server` is enabled, Hermes hands the whole turn to a spawned Codex runtime. Codex then owns:

- thread and turn state;
- shell commands and file changes;
- `apply_patch` and planning;
- sandboxing and approvals;
- native Codex plugins and configured MCP servers;
- the inner model/tool loop.

Hermes remains the outer product: session storage, slash commands, gateway surfaces, goal/kanban integration, event display, memory review, and selected extra tools exposed back to Codex through an MCP callback.[^app-server-doc][^runtime]

This path resembles the integration described in [How T3 Code Uses Codex and ChatGPT Authentication](how-t3-code-uses-codex.md): the application controls a Codex runtime rather than replacing its inner harness.

### App-server uses the Codex CLI's login state

The pinned Hermes instructions require the Codex CLI and a separate login:

```bash
codex login
```

The subprocess reads:

```text
~/.codex/auth.json
```

Hermes' own `hermes auth add openai-codex` session remains in `~/.hermes/auth.json`; it does not by itself authenticate the separately spawned Codex process.[^app-server-doc]

That creates two local authentication sessions, but not necessarily two billing identities:

```text
~/.hermes/auth.json → ChatGPT account A
~/.codex/auth.json  → ChatGPT account A
```

In this case, both routes identify account A and should draw from account A's applicable allowance. This is an inference from the account-bound OAuth and backend design, not the result of a live decrement experiment.

If the two stores are authenticated to different accounts, the requests are attributed to those different accounts. Hermes can also maintain several credential-pool entries; each selected credential remains an independent account identity rather than contributing to a single combined quota.

## What “uses Codex quota” means

OpenAI currently describes Codex usage as drawing from an account's agentic usage allowance and, where available, a shared credit pool with ChatGPT Work, ChatGPT for Excel, and Workspace Agents. The amount consumed depends on factors including model, execution location, task complexity, context, reasoning, speed, and tools.[^openai-usage]

This has several practical consequences.

### One Hermes message is not one fixed quota unit

Neither runtime gives a reliable equation such as:

```text
1 user message = 1 Codex message = 1 fixed quota unit
```

In default mode, Hermes may make several Responses calls while completing one tool-using turn. In app-server mode, one Codex turn may perform substantial reasoning, tool execution, context handling, and continuation internally. A short explanation and a long repository-wide implementation need not consume comparable allowance.

### The backend is authoritative

Local token counters are useful for diagnosis and optimization, but they do not by themselves establish the remaining subscription allowance. Hermes' app-server bridge records input, cached-input, output, and reasoning-token measurements into its own accounting, while marking included subscription use separately from ordinary estimated cost when that classification is available.[^runtime]

The account usage display and backend responses are the more authoritative source for remaining windows, resets, and credits.

### ChatGPT OAuth is not an ordinary Platform API key

Hermes lists **OpenAI Codex — ChatGPT plan OAuth** separately from **OpenAI API (direct)** with `OPENAI_API_KEY`.[^provider-docs] The first path targets the ChatGPT Codex backend and account entitlement. The second is an API-key configuration with its own Platform rate limits and billing.

A fallback from subscription-backed OAuth to a metered API key should therefore be explicit. It should not silently create API charges merely because the subscription allowance is exhausted.

## How Hermes displays remaining usage

Hermes includes account-usage code that queries the Codex backend's usage endpoint. For the ChatGPT backend path it derives endpoints such as:

```text
/backend-api/wham/usage
/backend-api/wham/rate-limit-reset-credits
/backend-api/wham/rate-limit-reset-credits/consume
```

The returned snapshot can expose session and weekly windows, reset times, banked resets, plan type, and a credit balance when present.[^account-usage]

Credential resolution for `/usage` is pool-aware. Hermes first uses explicit live-agent credentials when supplied, then its normal runtime resolver, and finally an available credential-pool entry. This matters because the displayed usage belongs to the credential actually selected. A dashboard that silently showed another account's balance would be worse than showing nothing, so the implementation fails open on uncertain refresh/network cases rather than substituting a different account.[^account-usage]

The practical check is:

```text
Which provider is active?
Which OAuth credential/account did this turn use?
What does that account's usage endpoint report?
```

## Direct mode versus app-server mode

| Question | Hermes direct `openai-codex` mode | Hermes `codex_app_server` mode |
| --- | --- | --- |
| Who owns the inner agent loop? | Hermes | Codex |
| Model transport | Hermes sends Responses-format requests | Codex app-server sends the model requests |
| Main credential store | `~/.hermes/auth.json` | `~/.codex/auth.json` |
| Codex CLI required | No | Yes |
| Shell, patching, and sandbox | Hermes tools and policies | Codex built-ins and sandbox |
| Hermes-specific tools | Native in the Hermes loop | Selected tools exposed through MCP |
| Conversation authority | Hermes transcript | Codex thread, projected back into Hermes |
| Quota identity | Account in the Hermes OAuth token | Account authenticated by `codex login` |
| Closest comparison | Pi's direct Codex provider | T3 or another app-server controller |

Hermes' distinctive capability is not merely “it supports Codex.” It supports **both integration boundaries** in the same product.

## Choosing the boundary

Use the default Hermes runtime when the value lies in Hermes' own loop: its tool ecosystem, memory/session behavior, subagents, custom routing, or provider portability.

Use app-server when the value lies in Codex's native execution behavior: its sandbox, terminal/editing tools, plugins, approval lifecycle, and Codex-managed thread semantics.

For a task-first manager, keep the choice at the **run adapter** layer. The durable task should not care whether one attempt used Hermes' loop, Codex app-server, Pi, or another harness. Record the selected account, provider, runtime, model, task budget, and delivery revision as explicit facts.

## Important caveats

1. **Hermes' own provider documentation marks exact plan-quota semantics as not currently documented.** This note combines observed Hermes code with current OpenAI usage documentation; the live account usage page remains authoritative.[^provider-docs][^openai-usage]
2. **Direct backend details can change.** Hermes maintains compatibility code for OAuth, headers, Responses payloads, streaming, refresh, and error classification. Pin versions and keep the transport behind an adapter.
3. **Two refresh-token stores require careful handling.** Do not copy, log, or expose tokens to tools. Separate stores reduce accidental rotation conflicts but still contain sensitive credentials.
4. **Credential pooling does not create a shared super-quota.** Each request uses one selected credential and remains subject to that account's limits and terms.
5. **No live quota decrement was measured for this note.** The conclusion about attribution is supported by the authenticated backend path and account headers, but not by an experimental before/after balance capture.

## Source map

| Source | What it establishes |
| --- | --- |
| Hermes provider profile[^provider-profile] | Direct Codex Responses mode, ChatGPT backend URL, external OAuth, and no API-key environment variable. |
| Hermes Codex authentication[^auth] | Separate `~/.hermes/auth.json` storage, refresh handling, and optional import from Codex CLI credentials. |
| Hermes request headers[^headers] | Hermes client identity and extraction of `ChatGPT-Account-ID` from the OAuth token. |
| Hermes Codex runtime[^runtime] | Separate direct Responses and app-server paths, plus usage projection into Hermes accounting. |
| Hermes app-server guide[^app-server-doc] | Opt-in runtime behavior, prerequisites, tools, MCP callback, and separate Codex login. |
| Hermes account usage[^account-usage] | Backend usage windows, credits, reset handling, and pool-aware credential selection. |
| OpenAI Codex plan guide[^openai-usage] | Current allowance, shared-pool, reset, and variable-consumption semantics. |

[^provider-profile]: NousResearch Hermes Agent, [`plugins/model-providers/openai-codex/__init__.py`](https://github.com/NousResearch/hermes-agent/blob/819988acb750836387fbb9d5d76203a9b3f530f4/plugins/model-providers/openai-codex/__init__.py).
[^auth]: NousResearch Hermes Agent, [`hermes_cli/auth_codex.py`](https://github.com/NousResearch/hermes-agent/blob/819988acb750836387fbb9d5d76203a9b3f530f4/hermes_cli/auth_codex.py).
[^headers]: NousResearch Hermes Agent, [`agent/codex_headers.py`](https://github.com/NousResearch/hermes-agent/blob/819988acb750836387fbb9d5d76203a9b3f530f4/agent/codex_headers.py).
[^runtime]: NousResearch Hermes Agent, [`agent/codex_runtime.py`](https://github.com/NousResearch/hermes-agent/blob/819988acb750836387fbb9d5d76203a9b3f530f4/agent/codex_runtime.py).
[^app-server-doc]: NousResearch Hermes Agent, [Codex App-Server Runtime](https://github.com/NousResearch/hermes-agent/blob/819988acb750836387fbb9d5d76203a9b3f530f4/website/docs/user-guide/features/codex-app-server-runtime.md).
[^provider-docs]: NousResearch Hermes Agent, [LLM and Model Providers](https://github.com/NousResearch/hermes-agent/blob/819988acb750836387fbb9d5d76203a9b3f530f4/website/docs/integrations/providers.md), including the Codex authentication note and subscription-plan comparison.
[^account-usage]: NousResearch Hermes Agent, [`agent/account_usage.py`](https://github.com/NousResearch/hermes-agent/blob/819988acb750836387fbb9d5d76203a9b3f530f4/agent/account_usage.py).
[^openai-usage]: OpenAI, [Using Codex with your ChatGPT plan](https://help.openai.com/en/articles/11369540), checked September 12, 2026. Availability, shared pools, rates, credits, and limits are time-sensitive.
