---
title: "T3 Code Stack: Evidence, Versions, and Alternatives"
description: A pinned dependency inventory, decision matrix, failure-semantics guide, and source-reading trail supporting the T3 Code architecture note.
---

**Reviewed:** September 13, 2026, America/Los_Angeles.  
**Snapshot:** [`66e39ca2aabde054bc50312a9c34f05dbd1f6f9e`](https://github.com/pingdotgg/t3code/tree/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e). The commit timestamp is September 14 at 00:08:41 UTC, which is September 13 at 17:08:41 in Los Angeles. It is a source snapshot, not necessarily a packaged release or the version installed by a reader.

Start with [Inside T3 Code: UI, Frontend, and Backend](t3-code-stack-and-architecture.md) for the main explanation. This companion preserves the inventory, evidence boundaries, and alternative-selection criteria without requiring them in the main reading path.

## Dependency inventory: declarations, not an installation audit

Values below come from package manifests and the workspace catalog/overrides. A caret or tilde is intentionally retained: it is a permitted version range, not proof of a resolved installation. The lockfile and shipped artifacts were not audited. Platform packages can also use different versions of the same library.[^e-root][^e-catalog]

| Area | Declaration at the pinned snapshot | Interpretation |
| --- | --- | --- |
| Package manager | `pnpm@11.10.0` | Root package-manager declaration |
| Development Node.js | `^24.13.1` | Root development engine requirement |
| Distributed server Node.js | `^22.16 || ^23.11 || >=24.10` | Server package's separate compatibility declaration |
| TypeScript | Catalog `7.0.2` | Shared toolchain declaration; marketing separately declares `~6.0.3` |
| Vite+ | `0.3.0` | `vp` drives development/build/test and root tooling commands |
| Vite package | Alias to `@voidzero-dev/vite-plus-core@0.3.0` | Do not mistake the alias version for upstream Vite's version number |
| Web React / React DOM | `19.2.6` | Browser/desktop-renderer framework |
| React Compiler | `babel-plugin-react-compiler` `1.0.0` | Compiler preset enabled in the web build configuration |
| Web router | `@tanstack/react-router` `^1.160.2` | Router plugin separately declares `^1.161.0` |
| Base UI | `@base-ui/react` `^1.4.1` | Used by locally maintained UI components |
| Tailwind | Catalog/overrides `4.3.3` | Workspace ranges are aligned by overrides |
| Lexical | `lexical` and `@lexical/react` `^0.41.0` | Prompt editor and structured editor nodes |
| Zustand | `^5.0.11` in web | Present in local UI stores, not the entire shared runtime |
| Effect ecosystem | `4.0.0-rc.112` | Runtime, atom integration, platform/SQL packages use coordinated RC pins |
| Pierre diffs / trees | `1.3.0-beta.10` / `1.0.0-beta.4` | Specialized code and tree rendering dependencies |
| Legend List | Catalog `3.3.5` | Declared by web and mobile |
| PTY backend | `node-pty` `^1.1.0` | Terminal process integration, distinct from browser rendering |
| Electron | `44.1.0` | Desktop shell; builder separately `26.15.6` |
| Mobile React / React Native | `19.2.3` / `0.86.3` | Different renderer/version combination from web |
| Expo / Uniwind | `~57.0.18` / `1.11.0` | Mobile platform toolchain and styling integration |
| Marketing | Astro `^7.0.3`, Sharp `0.34.5` | Separate public-site application |
| Cloud broker | Alchemy `2.0.0-beta.76`, Drizzle `1.0.0-rc.5-ab785fc`, Effect PostgreSQL driver | Relay infrastructure, not local workspace persistence |

The rows are supported by the [web manifest][e-web], [web build configuration][e-vite], [server manifest][e-server], [desktop manifest][e-desktop], [mobile manifest][e-mobile], [marketing manifest][e-marketing], [relay manifest][e-relay], and workspace catalog.[^e-catalog]

The root scripts use `vp run`, `vp lint`, `vp fmt`, workspace tests, and Knip checks. There are also Rust resource-monitor build/test commands. The Ghostty adapter has generated WASM and native-source coordination. “Predominantly TypeScript” is accurate; “nothing but TypeScript” is not.[^e-root][^e-ghostty]

My interpretation of the monorepo choice is practical: contracts and runtime code can evolve together, and shared dependency pins reduce accidental divergence. The tradeoff is coordinated upgrades and a larger testing surface. The workspace maintains patches for several dependencies, including Effect, Pierre and mobile packages; copying the manifest also copies part of that maintenance burden.[^e-catalog]

## Alternatives: change the implementation, not accidentally the requirements

These are design judgments, not measurements or claims that the maintainers evaluated and rejected each option.

| Decision | Why the inspected choice fits | Alternative and when I would favor it | Cost or constraint to keep visible |
| --- | --- | --- | --- |
| React + Vite+ client | Rendering stays independent of the environment server | Next.js when server-rendered routes are central; another SPA framework when the team knows it better | Next supports static export; it is not intrinsically incompatible with a desktop renderer |
| TanStack Router | Routing and route splitting are explicit frontend concerns | A simpler router for a small application with few screens | Preserve URL-targeted environment identity; do not silently send an action to another environment |
| Base UI + local wrappers | Application controls dense developer-tool styling | An opinionated UI suite when design customization is secondary | Local components still require accessibility and interaction testing |
| Tailwind + variants | Styling and component variants are co-located | Existing CSS Modules/design tokens when the team already has a coherent system | CSS technology does not solve state ownership or application correctness |
| Lexical composer | Structured inline references can have their own behavior | A textarea for plain prompts | Rich editors add selection, IME, clipboard and serialization work |
| Specialized diff renderer | Code review has different layout/processing needs from chat | Plain highlighted text for small read-only snippets | Benchmark large files, scrolling, theme changes and worker overhead before claiming a performance win |
| Ghostty WASM + Canvas 2D | Shared terminal core with a custom browser adapter | xterm.js for a conventional browser terminal | The custom adapter owns input, IME, selection, sizing and rendering integration |
| Shared Effect client runtime | One place owns sessions, subscriptions and recovery | A small explicit connection service plus local state for a simpler app | A request cache alone is not a complete lifecycle manager |
| Effect backend | Services, failures and asynchronous lifetimes share one model | Plain TypeScript for a small team/tool; a separate Go/Rust service when system constraints justify a language boundary | A language switch adds a cross-language contract and integration work; Effect adds its own learning and upgrade costs |
| Effect RPC | Contract and runtime use a consistent schema/error model | tRPC for a team already using it; HTTP endpoints plus a streaming channel for a narrower protocol | tRPC supports subscriptions; streaming is not exclusive to Effect RPC |
| SQLite/event log | One environment owns durable local state | Ordinary state/jobs tables for a small tool; PostgreSQL for a central multi-user service | Preserve atomic intent/receipt handling; do not infer exactly-once external work |
| Electron | Web renderer plus Node-oriented desktop integration | Tauri when OS WebViews and sidecar integration meet the product's requirements | Tauri can retain Node as a sidecar; smaller shell size does not by itself prove lower total memory or simpler delivery |
| Expo/React Native | Native presentation can reuse shared domain and connection logic | Responsive web/PWA before native platform behavior is essential | Shared runtime is not the same as complete UI-source reuse |
| pnpm/Vite+ workspace | Shared packages and commands are coordinated | Simpler npm workspaces for a smaller graph; a different task orchestrator for different build needs | Tool consolidation does not eliminate dependency patches or platform packaging |
| Optional Connect broker | Cloud identity and remote bootstrap are separated from execution | Direct pairing, SSH or Tailscale when those routes suffice | Removing the cloud broker does not remove environment authentication requirements |

The factual anchors are the repository files above and the architecture documents below. Official documentation verifies [Next static exports](https://nextjs.org/docs/app/guides/static-exports), [tRPC subscriptions](https://trpc.io/docs/server/subscriptions), [Tauri's process model](https://v2.tauri.app/concept/process-model/), and [xterm.js](https://xtermjs.org/). The selection criteria in the table are analysis, not vendor performance results.

## Follow one operation through the system

A useful way to read the code is to follow a user action rather than a directory tree.

**Choose the owning environment.** The client resolves the action against that environment's connection. A project on another machine is not interchangeable with a local checkout that happens to have the same repository name. The remote architecture keeps environment identity separate from endpoint selection.[^e-remote]

**Send a schema-defined command.** The shared contract describes the boundary. An independently upgraded server may have different capabilities; client knowledge alone is not proof that a feature exists remotely.[^e-rpc][^e-architecture]

**Record accepted intent.** The engine checks receipts, decides events, and commits events, persisted projections and the accepted receipt in one SQL transaction. The in-memory model and subscribers move after the commit. It checks aggregate identity when handling a reused command ID.[^e-engine]

**Perform external work.** Reactors and provider adapters carry out follow-up work. Provider results become further commands/events. An accepted command can therefore be followed by a provider failure; a receipt is not a completion certificate.[^e-architecture][^e-providers]

**Update interested clients.** The shared runtime manages subscriptions and cached state. It differentiates initial synchronization, a healthy socket, failed subscriptions and stale cached data. These are distinct states even when a simplified interface might be tempted to represent all of them with one spinner.[^e-runtime]

This is more useful than the generic sequence “React calls backend, backend calls AI.” It identifies where authority, durability and failure handling actually live.

## Failure semantics that should survive a rewrite

### Reconnect is not resend

The runtime documents a single transport retry owner. Offline states and authentication failures do not continually consume retries, and mutation replay is explicitly not an automatic consequence of reconnecting. The operation owns its retry/idempotency policy.[^e-runtime]

For a replacement implementation, test the case where a command commits but the acknowledgement is lost. Recovery should distinguish that from a command that never reached the server. Do not solve it by generating a new command ID and blindly repeating work.

### A cached conversation is not evidence of a live connection

The shared runtime preserves readable data across involuntary disconnects. Thread-cache state and its replay cursor must stay consistent: cancellation must not advance a cursor beyond applied data. The documented cache lifetime is five idle minutes, separate from the mounted subscription lifetime.[^e-runtime]

A replacement UI should make stale/offline data intelligible instead of erasing it or implying that the environment is healthy.

### Agent completion is not checkpoint completion

The architecture separates the end of a provider turn from later checkpoint/diff settlement. It also requires file rollback and conversation rollback to agree: a provider that cannot roll back its conversation must reject that operation before the workspace changes.[^e-architecture][^e-providers]

These are correctness constraints, not optional animation refinements. A user should not be shown an active agent merely because a late diff is still being computed.

### Local database does not mean unlimited concurrency

The persistence layer enables WAL and a busy timeout because CLI and server processes can contend for writes. SQLite's own documentation still permits only one writer at a time and requires WAL participants on the same host. Database WAL checkpoints are a different concept from T3's Git workspace checkpoints.[^e-sqlite][^e-sqlite-docs]

For a larger deployment, measure transaction latency and contention rather than assuming that either SQLite or PostgreSQL automatically resolves all bottlenecks. The inspected engine creates unbounded command/event queues; this is a reason to include queue growth and backpressure in load testing, not evidence that a production overload was observed.[^e-engine]

### Authentication is not blanket authorization

The architecture distinguishes socket authentication from authorization of individual methods. T3 Connect's bootstrap credential is bound to the client's proof key, and the relay does not receive the resulting environment-session token. However, the relay holds signing authority and remains a trusted broker; the design document explicitly warns against treating a compromised signing key as harmless.[^e-architecture][^e-connect]

Likewise, a hosted HTTPS client does not automatically make an insecure LAN backend reachable. SSH, Tailscale and managed tunnels alter reachability and lifecycle, not the fundamental owner of workspace operations.[^e-remote]

## The shortest useful source-reading trail

| Read | What to learn |
| --- | --- |
| [Architecture overview][e-architecture-link] | Ownership, intent, side effects, capability and replay constraints |
| [Web package][e-web] and [component configuration][e-components] | Actual frontend and UI dependencies, rather than assumptions from the T3 name |
| [Vite configuration][e-vite] | Route splitting, compiler setup and development versus production behavior |
| [Connection-runtime document][e-runtime-link] | One retry owner, readiness, caching and subscription lifetimes |
| [RPC contract][e-rpc-link] | Shared operation and schema boundary |
| [Orchestration engine][e-engine-link] | Receipt handling, transaction boundary and post-commit publication |
| [SQLite layer][e-sqlite-link] | Runtime-specific adapters, migrations and pragmas |
| [Provider constraints][e-providers-link] | Account/process isolation and why capabilities differ |
| [Ghostty adapter README][e-ghostty-link] | Terminal core versus rendering, input and transport |
| [Remote architecture][e-remote-link] and [Connect][e-connect-link] | Reachability, process ownership and broker trust |
| [Desktop][e-desktop], [mobile][e-mobile], [relay][e-relay], [marketing][e-marketing] manifests | Separate platform and infrastructure responsibilities |

## What this review establishes—and what it does not

The review establishes the contents of a pinned source snapshot and the architectural rules expressed by its documentation and selected implementations. It does not establish that every code path obeys every rule under load.

No T3 desktop/mobile application was launched, no provider account was exercised, no installation was benchmarked, and no comprehensive security audit was performed. A dependency declaration proves less than an observed use site; an observed use site proves less than measured behavior. Maintainer-intent claims are limited to explicit documentation/comments; the alternative recommendations are reasoned judgments.

For an implementation decision, the next evidence should come from a small representative prototype: reconnect during an active turn, drop an acknowledgement, cancel during replay, render a large diff, exercise terminal IME/paste, and restart an environment with persisted history. Those tests evaluate the actual obligations that a superficially similar stack must satisfy.

[e-web]: https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/web/package.json
[e-vite]: https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/web/vite.config.ts
[e-server]: https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/server/package.json
[e-desktop]: https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/desktop/package.json
[e-mobile]: https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/mobile/package.json
[e-marketing]: https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/marketing/package.json
[e-relay]: https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/infra/relay/package.json
[e-components]: https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/web/components.json
[e-architecture-link]: https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/docs/internals/overview.md
[e-runtime-link]: https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/docs/internals/connection-runtime.md
[e-rpc-link]: https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/packages/contracts/src/rpc.ts
[e-engine-link]: https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/server/src/orchestration/Layers/OrchestrationEngine.ts
[e-sqlite-link]: https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/server/src/persistence/Layers/Sqlite.ts
[e-providers-link]: https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/docs/internals/providers.md
[e-ghostty-link]: https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/web/src/terminal/ghostty/README.md
[e-remote-link]: https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/docs/internals/remote.md
[e-connect-link]: https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/docs/internals/t3-connect.md

[^e-root]: T3 [root package manifest](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/package.json).
[^e-catalog]: T3 [workspace catalog, overrides and dependency patches](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/pnpm-workspace.yaml).
[^e-ghostty]: T3 [Ghostty web-terminal README][e-ghostty-link].
[^e-remote]: T3 [remote architecture][e-remote-link].
[^e-rpc]: T3 [RPC contract][e-rpc-link].
[^e-architecture]: T3 [architecture overview][e-architecture-link].
[^e-engine]: T3 [orchestration engine][e-engine-link], including the receipt checks, SQL transaction, queue creation and publication sequence.
[^e-providers]: T3 [provider constraints][e-providers-link].
[^e-runtime]: T3 [connection runtime][e-runtime-link].
[^e-sqlite]: T3 [SQLite persistence layer][e-sqlite-link].
[^e-sqlite-docs]: Official SQLite [WAL documentation](https://sqlite.org/wal.html), consulted September 13, 2026.
[^e-connect]: T3 [Connect architecture and trust boundary][e-connect-link].
