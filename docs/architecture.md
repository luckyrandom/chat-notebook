# Bootstrap decisions

One repository contains content and tooling. MyST is the initial authoring format. Markdown remains readable without the renderer. The shared book theme and local CSS provide consistent presentation.

The runtime contract is capability-based, not product-based: use Node when available, Python-only packaging otherwise. Work was used to bootstrap the code; Work is not a required consumer.

Source archives include only content/, themes/, tools/, docs/, myst.yml, package.json, package-lock.json, README.md, .nvmrc, .gitignore, and the CI workflow. They do not include Git history, node_modules, build output, or credentials. Review assets before packaging: every file inside the included trees is part of the source package.

Build archives contain the generated static site and a manifest. Hashes detect accidental or deliberate byte changes relative to a known revision; they do not establish author identity. Remote promotion must authenticate the caller and compare the approved revision to trusted stored state.

## Remaining milestones

1. Create and push the repository, then observe CI in GitHub.
2. Verify an actual Chat-mode connection can submit content and receive tool results.
3. Select preview visibility and one hosting provider.
4. Implement isolated builds, revision storage, and preview URLs.
5. Implement approval-bound promotion of the stored archive and rollback.
6. Pin/cache the upstream theme and test restricted-network builds if required.

No runtime LLM calls or analytics are needed for readers. A hosted publishing control service is distinct from the static sites it produces.
