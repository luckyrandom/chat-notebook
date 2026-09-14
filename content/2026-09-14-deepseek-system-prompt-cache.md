---
title: How DeepSeek Updates System Prompts Without Losing the Cache
description: How DeepSeek Harness appends complete system-prompt updates to preserve cached history, and where that guarantee stops.
date: 2026-09-14
---

**The trick is to change the effective instructions without editing the already-processed prefix.** On a capable model route, DeepSeek Harness keeps the previous conversation intact and appends a new, complete system message. The model is expected to treat that later message as the current system prompt. The old prefix therefore remains eligible for reuse; no retroactive repair of its cached representations is required. This behavior is explicit in the [agent loop][loop] and its [prompt-projection implementation][projection].

The important scope is **DeepSeek Harness's supported in-history update path**, not an unconditional promise about every DeepSeek model, gateway, or application. At the source revision reviewed on September 14, 2026, the official adapter enables it by default for `deepseek-flash`. Other catalog entries need an explicit capability declaration backed by actual endpoint support. This article is based on documentation and source inspection, not a measured live-API experiment. [Adapter contract][adapter]

## The core mechanism

Let `S0` be the original system prompt, `H` the accumulated user, assistant, and tool history, and `S1` the complete revised system prompt:

```text
Previous conversation:       [S0][H]

Rewrite the beginning:       [S1][H][new question]
                              ^ early prefix changes

Append an in-history update: [S0][H][S1][new question]
                             |-----|
                          unchanged prefix
```

The smallest useful client-side illustration is:

```python
# Conceptual message construction for a route that supports in-history updates.
# history includes the original system message and complete prior messages.
messages = [
    *history,
    {"role": "system", "content": complete_new_system_prompt},
    {"role": "user", "content": next_question},
]
```

The essential operation is **append, not `messages[0] = ...`**. The new message contains the whole effective prompt, including requirements that still apply—not merely “change the output format.” The official adapter preserves system-message order when constructing the outgoing request; it does not collect the later system messages and move them to the front. [Capability contract][adapter] · [Wire serialization][serialization]

The enabling setting is `systemPromptUpdate: 'in-history'`. This is **Harness model-route metadata**, consulted by the agent loop after it prepares the actual call. It is not a generic cache-control field to add to a DeepSeek HTTP request. Declaring the setting cannot make an unsupported model understand later system messages. [Adapter contract][adapter] · [Agent loop][loop]

## Why that preserves the cache

A causal model processes a token using preceding context, not future tokens. Appending new tokens does not change the earlier computation. A KV cache stores reusable attention state from that computation; it does not store a context-independent interpretation of each word. This is the ordinary reason autoregressive inference can reuse past state. [Causal caching explanation][causal]

Consequently, appending `S1` after `[S0][H]` leaves the old computation valid. The new system message and subsequent output are computed in the presence of that history. Replacing `S0` with `S1`, however, changes the context under which later tokens are processed. Reusing all of the old history state would generally no longer be equivalent to evaluating the rewritten input. This is a consequence of causal dependence, not a DeepSeek-specific exception.

There are two separate questions:

**Is the old state still valid?** The append-only construction preserves that possibility when the model, token positions, and preceding model input remain compatible.

**Will the service actually reuse it?** DeepSeek's current cache guide requires a matching, already-persisted prefix unit. The service is best-effort. Thus, “keeps the cache” is best read as **preserves a reusable prefix**, not “guarantees every previous token is always a cache hit.” [Current cache rules][cache]

## What changes—and what does not

**Instruction priority is not the same as token position.** A model route can support a system-role message later in the conversation. The Harness capability specifically means that the newest such message supplies the complete effective system prompt. This is a model-and-protocol contract, not a universal property of all APIs that accept a `system` role. [Adapter contract][adapter]

**The update is prospective, not a rewritten past.** `[S0][H][S1]` and `[S1][H]` are different inputs. In the first, the historical state was formed under `S0`, and the model now receives `S1`. The later message does not erase the old text, undo previous tool actions, or prove the model will produce exactly what a fresh conversation under `S1` would produce. Treat these as different semantics even when both produce acceptable answers.

**Cached does not mean absent or free.** The loop retains earlier prompt versions in history until they are cleared or consolidated. They still occupy context and contribute input usage. Repeatedly appending a large complete prompt can therefore trade lower repeated prefill work for greater history size. The loop's documentation calls out this retained-prompt cost. [Agent loop][loop]

