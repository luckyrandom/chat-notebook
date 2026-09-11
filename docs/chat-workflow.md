# Authoring in Chat with the GitHub plugin

## Prompt to use in Chat

> Use the GitHub plugin to save this note in `luckyrandom/chat-notebook`. First read `README.md`, `docs/chat-workflow.md`, `myst.yml`, and any files you need to update. Create or update the note under `content/`, save its images under `content/assets/`, and add new pages to the table of contents in `myst.yml`. Preserve the approved wording and references and use the shared theme. Commit the changes to `main` unless I specify another branch. Then check the “Check notebook” GitHub Actions run for that exact commit. Give me links to the saved note, the commit, and the build result. Fix build errors caused by your changes. Saving to GitHub is not public publication; publish only after I approve a preview.

“This note” means the content developed in the current conversation. If the subject or intended text is missing, ask which note to save.

## What “upload” means

Save the actual source files in the GitHub repository as a commit. A note becomes a Markdown file, an image becomes an asset file, and the table of contents is updated when a page is added. Do not merely paste the note into an issue, comment, or reply.

Use the GitHub plugin's file and commit tools. The user does not need to supply a Git command, API endpoint, tool name, or command-line argument. No local Git checkout, Python packaging, npm installation, or source ZIP is required for this authoring path.

## Instructions for the assistant

1. **Read the repository first.** Use the connected GitHub plugin to confirm access to `luckyrandom/chat-notebook`. Read these instructions, the configuration, and the current versions of affected files. Use a stable commit reference when reading related files.
2. **Prepare source changes.** Use a descriptive filename such as `content/averaging-noise.md`. Keep approved prose and citations intact. Use MyST syntax supported by the existing example. Put images in `content/assets/` and reference them with relative paths. Update `project.toc` in `myst.yml` for new pages without removing existing entries.
3. **Save through the plugin.** Discover the GitHub write tools available in this session. For a new text file use its create-file operation; for an existing file use its update-file operation with the current blob SHA. When Git tree/commit tools are available, prefer one commit containing all related changes. Base that tree on the current repository tree so unrelated files are preserved, and advance the branch without force. If the branch changes concurrently, read the latest state and reconcile before retrying.
4. **Handle assets faithfully.** Use binary-capable blob/commit tools for images if available. Text-file operations are suitable for Markdown and SVG, not arbitrary binary images. If the available plugin cannot save a required asset, report that specific limitation; do not claim it was uploaded.
5. **Check the exact commit.** Verify that the target branch contains the saved commit. A push triggers `.github/workflows/check.yml`, which installs dependencies, runs tests, validates MyST, generates HTML, and uploads build artifacts. Find the run whose head SHA matches the final commit; a successful older run does not validate new changes. If individual file writes produced multiple commits, check the final one.
6. **Report the result.** Return links to the note in GitHub, the commit, and the Actions run. Say whether the build passed, failed, or is still queued/running. On failure, inspect logs and fix errors introduced by the changes while preserving approved content. If inspection is unavailable, say the build result is unverified.

Use the user-specified branch, or `main` for ordinary saves when no branch is specified. If repository protections require a pull request, save on a branch and open a PR instead; report that the note is pending merge.

If the plugin is disconnected, lacks write permission, or has only read tools, explain the specific missing access. Do not silently substitute a ZIP handoff.

## What is available today

The private GitHub repository and its Actions build are working; the initial build passed. The same plugin-based write operations were exercised from Work. Their availability in a particular Chat session must be checked there.

A GitHub file link is a saved source note, not a published website. An Actions artifact is downloadable build output, not a hosted preview. Hosted preview links and approval-based publication are not connected yet. Do not invent a preview URL or describe a successful build as publication.

## Intended publishing extension

After source is committed, hosting will expose the built revision at a preview URL. Chat will return that link, obtain approval for that revision, and promote the already-built files. That future step must preserve the exact reviewed content.
