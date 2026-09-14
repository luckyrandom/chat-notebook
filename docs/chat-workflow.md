# Authoring in Chat with the GitHub plugin

## Prompt to use in Chat

> Use the GitHub plugin to save this note in `luckyrandom/chat-notebook`. First read `.chatgpt/skills/chat-notebook-publisher/SKILL.md` from the current `main` branch, then `README.md`, `docs/chat-workflow.md`, `myst.yml`, and any files you need to update. Create or update one self-contained note under `content/`, with long supporting material in named MyST dropdowns and essential caveats visible. For a new note use `YYYY-MM-DD-slug.md` and matching creation-date frontmatter; keep existing filenames stable. Save its images under `content/assets/`, and refresh the generated date-grouped navigation. Preserve the approved wording and references and use the shared theme. Save drafts on a descriptive branch and open a pull request to `main`. Merge into `main` only when I ask to publish, because it deploys automatically once Pages is enabled. Then check the “Check notebook” GitHub Actions run for that exact commit. Give me links to the saved note, the commit, and the build result. For publication, lead with the deployed article link and distinguish deployment from live verification. Return links and status, not ZIPs or attachments. If live verification is blocked, report the limitation without downloading an archive as a substitute. Fix build errors caused by your changes. The repository is public, including draft branches. Saving a draft branch does not update the website. Rendered draft preview URLs are not available yet; do not promise one.

“This note” means the content developed in the current conversation. If the subject or intended text is missing, ask which note to save.

## What “upload” means

Save the actual source files in the GitHub repository as a commit. A note becomes a Markdown file, an image becomes an asset file, and the table of contents is updated when a page is added. Do not merely paste the note into an issue, comment, or reply.

Use the GitHub plugin's file and commit tools. The user does not need to supply a Git command, API endpoint, tool name, or command-line argument. No local Git checkout, Python packaging, npm installation, or source ZIP is required for this authoring path.

## Instructions for the assistant

1. **Read the repository first.** Use the connected GitHub plugin to confirm access to `luckyrandom/chat-notebook`. Read the canonical publisher skill from the current `main` branch, these instructions, the configuration, and the current versions of affected files. Use a stable commit reference when reading related files.
2. **Prepare source changes.** Default to one article, such as `content/2026-09-13-averaging-noise.md`, with `title`, `description`, and matching `date` frontmatter. Preserve the original creation date and existing filenames on edits. Keep approved prose and citations intact. Use MyST syntax supported by the existing example. Put images in `content/assets/` and reference them with relative paths. Put long reference details in same-page `{dropdown}` blocks with descriptive titles and four-backtick fences; keep conclusions and essential caveats visible. Only split independently useful topics or explicitly requested documents. Run `npm run articles:sync` to refresh the homepage and TOC, then `npm run articles:check` to validate metadata and navigation freshness.
3. **Save through the plugin.** Discover the GitHub write tools available in this session. For a new text file use its create-file operation; for an existing file use its update-file operation with the current blob SHA. When Git tree/commit tools are available, prefer one commit containing all related changes. Base that tree on the current repository tree so unrelated files are preserved, and advance the branch without force. If the branch changes concurrently, read the latest state and reconcile before retrying.
4. **Handle assets faithfully.** Use binary-capable blob/commit tools for images if available. Text-file operations are suitable for Markdown and SVG, not arbitrary binary images. If the available plugin cannot save a required asset, report that specific limitation; do not claim it was uploaded.
5. **Check the exact commit.** Verify that the target branch contains the saved commit. A push triggers `.github/workflows/check.yml`, which installs dependencies, runs tests, validates MyST, generates HTML, and uploads build artifacts. Find the run whose head SHA matches the final commit; a successful older run does not validate new changes. If individual file writes produced multiple commits, check the final one.
6. **Report the result.** Return links to the note in GitHub, the commit, and the Actions run. Say whether the build passed, failed, or is still queued/running. On failure, inspect logs and fix errors introduced by the changes while preserving approved content. If inspection is unavailable, say the build result is unverified.

If local execution is unavailable, read the navigation generator and make equivalent homepage and TOC edits through the connector. GitHub Actions checks the generated result; the Chat path does not require a local shell.

Use the user-specified draft branch, or create a descriptive `notes/<slug>` branch from the latest `main`. Save there and open a pull request. Only merge or commit to `main` after explicit publication authorization. After an authorized merge, check both build and deployment for the merged commit and return the URL from the deployment output.

If the plugin is disconnected, lacks write permission, or has only read tools, explain the specific missing access. Do not silently substitute a ZIP handoff.

## Publication handoff and verification

Follow the [canonical deliverable boundary](../.chatgpt/skills/chat-notebook-publisher/SKILL.md#deliverable-boundary-links-not-archives): return links and status, not file bundles. This applies even when GitHub access works. Do not create, download, attach, or offer archive bundles unless the user explicitly requests an archive, offline bundle, or artifact-level inspection. A download tool may automatically expose an attachment before the final answer; calling it internal verification does not make it invisible.

Use source checks, exact-commit Actions status, text logs, and the public page for ordinary verification. If deployment succeeded but live access is blocked, report "Deployed; live verification incomplete" with the observed limitation and deployed article URL. Do not replace the live check with an archive download. Explicitly requested artifact inspection is a separate result, not proof that the public page serves the expected content. CI's existing artifact creation and upload remain unchanged.

## What is available today

The repository is public. GitHub Actions validates branches and pull requests. Successful builds on `main` deploy to GitHub Pages once repository Settings → Pages → Source is set to GitHub Actions. See [deployment setup](deployment.md).

Build and deployment are separate results: do not call a successful build a successful publication. Return the deployment URL only after the deploy job succeeds. A GitHub source link or downloadable artifact is not a hosted preview.

The plugin-based write path was exercised from Work. Check the write capabilities available in the current Chat session.

## Preview limitation

This first version builds again after a merge and publishes that build. It does not provide rendered draft preview URLs or promotion of an earlier preview's exact bytes. Review source in the pull request for now; rendered previews and exact-artifact promotion remain future work.
