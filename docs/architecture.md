# Bootstrap decisions

One repository contains content and tooling. MyST is the initial authoring format. Markdown remains readable without the renderer. The shared book theme and local CSS provide consistent presentation.

Chat uses the GitHub plugin to commit source files. GitHub Actions installs dependencies, validates MyST, and renders the website. Work was used to bootstrap the code; local Git, Node, and Python are not required for the intended Chat authoring workflow.

The repository is the handoff between the authoring assistant and the builder. Source ZIP transfer is not part of this design. Source packaging remains in the code but is no longer run by CI. The site build is passed directly to the GitHub Pages artifact action.

Build archives contain the generated static site and a manifest. Hashes detect accidental or deliberate byte changes relative to a known revision; they do not establish author identity. Remote promotion must authenticate the caller and compare the approved revision to trusted stored state.

## Remaining milestones

1. Completed: repository created, made public, source uploaded, and initial GitHub CI passed.
2. Verify an actual Chat-mode connection can submit content and receive tool results.
3. GitHub Pages selected; enable the repository Pages setting and verify the deployment.
4. Implement isolated builds, revision storage, and preview URLs.
5. Implement approval-bound promotion of the stored archive and rollback.
6. Pin/cache the upstream theme and test restricted-network builds if required.

No runtime LLM calls or analytics are needed for readers. A hosted publishing control service is distinct from the static sites it produces.
