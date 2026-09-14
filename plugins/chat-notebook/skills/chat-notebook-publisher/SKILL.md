---
name: chat-notebook-publisher
description: Create, edit, save, validate, publish, or verify notes in the luckyrandom/chat-notebook repository. Use when the user wants a note turned into a Chat Notebook article, saved to the repository, opened as a pull request, merged, deployed, or checked on the live site.
---

# Chat Notebook Publisher

Use the connected GitHub capability for repository work in `luckyrandom/chat-notebook`.

## Always load the canonical workflow

Before creating, editing, saving, publishing, or verifying a Chat Notebook article, read this file from the current `main` branch:

```text
.chatgpt/skills/chat-notebook-publisher/SKILL.md
```

Treat that repository file as the canonical workflow. It may evolve independently of this bundled routing skill. Inspect the current repository state as that workflow requires rather than relying on remembered structure or commands.

## Preserve publication boundaries

Keep these states distinct:

- **Drafted**: content has been prepared but may not be saved remotely.
- **Saved**: repository source exists on a non-`main` branch.
- **Validated**: the exact final branch commit has passed the repository's canonical checks.
- **Merged**: the intended change has been merged to `main` after explicit authorization.
- **Deployed**: the resulting `main` revision has completed the deployment workflow.
- **Live verified**: the public site itself has been checked for the intended content.

A request to write, create, save, update, or draft authorizes a draft branch and pull request, not a merge. Merge to `main` only when the user explicitly asks to publish or merge.

## Deliverables

Return links and status, not ZIPs or attachments. Follow the canonical workflow's deliverable boundary before using download or export tools, including for internal verification. Archive downloads require an explicit request for an archive, offline bundle, or artifact-level inspection. If live access is blocked, report the limitation rather than substituting an archive.

## Capability boundary

This plugin does not bundle or authorize a GitHub app. Repository actions require a GitHub capability that already has the needed access. If that capability is unavailable or lacks write access, state the missing capability clearly. Do not silently replace the repository workflow with a ZIP, pasted diff, or claim of publication.
