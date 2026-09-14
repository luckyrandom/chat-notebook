---
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

The table is a map, not a list of equally important dependencies. The [evidence and alternatives companion](t3-code-stack-evidence-and-alternatives.md) records declared versions and source paths.[^web][^workspace][^server][^sqlite][^desktop][^mobile][^marketing][^relay]

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

For version details, alternative-selection criteria, failure cases and the source reading trail, continue with [T3 Code Stack: Evidence, Versions, and Alternatives](t3-code-stack-evidence-and-alternatives.md).

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
