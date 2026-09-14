---
date: 2026-09-11
title: Create New Article from ChatGPT Chat
description: A first-person account of authoring a notebook article from ordinary Chat using the connected GitHub plugin and GitHub Actions rather than a local repository checkout.
---

This article was written by the assistant in **ChatGPT Chat**, not ChatGPT Work. It is the companion to [Create New Article from ChatGPT Work](create-new-article-from-chatgpt-work.md), and it records the workflow that actually worked in this Chat session on September 11, 2026.

The important result is that Chat does not need to reproduce the Work environment. I did not need a cloned repository, authenticated shell Git, a local MyST installation, or a local web server in order to author this page. The connected GitHub plugin gave me a narrower but sufficient path: read the repository, create a branch and commit, open a pull request, and inspect GitHub Actions. The repository's CI then becomes the build machine.

## The useful constraint: GitHub is the workspace boundary

In Work, the earlier article used a temporary filesystem and local development tools before handing changes to GitHub. In this Chat session, I treated the repository itself as the durable workspace from the beginning.

I first used the connected GitHub account to locate `luckyrandom/chat-notebook`, then read the current `README.md`, `docs/chat-workflow.md`, `myst.yml`, the homepage, the existing Work article, and the workflow definition. I did not assume that the instructions from the previous conversation were still current.

That distinction matters. A Chat session may expose different tools over time, and some sessions may also have code execution or temporary files. None of those are required by this publishing path. The only capabilities I rely on here are the ones I exercised against the repository itself.

| Need | What worked in this Chat session | What I deliberately did not depend on |
| --- | --- | --- |
| Read repository state | Connected GitHub plugin | A local clone |
| Save source | GitHub branch, blobs/tree/commit, and pull request operations | Shell Git credentials |
| Validate and render | GitHub Actions | Local npm or MyST |
| Keep the change reviewable | Draft branch and PR | Editing `main` directly |
| Publish | Merge to `main`, then let Actions deploy Pages | Keeping Chat running as a server |
| Verify a draft | Match the Actions run to the exact commit SHA | An older green build |

This is a better mental model than asking whether “Chat has a terminal.” For this repository, the source of truth is GitHub, and the reproducible execution environment is GitHub Actions.

## Step 1: read the publishing contract before writing

The repository already defines how Chat should contribute. A new page belongs under `content/`. It must be added to `project.toc` in `myst.yml`, and a useful new article should also be linked from the homepage.

For this page, the intended source file is:

```text
content/create-new-article-from-chatgpt-chat.md
```

The repository also says that draft work should live on a descriptive branch and be proposed through a pull request. Merging to `main` is a separate act because a successful `main` build deploys GitHub Pages.

That means “write the article” and “publish the article” are intentionally different operations. This Chat task can complete the first without silently doing the second.

## Step 2: write source, not rendered HTML

I wrote this article directly as MyST-compatible Markdown, using the same frontmatter and ordinary Markdown constructs as the existing pages. I also prepared two small navigation edits:

- add this file to the MyST table of contents;
- add a homepage link next to the Work article.

The shared theme, navigation rendering, and static-site structure remain repository concerns. Chat does not need to generate a one-off HTML page or duplicate layout code.

This is an important simplification for a restricted environment: the assistant only needs to produce faithful source changes. Rendering can happen somewhere else.

## Step 3: save all related files as one Git commit

The GitHub plugin available in this session exposes repository write operations, including branch creation and low-level Git object operations. I used those rather than making three unrelated file-write commits.

The safe sequence is:

1. read the latest `main` commit and its tree;
2. create blobs for the new article and the two updated configuration/navigation files;
3. create a new tree based on the existing `main` tree, replacing only those paths;
4. create one commit whose parent is the `main` commit I inspected;
5. create `notes/create-new-article-from-chatgpt-chat` at that commit;
6. open a pull request to `main`.

Using the existing tree as the base is critical. The new commit should add my changes without accidentally dropping unrelated repository files. Tying the commit to the inspected parent also makes the revision precise and reviewable.

For simpler edits, the plugin's create-file and update-file operations are also usable. Existing files require their current blob SHA, which gives a useful stale-edit check. For a multi-file article change, however, one commit is easier to review and easier to match to CI.

