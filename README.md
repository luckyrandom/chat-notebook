# Chat Notebook

Notes, reports, and publishing tools in one repository. Author through the GitHub plugin in Chat or Work; GitHub Actions validates and builds the website.

## Local development (optional)

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

Ask Chat to use the GitHub plugin to save drafts on a branch in `luckyrandom/chat-notebook`, open a pull request, and check the build. Merge into `main` when you ask to publish. Read [the Chat guide](docs/chat-workflow.md) for a ready-to-use prompt and precise assistant instructions. The [publisher skill](.chatgpt/skills/chat-notebook-publisher/SKILL.md) is the canonical workflow.

“Upload” means saving Markdown, assets, and configuration as repository files. Chat does not need local Git, npm, Python, or a source ZIP for this workflow. GitHub Actions handles dependency installation, validation, and rendering.

For drafts, return the source, pull request, commit, and Actions links with their status. For publication, lead with the deployed article link and report the exact commit, build/deployment result, and live-verification status. Successful builds on `main` deploy to GitHub Pages after the one-time [Pages setup](docs/deployment.md). Draft branches do not deploy. The repository and its draft branches are public.

The default handoff is links and status, not ZIPs or attachments. Do not create or download archive bundles, including for internal verification, unless the user explicitly requests an archive, offline bundle, or artifact-level inspection. Download tools may automatically attach files to the chat. If the live page cannot be checked, report that limitation rather than substituting a build archive.

## Article structure and navigation

Default to one self-contained article per request. Keep the core explanation and essential caveats visible; put long derivations, implementations, and evidence in named MyST dropdowns on the same page. Tabs are for alternative examples, not for separating an article from its references. See [Writing a Good Technical Note](content/writing-a-good-technical-note.md).

New articles use `content/YYYY-MM-DD-slug.md` and `title`, `description`, and `date` frontmatter. The date records original creation and stays stable on edits. The contract is defined in `schema/article.schema.json`; `schema/articles.json` records legacy paths and compatibility pages. Run `npm run articles:sync` after adding or changing metadata, then `npm run articles:check` to validate metadata and generated navigation. Existing undated filenames retain their URLs. Navigation groups articles by month, newest first, while keeping human-readable titles.

## Skill-only ChatGPT plugin

This repository also distributes a skill-only `chat-notebook` plugin. The marketplace manifest is `.agents/plugins/marketplace.json`, and the plugin source is under `plugins/chat-notebook/`.

The plugin packages reusable guidance for note taking, technical writing, and the Chat Notebook publication workflow. It declares no MCP server and bundles no app connection. Actual repository reads, writes, pull requests, Actions checks, merges, and deployment verification still require a GitHub capability with the necessary access.

To manage it from a ChatGPT workspace, import this repository as a GitHub-backed plugin marketplace from the repository root. Use the repository URL as the source, leave the marketplace path empty, and track `main` for merged updates. The plugin's [README](plugins/chat-notebook/README.md) describes its contents and capability boundary.

## Optional archive integrity checks

These commands are for explicitly requested offline or artifact-integrity work, not the normal Chat publication handoff. After building:

```sh
python3 tools/package.py site
python3 tools/package.py verify dist/site-<revision>.zip
```

Each archive contains a manifest of file hashes. Its name identifies the exact packaged bytes. These hashes provide integrity, not identity, authorization, or proof of what the live site serves.

The current Pages workflow rebuilds after an authorized merge to `main` and deploys the HTML artifact from that successful build. It does not promote a previously reviewed draft archive. Exact-artifact promotion without rebuilding is a future capability, not an instruction to download or deliver a ZIP. CI can retain its existing archive artifacts without attaching them to the chat.

## Layout

- `content/`: authoritative notes, references, and assets.
- `themes/`: shared presentation.
- `tools/`: portable archive creation and integrity verification.
- `docs/`: architecture, compatibility, and setup.
- `.github/workflows/check.yml`: branch validation and automatic Pages deployment from `main`.
- `_build/`, `dist/`: generated output, excluded from source control.

## Current scope

Working bootstrap: MyST example, shared CSS, pinned CLI, source/site archives, local verification, CI definition.

Next: complete Pages setup, verify the GitHub write workflow in the intended Chat session, then add draft preview URLs, exact-artifact promotion, revision listing and rollback. Arbitrary HTML and interactive applications are future input formats, not implemented by this MyST starter.

The CLI wrapper falls back to loopback discovery if a hosted environment denies network-interface enumeration. Other errors are preserved.

MyST CLI is pinned by `package-lock.json`. Its upstream book theme may download separately during a build; a fully offline or byte-reproducible renderer is not yet guaranteed. Archive hashes identify the build actually reviewed rather than promising identical future rebuilds.

## Sources

- https://mystmd.org/cli/reference
- https://mystmd.org/guide/website-templates
- https://mystmd.org/guide/table-of-contents

## GitHub access

The repository is [luckyrandom/chat-notebook](https://github.com/luckyrandom/chat-notebook), and is public. Give the GitHub plugin access to this repository. Authoring requires repository write tools; reading repository files alone is insufficient. The initial GitHub Actions build passed.

The existing source-archive utility remains in the code for now, but is not part of the Chat authoring workflow and is no longer run by CI.