For example, changing from “explain in prose” to “return JSON” can be a forward-looking update. But it is not a way to make sensitive information disappear from an old prompt, or to turn previously authorized tool actions into actions that never happened. When a requirement demands removal or a clean policy boundary, rebuild or restart the relevant context and accept the cache consequences. Enforce tool permissions in application code rather than relying on a prompt change alone.

## Applying the idea in an agent

Keep stable instructions and tool ordering stable. Use a supported in-history update only when the effective policy really changes. Send a complete new prompt, preserve preceding messages faithfully, and avoid intermediaries that hoist or merge system messages into a different early prefix. Tool-schema changes, history edits, compaction, or an incompatible route can defeat the simple append-only condition. [System-prompt assembly][assembly] · [Agent loop][loop]

Do not put every changing runtime fact into the system prompt. Harness separately projects dynamic runtime context into sourced user-role snapshots and emits a new snapshot only when the value changes. That is a useful separation: **stable policy, versioned policy updates, and changing task facts are different kinds of input**. A user-role context snapshot is not a replacement for a high-priority system instruction. [Runtime-context implementation][projection] · [Assembly contract][assembly]

**The durable design lesson:** when new instructions only need to govern future work, model them as an appended update rather than a mutation of the past. This preserves cache eligibility without pretending the past has been recomputed.

````{dropdown} The exact decision rule and its less-obvious edge cases
The source separates prompt assembly from admission into conversation history. Assembly renders the complete desired prompt. Admission compares that rendering with retained system messages and the capability of the prepared call.

This pseudocode summarizes `SystemPromptProjection.project`; it is not a drop-in implementation:

```python
if there_is_no_system_node:
    append_initial_system_node(rendered_prompt)
elif not route_supports_in_history or starts_new_series or rendered_prompt == "":
    clear_later_system_nodes()
    replace_head_if_needed(rendered_prompt)
elif rendered_prompt != latest_effective_prompt:
    append_system_node(rendered_prompt)
else:
    pass  # no history change
```

The real code emits durable append or per-node replacement operations rather than mutating an ordinary Python list. Empty internal nodes do not become active system instructions in the derived model history. [Projection source][projection] · [Loop contract][loop]

| Situation | Harness behavior | Cache implication |
| --- | --- | --- |
| Same effective prompt; capable continuing series | No prompt update | No prefix change from the prompt itself |
| Changed nonempty prompt; capable continuing series | Append complete new system message | Existing history remains eligible |
| Incapable route or new request series | Consolidate at the first system node; clear active later versions | Any changed earlier model input limits reuse |
| Empty desired prompt | Clear every active system version | Old instructions must not remain active merely to preserve cache |
| No prior system node | Reserve the initial node, including an empty internal placeholder when needed | Establish the initial prompt state |

A “request series” is the loop's continuity boundary, not a provider promise to reserve GPU cache. It restarts when explicitly requested by a pre-step decision, when the history surface has been replaced, or when visible tool schemas change. Consolidation can happen even when the latest effective prompt text is unchanged, because retained in-history versions must be normalized for the new series. [Loop contract][loop]

The decision uses the capability from the actual prepared call, not stale metadata from the preceding request. Resume and a provider/model switch alone do not automatically start a new logical series in this revision. That does **not** imply cache portability between providers or models: the selected route still governs admission, and its actual serving cache has its own boundaries. [Loop contract][loop]

A changed prompt is appended after already-retained history and before the newly admitted user-message batch in the relevant step. The serializer's ordered traversal then carries system-role messages at those positions into the DeepSeek request. This is the critical end-to-end chain; a UI displaying “system prompt updated” would not, by itself, prove it. [Agent loop][loop] · [Serializer][serialization]
````

````{dropdown} How to test cache reuse and instruction replacement independently
No live DeepSeek request was made for this article. The following is a diagnostic plan, not a benchmark result.

First capture the outgoing message array and relevant request configuration. Hold the endpoint, model, tool definitions, tool ordering, and historical message serialization fixed. Preserve all provider-required assistant and tool fields; reconstructing history from visible prose alone is not a reliable cache test.

Use a sufficiently long, harmless history `P = [S0][H]` and compare three constructions:

| Case | Input shape | Question being tested |
| --- | --- | --- |
| Warm baseline | `P + ordinary continuation` | Is the service reusing this history at all? |
| In-history update | `P + S1 + new question` | Does preserving the prefix retain cache hits? |
| Head rewrite | `S1 + H + new question` | What happens when the early prefix actually changes? |