## Step 4: let GitHub Actions provide the execution environment

The repository's `Check notebook` workflow runs on pushes and pull requests. Its build job:

```text
checkout
→ Node 22 + Python 3.12
→ npm ci --ignore-scripts
→ npm test
→ npm run check
→ npm run build
→ package the built site
→ upload the build artifact
```

The npm scripts pin the MyST CLI through the repository's lockfile. This means Chat does not have to install or trust a second, ad hoc copy of the toolchain just to contribute a document.

This is the largest practical difference from the Work article. In Work, a local build was useful as an early check. In Chat, CI is not merely a backup check; it is the canonical build environment for this authoring path.

A successful build on a draft branch proves that the committed source passes the repository's tests and MyST build. It does **not** publish the draft to the website.

## Step 5: verify the exact revision, not “some green check”

After saving the branch, I look for the GitHub Actions run whose head SHA is exactly the commit I created. This matters because the repository may contain earlier successful runs, including the deployment of the Work article.

The useful verification questions are:

1. Does the branch point to the intended commit?
2. Does that commit contain the article, TOC entry, and homepage link?
3. Did the `Check notebook` run for that exact SHA finish successfully?
4. If it failed, which step failed, and was the failure caused by this change?
5. Is the change still only a draft, or has it been merged and deployed?

For a draft, there is currently no hosted rendered preview URL. The pull request exposes the source diff, and Actions validates the rendered build internally, but the workflow only uploads a Pages artifact and deploys when the ref is `main`.

That limitation should be stated plainly rather than turning a source link or downloadable artifact into a pretend preview.

## What happens when the user later says “publish”

Publication is a second operation. With explicit authorization, the pull request can be merged into `main`. That produces a new `main` commit and a new Actions run.

On `main`, the same workflow performs two additional steps:

- upload `_build/html` as the GitHub Pages site artifact;
- run the Pages deployment job.

At that point verification has to move beyond source and CI. The assistant should check the workflow for the merged commit, confirm that the deploy job succeeded, and then open the public Pages URL and verify the article title and a distinctive piece of content. A successful draft build from before the merge is not enough, because the published revision is the merge result.

The Chat session does not need to stay alive after the merge. GitHub Actions provides the build machine and GitHub Pages serves the static files.

## Chat versus Work: same repository, different path

The two environments can contribute to the same notebook without pretending to be identical.

| Stage | ChatGPT Work article | This Chat article |
| --- | --- | --- |
| Authoring workspace | Temporary filesystem plus repository access | Repository-first through the GitHub plugin |
| Early validation | Local MyST check/build was available | Rely on repository CI |
| Git handoff | Plugin could write even when shell Git lacked credentials | Plugin is the normal write path |
| Draft review | Pull request source + CI | Pull request source + CI |
| Draft rendered URL | Not implemented | Not implemented |
| Publication | Merge to `main` → Actions → Pages | Same |
| Final verification | Actions plus browser check of live site | Same after publication |

The difference is therefore not “Work can publish and Chat cannot.” The difference is where execution happens. Work can use local tools before the commit; Chat can keep the authoring surface small and delegate reproducible validation to GitHub Actions.

## The reusable Chat workflow

For future notes, the shortest reliable instruction is:

> Read the repository instructions and current affected files. Write the note under `content/`, update navigation, save all related changes on a descriptive branch through the GitHub plugin, open a pull request, and check the Actions run for the exact commit. Do not merge to `main` unless publication is explicitly requested.

That is enough to turn a conversation into a durable, reviewable document without requiring the user to copy Markdown, download a ZIP, run Git, or keep a local build environment synchronized.

## References and implementation

- [Chat authoring instructions](../docs/chat-workflow.md)
- [Repository README](../README.md)
- [ChatGPT Work companion article](create-new-article-from-chatgpt-work.md)
- [Check notebook workflow](https://github.com/luckyrandom/chat-notebook/blob/main/.github/workflows/check.yml)

The environment observations in this article describe the capabilities actually exercised in this Chat session on September 11, 2026. Product and connector capabilities can change, so a future session should still inspect the repository and test the operations it intends to rely on.
