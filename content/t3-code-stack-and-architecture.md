---
date: 2026-09-13
title: "Inside T3 Code: UI, Frontend, and Backend"
description: A source-grounded explanation of T3 Code's rendering, shared client runtime, workspace server, persistence, desktop and mobile choices, with practical alternatives.
---

**Reviewed:** September 13, 2026, America/Los_Angeles.

**Source snapshot:** [`pingdotgg/t3code` at `66e39ca2aabde054bc50312a9c34f05dbd1f6f9e`](https://github.com/pingdotgg/t3code/tree/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e). This is a review of source code and documentation, not a runtime benchmark or a claim about an installed release. Unless explicitly attributed to a repository comment or design document, the explanations of *why* are engineering interpretations, not statements about the maintainers' original motives.

## The important idea: a workspace server with several control surfaces

T3 Code is best understood as **an agent-control application whose execution stays with the workspace**. The environment server owns project files, Git operations, terminals, provider processes, and durable orchestration state. Browser, desktop, and mobile clients control that server. Even the desktop renderer respects this boundary, although the desktop application bundles a server.[^architecture]

That explains the stack better than the project's name. Its core application is not a conventional Next.js/tRPC/Prisma web application. The inspected path is React and Vite+ on the web, a shared Effect-based client runtime, schema-defined Effect RPC, and an Effect-based Node.js workspace server with SQLite. Desktop uses Electron; mobile uses Expo and React Native.[^web][^server][^rpc][^desktop][^mobile]

```text
Browser                     Electron desktop                 Mobile
apps/web                    same web renderer                apps/mobile
React + DOM                 + native desktop shell           React Native
       \                         |                          /
        +---------- packages/client-runtime ---------------+
                   connections, cached domain state,
                   subscriptions, platform interfaces
                                  |
                   packages/contracts: typed schemas
                                  |
                   authenticated RPC / WebSocket
                   + HTTP endpoints where appropriate
                                  |
                        apps/server: environment
                  Effect services and orchestration
                     /          |             \
              SQLite state   provider adapters   Git / PTY / files
                                 |
                       installed agent runtimes
```

The marketing site and optional cloud-access broker are separate concerns. Hosting the web client does not relocate the agent's workspace or turn the hosting platform into the execution backend.[^remote][^connect][^marketing]

### The smallest mechanism worth copying

The central backend mechanism is **record intent durably before performing external work**. This conceptual pseudocode compresses the orchestration engine; it is not an executable API example:

```text
handle(command):                         # serialized command processing
    if an accepted receipt exists:
        return its recorded result       # validate the command's identity/scope

    events = decide(command, currentState)

    transaction:
        append events to the event log
        update persisted read projections
        save the accepted command receipt

    update in-memory state
    publish the committed events
    return the committed sequence

reactors consume events:
    perform provider / filesystem work
    report outcomes through new commands
```

A *projection* is a convenient current-state view derived from events. A *reactor* performs work in response to recorded events. The actual engine commits the event log, projections, and accepted receipt together, then publishes. Consequently, **command accepted is not the same as agent finished**. This protects the boundary between acknowledged intent and later work; it does not establish exactly-once execution of arbitrary external side effects.[^engine]

## What each layer uses

| Layer | Inspected choices | Responsibility |
| --- | --- | --- |
| Web rendering | React 19, React Compiler, Vite+, TanStack Router | Interactive application, route loading, shared desktop renderer |
| UI design system | Base UI, Tailwind CSS 4, local shadcn-compatible component setup, CVA, Lucide | Interaction primitives, styling, variants, icons |
| Prompt and response surfaces | Lexical; React Markdown with remark/rehype | Structured prompt editing and rendered assistant output |
| Code and terminal surfaces | Pierre diffs/trees; Ghostty WASM and Canvas 2D | Source review, file navigation, terminal presentation |
| Client state | Shared Effect runtime and atom integration; Zustand for local UI stores | Environment connections and domain data versus view preferences |
| Client/server boundary | Effect Schema and Effect RPC; WebSocket and HTTP | Validated operations, subscriptions, remote control |
| Workspace backend | Node.js, Effect services, provider adapters, node-pty | Processes, agent sessions, terminal PTYs, Git and files |
| Durable storage | SQLite through Effect SQL, migrations, WAL | Events, receipts, projections and environment state |
| Desktop/mobile | Electron; Expo and React Native | Platform integration and platform-specific presentation |
| Supporting infrastructure | pnpm/Vite+ workspaces; Astro marketing; optional Clerk/relay infrastructure | Development, distribution, public pages and remote-access setup |

The table is a map, not a list of equally important dependencies. The [evidence and alternatives sections](#t3-stack-reference) record declared versions and source paths.[^web][^workspace][^server][^sqlite][^desktop][^mobile][^marketing][^relay]

## Frontend: why a React application rather than a full-stack page framework?

### React + Vite+ + TanStack Router

The frontend must remain useful while connected to a long-running environment, and the same web rendering code serves the desktop experience. Given those constraints, a client application with an independent server is a natural fit: routing and rendering do not need to own agent execution.[^architecture][^remote]

The Vite configuration enables TanStack Router's automatic route splitting and the React Compiler. A repository comment specifically says that settings, pull-request, and usage code should stay outside the cold-start payload. The distinctive configuration is small:

```typescript
// Simplified excerpt; not a complete Vite configuration.
tanstackRouter({ autoCodeSplitting: true });
babel({ presets: [reactCompilerPreset()] });
```

This is evidence of deliberate loading and compilation choices, not proof that the application is faster than every alternative. The configuration also contains an opt-in experimental bundled development mode; it should not be described as an unconditional production architecture.[^vite]

**Alternative judgment:** Next.js becomes more attractive when server-rendered pages and framework-owned request handling are central to the product. It is not technically excluded here: Next.js supports static exports. The question is whether its additional framework model solves this application's main problems, not whether it can render inside a desktop shell.[^next]

React Router, Vue, or Svelte could implement the same ownership boundary. Replacing React would change component and platform reuse, but would not remove the need for connection supervision, agent lifecycle handling, and durable state. Those are independent architectural obligations.

### Base UI + Tailwind + locally owned components

The UI setup points to the shadcn schema with the `base-mira` style and `rsc: false`. The actual button implementation imports Base UI's composition helpers, uses class-variance-authority for variants, and applies Tailwind classes and CSS variables. Thus “shadcn-style” describes the local component workflow; **Base UI is the inspected primitive layer**, not an assumed Radix dependency.[^components][^button]

Conceptually, the design system is:

```text
Base UI behavior
    + locally maintained React wrappers
    + Tailwind styles and CSS-variable tokens
    + CVA variants and icon components
```

Base UI is unstyled and leaves the visual design to the application. My interpretation is that this fits a dense developer interface better than accepting a fixed visual language: compact controls, menus, selections, and touch targets can be adjusted locally.[^base-ui][^button]

The cost is ownership. Local component source does not maintain itself; styling changes still need keyboard, focus, contrast, and touch testing. For an ordinary administration tool, an opinionated component suite may reduce design work. For a team with an established CSS system, CSS Modules or plain CSS can replace Tailwind without changing the server architecture.

### Different UI problems get different rendering engines

**Prompt editing:** Lexical is used in the composer, with a separate custom citation node. This is a richer problem than displaying text: context references need stable identity, editing behavior, and serialization. My default for a smaller tool would be a textarea until structured inline content actually justifies an editor framework.[^composer]

**Assistant output:** The web stack uses React Markdown and remark/rehype tooling. `ChatMarkdown.tsx` imports both raw-HTML handling and sanitization. This shows that generated content has a dedicated rendering pipeline; it is not evidence of a complete security audit.[^markdown]

**Source and diff review:** Pierre components appear in source previews, alongside a virtualizer and a worker-pool provider. These mechanisms address large code views and expensive processing. The useful lesson is to separate code-review rendering from ordinary chat layout, not to assume that importing a specialized package makes every view cheap.[^diffs]

**Terminal:** The current browser terminal is especially distinctive: `libghostty-vt` compiled to WebAssembly, translated into render snapshots and painted with **Canvas 2D**. Browser input, IME, selection, sizing and scrolling live in a surface adapter. Its README explicitly keeps transport in the client runtime and React state out of the rendering loop. It shares the underlying C ABI with Android; it is not an xterm compatibility layer.[^ghostty]

My interpretation is that this buys control over terminal behavior and a shared terminal core at the price of maintaining substantial browser integration. **xterm.js is the simpler candidate to evaluate first** for a conventional browser terminal. Either choice still requires a backend terminal process; a terminal renderer is not a shell.[^xterm][^server]

## State: the important split is not React versus Zustand

T3 does not place all application state in one Zustand store. The shared client runtime owns environment connections, session replacement, subscriptions, and cached domain state. Zustand appears in narrower web stores such as diff-panel preferences and sidebar multi-selection.[^runtime][^zustand]

This distinction matters when two components observe the same environment. They should not independently open sockets, retry authentication, or race to replace a connection. The documented runtime gives that responsibility to one supervisor. A transport can also be healthy while a data subscription has failed; the UI should not label both situations “reconnecting.”[^runtime]

A useful mental model is:

```text
server-owned truth       → shared client runtime / projections
local interaction state → component state or a local UI store
platform capabilities   → storage, credentials, network and lifecycle adapters
```

**Alternative judgment:** React state and a small store are enough for a single-view tool. An HTTP query/cache library can handle request-oriented data, but it does not eliminate the separate design work for a persistent agent session. A simpler custom supervisor is reasonable; having several accidental supervisors is not.

## Backend: why Effect, RPC, and SQLite?

### Effect is an application runtime, not just an HTTP framework

The server uses Effect services and layers, and the orchestration engine composes queues, pub/sub, typed errors, SQL, and explicit service dependencies. Effect is also present in the shared client layer.[^engine][^server][^runtime]

Effect provides abstractions for typed failures, dependency injection, concurrency, and resource cleanup. My interpretation is that these are a good match for overlapping lifetimes: provider processes, socket sessions, background workers, terminal streams and shutdown. A plain route-handler abstraction addresses only part of that problem.[^effect]

The cost is significant conceptual and ecosystem commitment. Contributors must understand service requirements and Effect's execution model, and the inspected workspace pins **Effect 4 release-candidate packages**. For a small project, ordinary promises, explicit cleanup, cancellation signals, and a disciplined process supervisor may be easier to maintain. Effect is not required to preserve T3's boundaries.[^workspace]

### Shared schemas and Effect RPC

The contract imports Effect Schema, RPC and RPC groups, and defines operations using shared domain schemas. The architecture documentation explicitly treats this as the boundary between independently upgraded clients and servers.[^rpc][^architecture]

The inferred advantage is consistency: operation inputs, failures, subscriptions and domain types use the same vocabulary as the runtime. The important caveat is that **shared TypeScript source does not make old deployed clients disappear**. Capability negotiation and persisted-event compatibility still need deliberate design.[^architecture]

A REST API plus a streaming channel, or tRPC, can implement a similar product. tRPC itself supports subscriptions, so “T3 needs streaming” is not a sufficient reason to reject it. Effect RPC's fit here is integration with the existing Effect model, not exclusive access to real-time communication.[^trpc]

### SQLite fits the environment boundary

The persistence layer configures SQLite migrations, foreign keys, WAL mode and a five-second busy timeout. It selects a Node adapter or Bun adapter at runtime; the normal inspected development/start scripts use Node. “Bun-only backend” would be inaccurate.[^sqlite][^server]

My interpretation is that SQLite follows the deployment unit: one environment owns its durable state, without requiring a separate database service for every developer machine. WAL supports concurrent readers and a writer, but still allows only one writer at a time. It is not a license to share the database over a network filesystem.[^sqlite-docs]

A central multi-user service may justify PostgreSQL and a different operational model. A small local tool can begin with conventional state tables and a durable jobs/receipts table rather than copying the complete event-sourcing machinery. What should survive simplification is the rule that acknowledgements, durable state and external side effects have distinct meanings.

### Provider adapters keep the agent runtime out of the UI

Provider-specific behavior is normalized at an adapter boundary. The documents distinguish an integration kind from a configured instance/account, and describe provider-specific process and capability constraints. For example, managed OpenCode chat uses a server per thread to avoid collisions between directory-scoped MCP registrations and thread-scoped connections.[^providers]

This is why the backend should not be described as a generic model-API proxy. The agent runtime has its own tools, permissions, account state and conversation behavior. T3 supplies control and orchestration around those boundaries. The existing [Codex integration note](how-t3-code-uses-codex.md) examines that path in more detail using its own pinned snapshot.

## Desktop, mobile, and cloud: reuse the right layer

**Electron** is a plausible fit because it combines a web renderer with a Node-capable desktop main process. T3's manifest also includes updating, secure key storage and SSH-related integrations. Its architecture isolates crash-prone native capabilities rather than loading them indiscriminately into the startup path.[^desktop][^architecture][^electron]

The tradeoff is the browser-runtime distribution footprint and ongoing desktop security/update work. **Tauri** is a credible alternative using a Rust core and operating-system WebViews. It can retain a Node backend as a sidecar, so a full backend rewrite is not mandatory. That alternative trades some bundling uniformity for platform WebView differences and sidecar integration work; it is not automatically the better choice for a Node-heavy product.[^tauri]

**Mobile** uses Expo and React Native, with native navigation, secure storage and custom modules for markdown, diff review and terminals. The shared unit is the client runtime and contracts, not every DOM component. My interpretation is that this protects connection behavior while allowing a genuinely different mobile interface. A responsive web app would be the lower-complexity starting point when native integration does not yet justify another application.[^mobile][^runtime]

**T3 Connect** is optional access infrastructure: Clerk supplies cloud identity and a relay brokers links, bootstrap credentials and managed tunnels. After bootstrap, application traffic goes through the environment's tunnel hostname; the relay Worker is not the HTTP/WebSocket application proxy. Its signing authority remains a real trust boundary.[^connect]

The relay manifest declares a PostgreSQL driver, Drizzle and Alchemy. That does **not** mean the workspace server uses Drizzle/PostgreSQL, nor does it establish the exact deployed database vendor. The separate marketing application uses Astro.[^relay][^marketing]

## What I would copy, and what I would postpone

For a smaller agent-control tool, I would copy **the ownership model before the package list**: keep execution next to the workspace; define a narrow contract; centralize connection supervision; distinguish accepted intent from completed work; and isolate provider-specific behavior.

A reasonable first implementation would be a web client, one Node process, SQLite, one provider adapter, and an ordinary terminal component only when needed. Add durable command IDs and explicit job states early. Add a rich composer, full event sourcing, Electron, native mobile, a custom Ghostty adapter or cloud brokerage only when the required experience makes their maintenance cost worthwhile.

The distinctive lesson is therefore not “use React and Effect everywhere.” It is **keep platform presentation replaceable while preserving one coherent execution, state and lifecycle model**.

For version details, alternative-selection criteria, failure cases and the source reading trail, continue with [T3 Code Stack: Evidence, Versions, and Alternatives](#t3-stack-reference).

(t3-stack-reference)=
## Dependency inventory, alternatives, and failure semantics

**Reviewed:** September 13, 2026, America/Los_Angeles.

**Snapshot:** [`66e39ca2aabde054bc50312a9c34f05dbd1f6f9e`](https://github.com/pingdotgg/t3code/tree/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e). The commit timestamp is September 14 at 00:08:41 UTC, which is September 13 at 17:08:41 in Los Angeles. It is a source snapshot, not necessarily a packaged release or the version installed by a reader.

These reference sections preserve the inventory, evidence boundaries, and alternative-selection criteria.

Open a section for the supporting detail; the main explanation above remains the reading path.

(t3-stack-reference-dependency-inventory-declarations-not-an-installation-audit)=
````{dropdown} Dependency inventory: declarations, not an installation audit

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
````

(t3-stack-reference-alternatives-change-the-implementation-not-accidentally-the-requirements)=
````{dropdown} Alternatives: change the implementation, not accidentally the requirements

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
````

(t3-stack-reference-follow-one-operation-through-the-system)=
````{dropdown} Follow one operation through the system

A useful way to read the code is to follow a user action rather than a directory tree.

**Choose the owning environment.** The client resolves the action against that environment's connection. A project on another machine is not interchangeable with a local checkout that happens to have the same repository name. The remote architecture keeps environment identity separate from endpoint selection.[^e-remote]

**Send a schema-defined command.** The shared contract describes the boundary. An independently upgraded server may have different capabilities; client knowledge alone is not proof that a feature exists remotely.[^e-rpc][^e-architecture]

**Record accepted intent.** The engine checks receipts, decides events, and commits events, persisted projections and the accepted receipt in one SQL transaction. The in-memory model and subscribers move after the commit. It checks aggregate identity when handling a reused command ID.[^e-engine]

**Perform external work.** Reactors and provider adapters carry out follow-up work. Provider results become further commands/events. An accepted command can therefore be followed by a provider failure; a receipt is not a completion certificate.[^e-architecture][^e-providers]

**Update interested clients.** The shared runtime manages subscriptions and cached state. It differentiates initial synchronization, a healthy socket, failed subscriptions and stale cached data. These are distinct states even when a simplified interface might be tempted to represent all of them with one spinner.[^e-runtime]

This is more useful than the generic sequence “React calls backend, backend calls AI.” It identifies where authority, durability and failure handling actually live.
````

(t3-stack-reference-failure-semantics-that-should-survive-a-rewrite)=
````{dropdown} Failure semantics that should survive a rewrite

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
````

(t3-stack-reference-the-shortest-useful-source-reading-trail)=
````{dropdown} The shortest useful source-reading trail

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
````

(t3-stack-reference-what-this-review-establishes-and-what-it-does-not)=
````{dropdown} What this review establishes—and what it does not

The review establishes the contents of a pinned source snapshot and the architectural rules expressed by its documentation and selected implementations. It does not establish that every code path obeys every rule under load.

No T3 desktop/mobile application was launched, no provider account was exercised, no installation was benchmarked, and no comprehensive security audit was performed. A dependency declaration proves less than an observed use site; an observed use site proves less than measured behavior. Maintainer-intent claims are limited to explicit documentation/comments; the alternative recommendations are reasoned judgments.

For an implementation decision, the next evidence should come from a small representative prototype: reconnect during an active turn, drop an acknowledgement, cancel during replay, render a large diff, exercise terminal IME/paste, and restart an environment with persisted history. Those tests evaluate the actual obligations that a superficially similar stack must satisfy.
````

[^architecture]: T3 [architecture and ownership boundaries](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/docs/internals/overview.md).
[^web]: T3 [web package manifest](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/web/package.json).
[^server]: T3 [server package manifest and runtime scripts](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/server/package.json).
[^rpc]: T3 [shared RPC contract](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/packages/contracts/src/rpc.ts).
[^desktop]: T3 [desktop package manifest](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/desktop/package.json).
[^mobile]: T3 [mobile package manifest](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/mobile/package.json).
[^remote]: T3 [remote architecture](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/docs/internals/remote.md).
[^connect]: T3 [Connect architecture and trust boundary](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/docs/internals/t3-connect.md).
[^marketing]: T3 [marketing package manifest](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/marketing/package.json).
[^engine]: T3 [orchestration engine](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/server/src/orchestration/Layers/OrchestrationEngine.ts), particularly receipt handling and the transaction/publish sequence.
[^workspace]: T3 [workspace catalog and overrides](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/pnpm-workspace.yaml) and [root scripts](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/package.json).
[^sqlite]: T3 [SQLite persistence layer](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/server/src/persistence/Layers/Sqlite.ts).
[^relay]: T3 [relay package manifest](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/infra/relay/package.json).
[^vite]: T3 [Vite configuration](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/web/vite.config.ts).
[^next]: Official Next.js [static-export documentation](https://nextjs.org/docs/app/guides/static-exports), consulted September 13, 2026.
[^components]: T3 [component registry configuration](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/web/components.json).
[^button]: T3 [local button component](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/web/src/components/ui/button.tsx).
[^base-ui]: Official [Base UI documentation](https://base-ui.com/), consulted September 13, 2026.
[^composer]: T3 [composer editor](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/web/src/components/ComposerPromptEditor.tsx) and [citation node](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/web/src/components/ComposerCitationNode.tsx).
[^markdown]: T3 [chat Markdown renderer](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/web/src/components/ChatMarkdown.tsx).
[^diffs]: T3 [source preview](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/web/src/components/files/ReadOnlySourcePreview.tsx) and [diff worker pool](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/web/src/components/DiffWorkerPoolProvider.tsx).
[^ghostty]: T3 [Ghostty web-terminal architecture](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/web/src/terminal/ghostty/README.md).
[^xterm]: Official [xterm.js project site](https://xtermjs.org/), consulted September 13, 2026.
[^runtime]: T3 [connection runtime](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/docs/internals/connection-runtime.md).
[^zustand]: T3 [diff-panel store](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/web/src/diffPanelStore.ts) and [thread-selection store](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/apps/web/src/threadSelectionStore.ts).
[^effect]: Official [Effect overview](https://effect.website/), consulted September 13, 2026; the repository pin, rather than unversioned examples, determines the inspected API generation.
[^trpc]: Official tRPC [subscription documentation](https://trpc.io/docs/server/subscriptions), consulted September 13, 2026.
[^sqlite-docs]: Official SQLite [WAL documentation](https://sqlite.org/wal.html), consulted September 13, 2026.
[^providers]: T3 [provider constraints](https://github.com/pingdotgg/t3code/blob/66e39ca2aabde054bc50312a9c34f05dbd1f6f9e/docs/internals/providers.md).
[^electron]: Official Electron [process model](https://www.electronjs.org/docs/latest/tutorial/process-model), consulted September 13, 2026.
[^tauri]: Official Tauri [process model](https://v2.tauri.app/concept/process-model/), including its link to Node.js sidecar guidance, consulted September 13, 2026.
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
