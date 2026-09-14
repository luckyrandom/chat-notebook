---
date: 2026-09-11
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

## Keep the reference layer in the same article

Default to **one self-contained article per request**, with long supporting material folded into named sections beside the explanation it supports. Length alone is not a reason to create an evidence companion. Separate articles are appropriate when explicitly requested or when each topic answers an independently useful question.

Use a descriptive dropdown label, such as “Full derivation and worked examples” or “Implementation and test results.” A reader should know what opening it will reveal. Keep conclusions, important assumptions, and caveats visible; the reader should be able to apply the technique without opening every section.

``````{dropdown} MyST syntax for the reference layer
Use the native dropdown directive, with an outer fence longer than any code fences inside it:

`````markdown
````{dropdown} Implementation and test results
Preserve the complete example, supporting evidence, and sources here.

```python
result = distinctive_technique(input_data)
```
````
`````

The dropdown is closed by default. Native MyST content supports equations, code, tables, and references without a separate document or handwritten HTML widget. Keep nesting shallow. Tabs work for alternatives such as Python versus JavaScript; they should not divide an explanation from its reference material.
``````

````{dropdown} What belongs in the supporting layer
Preserve derivations, full implementations, architectural details, experiment setups and results, failed attempts that explain a decision, alternatives considered, references, and the reasoning behind decisions. Organize them so a reviewer or future maintainer can reconstruct how the conclusion was reached.

Routine setup, wrappers, and other reconstructible glue can stay out of the visible explanation. Bring any part back into view when it contains a non-obvious constraint or changes correctness.

The supporting layer makes a concise note auditable and maintainable. Folding content changes its presentation, not the amount of evidence worth keeping.
````

## Make the note easy to find again

For a new article, use `YYYY-MM-DD-slug.md` and matching `date: YYYY-MM-DD` frontmatter alongside the title and description. Keep the original creation date stable when editing. Existing filenames stay unchanged to preserve links.

Keep the title human-readable. The notebook navigation displays dates separately and groups articles by month, newest first.