Warm the relevant prefix and allow for cache persistence. Do not repeatedly send one identical test payload and mistake reuse of the entire already-warmed experiment for evidence about the initial prompt transition. Vary only controlled suffixes, record request order, and compare multiple runs.

DeepSeek's current guide describes complete persisted units: request input/output boundaries, detected shared prefixes, and periodic boundaries in long sequences. A textually common prefix is therefore not necessarily a persisted hit on the first comparison. Inspect the reported usage instead of assuming a historical fixed block-size rule. [Cache persistence and accounting][cache]

```python
usage = response["usage"]
hits = usage["prompt_cache_hit_tokens"]
misses = usage["prompt_cache_miss_tokens"]
hit_fraction = hits / (hits + misses) if hits + misses else 0.0
```

Record the returned model identity, usage, exact outgoing payload, and time to first token. Latency is supplementary evidence: load, output behavior, and networking can change it independently of cache reuse.

Then test instruction semantics separately. Make `S0` request a prose answer and `S1` request a clearly different machine-checkable format while preserving an unrelated requirement in the full revised prompt. Verify both the changed and preserved requirements over several questions. A cache hit proves reuse, not instruction-following reliability; a correctly formatted answer proves neither cache reuse nor universal support.

Finally exercise the failure cases deliberately: a gateway that rewrites system-message placement, changed tool schemas, compaction, and prompt clearing. For deletion or policy-reset requirements, inspect the resulting model-visible history—not merely the most recent prompt editor value.
````

````{dropdown} Evidence, version scope, and what remains unverified
Research date: **September 14, 2026**. Source inspection is pinned to DeepSeek Harness commit `c291e7961a515f6d7af9304e7fd1d257929aef26`; API documentation is a dated observation and can change.

| Primary source | What it establishes |
| --- | --- |
| [System-prompt projection][projection] | The append-versus-consolidate decision; full-prompt comparison; clearing; changed-only runtime snapshots |
| [Agent loop documentation][loop] | Prepared-call capability, request-series boundaries, admission ordering, retained-token costs, and cache limitations |
| [Official DeepSeek adapter documentation][adapter] | Complete-effective-prompt semantics; `deepseek-flash` default capability; explicit support required for other catalog entries |
| [DeepSeek wire serializer][serialization] | System messages are serialized in their existing order, rather than moved to the beginning |
| [System-prompt assembly documentation][assembly] | Static sections, dynamic context, tool ordering, and their different cache effects |
| [DeepSeek context-cache guide][cache] | Persisted-prefix matching, best-effort behavior, and cache-hit/miss usage fields |
| [Hugging Face causal-cache explanation][causal] | Why appending future tokens permits reuse of earlier attention state |

The code establishes the Harness mechanism and its declared route contract. It does not independently measure the hosted service's hit rate, prove adherence to arbitrary conflicting prompts, establish support for every DeepSeek model or compatible gateway, or reveal every detail of server-side cache storage.

This explanation does not require a claim that DeepSeek has made KV states independent of earlier system instructions. Cache compression, sliding-window attention, and disk persistence concern how reusable state is represented and served; the prompt-update mechanism here concerns keeping the earlier input unchanged.
````

[projection]: https://github.com/deepseek-ai/deepseek-harness/blob/c291e7961a515f6d7af9304e7fd1d257929aef26/packages/core/agent-loop/src/runtime-context.ts
[loop]: https://github.com/deepseek-ai/deepseek-harness/blob/c291e7961a515f6d7af9304e7fd1d257929aef26/packages/core/agent-loop/README.md
[adapter]: https://github.com/deepseek-ai/deepseek-harness/blob/c291e7961a515f6d7af9304e7fd1d257929aef26/packages/llm/llm-deepseek/README.md
[serialization]: https://github.com/deepseek-ai/deepseek-harness/blob/c291e7961a515f6d7af9304e7fd1d257929aef26/packages/llm/llm-deepseek/src/serialize.ts
[assembly]: https://github.com/deepseek-ai/deepseek-harness/blob/c291e7961a515f6d7af9304e7fd1d257929aef26/packages/core/system-prompt/README.md
[cache]: https://api-docs.deepseek.com/guides/kv_cache/
[causal]: https://huggingface.co/docs/transformers/main/en/cache_explanation
