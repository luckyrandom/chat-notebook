---
name: technical-writing
description: Write focused technical notes and technique documents that foreground the distinctive idea or core snippet, minimize routine glue, and preserve detailed evidence without burdening the main explanation. Use for coding guidance, implementation notes, technical explanations, design notes, and step-by-step technique documents.
---

# Technical Writing

A technical note earns its value from the idea it makes clear, not from how much implementation material it contains.

## Put the core snippet at the center

Find the smallest code fragment, pseudocode, command sequence, configuration, equation, or ordered set of steps that captures what is distinctive about the technique. Show it early.

Explain:

- what the snippet does;
- why it works;
- which details are essential to correctness;
- what assumptions or limitations change how it should be used.

The core snippet is usually what differentiates this note from another note about a similar project.

## Separate the technique from glue

A complete project often needs setup, wrappers, adapters, boilerplate, error plumbing, deployment configuration, and other glue. That work can be necessary without being the thing the note needs to teach.

Keep routine glue out of the main path when a reasonable engineer or agent could reconstruct it. Bring apparently routine code back into the main explanation when it contains a non-obvious constraint, changes correctness, or is itself part of the technique.

The test is not whether code is important to the project. The test is whether it is important to understanding the distinctive technique.

## Keep the main path minimal

Prefer a direct structure:

**Problem and key idea → core snippet → explanation and essential caveats → supporting detail.**

Do not write a chronological diary of everything tried. Avoid repeated summaries and unnecessary section scaffolding. Keep enough visible context that the reader can apply the technique without guessing.

## Preserve depth without forcing everyone to read it

Detailed derivations, complete implementations, experiment setup, alternative designs, failure analysis, references, and review evidence can live in appendices, collapsed sections, or linked supporting documents.

The main note should be quick to understand; the supporting layer should make the conclusion auditable and maintainable.

## Review before finishing

Check that the note answers these questions quickly:

1. What is the distinctive idea?
2. Where is the smallest useful example of it?
3. Why does it work?
4. What could make it incorrect or inapplicable?
5. Which details can be moved out of the reader's main path without losing correctness?

When working in `luckyrandom/chat-notebook`, `content/writing-a-good-technical-note.md` is the human-readable companion to these rules. When the user asks to save or publish the result there, apply the `chat-notebook-publisher` skill.
