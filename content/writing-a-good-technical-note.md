---
title: Writing a Good Technical Note
description: Put the core snippet at the center, keep the main explanation minimal, and preserve detailed evidence in a folded supporting layer.
---

A good technical note should make its core idea easy to find, understand, and apply. Its value comes from the insight it communicates—not its length or the amount of implementation detail it contains.

## Put the core snippet at the center

Especially when a note is intended to guide coding or provide step-by-step instructions, it should emphasize the **core snippet**: the smallest piece of code, pseudocode, or sequence of steps that captures the distinctive technique. This is what separates the note from another note about a similar problem.

Show that snippet early. Explain what it does, why it works, and which details matter. Include enough context to apply it correctly, but do not bury it inside a complete project.

A working project also requires glue code: setup, routine plumbing, wrappers, and other supporting implementation. That code can be essential to the project without being central to the note. If a reasonable engineer or agent could independently reconstruct it, it usually belongs outside the main explanation.

The distinction is not between important and unimportant code. It is between **what makes the project work** and **what the note needs to teach**. When seemingly routine code contains a non-obvious constraint or affects the technique’s correctness, bring that part into the main explanation.

## Keep the main document minimal and straightforward

The main document should provide a direct path from the problem to the technique and its use. Avoid unnecessary sections, repeated explanations, and a chronological account of everything tried along the way.

A useful default structure is:

**Problem and key idea → core snippet → explanation and essential caveats → supporting details.**

Keep enough information visible for the reader to understand and use the technique without guessing. Assumptions, limitations, and warnings that materially affect its use should not be hidden merely to make the document shorter.

The goal is not the fewest possible words. It is the least unnecessary work for the reader.

## Preserve the depth in a folded supporting layer

A concise note can—and often should—have extensive supporting documentation. Put that material in collapsed sections, appendices, or clearly linked references so it is available without interrupting the main explanation.

This layer can contain derivations, full implementations, architectural details, experiment setups and results, failed attempts, alternatives considered, references, and the reasoning behind decisions. Organize it so a reviewer or future maintainer can reconstruct how the conclusion was reached.

It is not required reading for everyone. It is the record that lets a reviewer check the evidence and lets future you or future me understand what happened behind the note.

**Keep the explanation small, but keep the evidence accessible.** Readers should be able to grasp the technique without opening the supporting material—and investigate it thoroughly when they do.
