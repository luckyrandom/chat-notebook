# Chat Notebook

Notes, reports, and publishing tools in one repository. Author in Chat or Work; build wherever the required tools are available.

## Quick start

Requires Node.js 22+ and Python 3.10+.

```sh
npm ci --ignore-scripts
npm run check
npm run build
python3 -m http.server 8000 --directory _build/html
```

Open http://localhost:8000. HTML output needs a static HTTP server; double-clicking an HTML file is not a supported preview method.

`npm run check` checks MyST site content. `npm run build` also produces the static website. External link checking is opt-in with `npx myst build --site --strict --check-links`; it needs internet access.

## Authoring in Chat

Read [the Chat guide](docs/chat-workflow.md). Change `content/`, add assets under `content/assets/`, and update `project.toc` in `myst.yml` for new pages. Preserve approved wording.

If Node or networking is unavailable:

```sh
python3 tools/package.py source
```

This creates a portable source ZIP using only Python's standard library. It checks packaging integrity, **not MyST semantics**. A connected builder unpacks the archive and runs the same `npm ci`, check, and build commands. No remote builder or Chat publishing connector is deployed yet.

## Reviewable revisions

After building:

```sh
python3 tools/package.py site
python3 tools/package.py verify dist/site-<revision>.zip
```

Each archive contains a manifest of file hashes. Its name identifies the exact packaged bytes. Publish the reviewed site archive without rebuilding. These hashes provide integrity, not identity or authorization. Production publication requires an authenticated service and user approval; neither is implied by creating an archive.

## Layout

- `content/`: authoritative notes, references, and assets.
- `themes/`: shared presentation.
- `tools/`: portable archive creation and integrity verification.
- `docs/`: architecture, compatibility, and setup.
- `.github/workflows/check.yml`: build and archive checks; no deployment.
- `_build/`, `dist/`: generated output, excluded from source control.

## Current scope

Working bootstrap: MyST example, shared CSS, pinned CLI, source/site archives, local verification, CI definition.

Next: authenticated Chat integration, hosted preview URLs, exact-artifact promotion, revision listing and rollback. Arbitrary HTML and interactive applications are future input formats, not implemented by this MyST starter.

The CLI wrapper falls back to loopback discovery if a hosted environment denies network-interface enumeration. Other errors are preserved.

MyST CLI is pinned by `package-lock.json`. Its upstream book theme may download separately during a build; a fully offline or byte-reproducible renderer is not yet guaranteed. Archive hashes identify the build actually reviewed rather than promising identical future rebuilds.

## Sources

- https://mystmd.org/cli/reference
- https://mystmd.org/guide/website-templates
- https://mystmd.org/guide/table-of-contents

## GitHub setup

Create a private empty repository named `chat-notebook` under the intended account, then push this checkout. Private source and public published output are separate choices.

```sh
git remote add origin https://github.com/luckyrandom/chat-notebook.git
git push -u origin main
```

If starting from the source ZIP, initialize and commit first (`git init -b main`, `git add .`, `git commit -m "Bootstrap Chat Notebook"`). Authorize the GitHub connection to access the new repository if necessary.
