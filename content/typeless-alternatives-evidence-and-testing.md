---
title: "Typeless Alternatives: Evidence, Maturity, and Testing"
description: "Supporting evidence for the dictation comparison: documentation conflicts, release signals, privacy boundaries, and a repeatable practical evaluation."
---

**Checked September 13, 2026.** Read the [main comparison](typeless-alternatives-comparison.md) for the platform and pricing tables and the recommended shortlist. This companion preserves the details that change how those tables should be interpreted.

## What this research does and does not establish

The sources establish what vendors document, what public application licenses say, what builds are offered, and what maintainers report changing. They do not establish a controlled ranking of accuracy, latency, resource use, support responsiveness, or long-term reliability. No application was installed or benchmarked for this research.

Official documentation is preferable to a competitor's comparison page, but it is not automatically consistent or complete. A dated release note can be more informative than a homepage. Conversely, a capability on a repository's development branch may not yet exist in the installed stable release. Platform-level conclusions should therefore be checked against the actual build selected for a trial.

Vendor claims such as “four times faster,” “best accuracy,” or a headline word-error rate are not used as a comparative ranking here. Different audio sets, languages, microphones, models, cleanup rules, and timing boundaries can produce numbers that cannot be compared directly.

## Maturity: evidence and interpretation

The judgment column is deliberately qualitative. “Active” does not mean bug-free, and a long feature list does not prove reliability.

| Product | Evidence worth inspecting | Interpretation for a buyer |
| --- | --- | --- |
| **Typeless** | Current release-note, help, status, and data-control surfaces; explicit documentation of processing and optional history sync.[^typeless] | An operational managed product, not merely a prototype repository. Verify recovery from failed transcription and the actual mobile experience before committing annually. |
| **Wispr Flow** | Documentation separates dictation, storage, model improvement, context awareness, and the newer Notetaker workflow.[^flow] | A developed product surface with evolving features. The practical maturity question is whether new adjacent features change permissions or retention, not just whether basic dictation works. |
| **Aqua Voice** | FAQ distinguishes desktop support, its April 2026 iPhone launch, and cloud requirements; pricing distinguishes Pro from Max.[^aqua] | A focused commercial option whose technical-language positioning merits a trial. A newer phone client and a premium realtime mode should be evaluated independently from ordinary desktop dictation. |
| **Superwhisper** | Dedicated Windows documentation lists both hardware requirements and missing Mac features.[^super-windows] | Good transparency about cross-platform limitations. A Mac recommendation should not be copied unchanged to Windows, especially for automated input or coding-agent integrations. |
| **VoiceInk** | Mac v2.13 released August 27; v2.11 added local Refine. The separate phone app is labeled beta, and the repository currently declines new pull requests.[^voiceink-release][^voiceink-ios][^voiceink-source] | Actively maintained but maintainer-directed. Source access provides an exit option; it does not guarantee an active community will maintain a fork or that Mac and phone features match. |
| **Handy** | v0.9.6, August 24, includes fixes for Linux paste behavior, Wayland overlays, custom words, and disconnected microphones, with multiple contributors.[^handy-release] | Active community engineering around real integration problems. That is encouraging, but also explains why the exact desktop environment belongs in the test plan. |
| **OpenWhispr** | v1.10.0, September 11, adds functionality and fixes routing, lost-paste recovery, meetings, Windows, and Linux behavior.[^openwhispr-release] | Fast-moving and broad in scope. Pin the version used for evaluation and retest after major updates; newly fixed issues are neither proof of universal unreliability nor evidence that all related cases are solved. |
| **Spokenly** | Current pricing and terms name four platforms and distinguish local, external-key, and managed use.[^spokenly] | Commercial distribution with a generous local entry point. Do not infer open-source governance or identical feature availability from the free price. |
| **MacWhisper** | An August 2026 support article explicitly distinguishes direct Mac distribution, the Mac App Store edition, and iOS licensing/features.[^macwhisper] | A comparatively developed transcription-workbench offering. Edition selection is a more actionable risk than a generic “maturity score.” |
| **Willow Voice** | Its help article contains both unlimited Frontier Mini and an older 2,000-word limit in different sections; offline mode is advertised without a complete platform/model matrix in the reviewed material.[^willow-help][^willow] | A documented shipping product with documentation drift. Resolve the precise tier and offline behavior during the trial rather than assuming every published claim describes the same configuration. |

Do not rank maturity by GitHub stars or release-number magnitude. A 2.x product is not inherently more dependable than a 0.x product, and an open project's visible bug list should not be compared with a closed vendor's invisible internal bug tracker as though both were equal measurements.

For a daily-use tool, the most useful maturity evidence is mundane: successful insertion into the applications you use, recoverable recordings, stable shortcuts, intelligible updates, a maintained support channel, and an export path for your dictionary and prompts.

## Documentation traps preserved from this snapshot

### Superwhisper's free entitlements are inconsistent

The homepage lists unlimited Whisper use and custom prompt control under Free. The billing documentation places local voice models, custom modes, vocabulary, and AI modes under Pro. Both were accessible during this research. The main article therefore gives the paid prices but does not promise a particular free offline configuration. The product's in-app entitlement screen or a written support answer should settle a purchase decision.[^super-home][^super-price]

Windows support is real, not merely a roadmap item. However, Windows ARM lacks some local model paths, and several input and coding integrations remain Mac-only. This is a concrete example of why “supports Windows” is a weaker claim than “all Mac features work on Windows.”[^super-windows]

### VoiceInk's local option is not a claim that every model is local

The homepage emphasizes local Mac transcription. However, the current release history also lists external transcription-provider support alongside local models. The defensible statement is that VoiceInk offers a local path—not that selecting any available provider keeps audio on-device. Local Refine, remote enhancement, and a remote transcription provider have different data paths.[^voiceink-home][^voiceink-release]

The GPL verification applies to the inspected Mac repository. The iOS companion's existence does not, by itself, prove its source license, device requirements, or offline parity. Its public page calls it beta and describes a future one-time purchase.[^voiceink-source][^voiceink-ios]

### OpenWhispr is not an entirely open managed service

The terms explicitly distinguish the MIT desktop app from the proprietary cloud API and website. Local operation, bring-your-own-key traffic, managed cloud processing, account-backed synchronization, and mobile features are separate choices. The paid service's entitlements should not be projected onto what a self-built desktop app can do, or vice versa.[^openwhispr-terms][^openwhispr-price]

Version 1.10.0 specifically reports fixes for signing in unexpectedly rerouting local dictation to the cloud and for note recordings using cloud processing despite otherwise local settings. This is a useful, unusually concrete reason to test the complete workflow after sign-in—not just a disconnected demonstration immediately after installation.[^openwhispr-release]

### Willow's free and offline claims need scope

The current primary pricing page says the free plan has unlimited Frontier Mini, while Pro uses Frontier Pro. The help article's prose matches the newer free offer, but its table still says 2,000 words per week. The main comparison uses the current pricing page and records the conflict instead of averaging the two.[^willow-price][^willow-help]

Willow's product page advertises on-device offline mode. Its help page lists offline dictation under Pro. The reviewed material did not establish a complete per-platform/per-model offline feature matrix. “Offline advertised; verify the desired workflow” is more accurate than either calling Willow cloud-only or asserting complete offline parity.[^willow][^willow-help]

### Similar names and editions are not interchangeable

MacWhisper's direct-download license does not activate the App Store edition. System-wide Mac dictation belongs to the direct version; the separately named iOS Whisper Transcription app offers local models and optional cloud/assistant features. These are meaningful product boundaries, not cosmetic naming differences.[^macwhisper]

Likewise, an app advertising 100-plus languages may offer a fast default model with a narrower language set. NVIDIA's Parakeet TDT 0.6B v3 is specifically a 25-European-language model. Do not turn that fact into a claim about every newer or specialized Parakeet model; record the full model identifier used in a test.[^parakeet]

## A privacy checklist for a chosen configuration

For each finalist, record answers to these questions before using sensitive material:

| Boundary | What to establish |
| --- | --- |
| Recognition | Does raw audio stay on-device, go directly to a provider, or pass through the app vendor? |
| Rewriting | Is the transcript or surrounding context sent to another model after recognition? |
| Context | Is only selected text read, the surrounding field, or a wider application window? |
| History and sync | Are audio and text retained locally, remotely, or both? Can each be disabled and deleted? |
| Training and diagnostics | Is model-improvement sharing opt-in, and what is included when feedback is submitted? |
| Recovery and updates | Can recordings survive a failed insertion? Can an update change the selected provider or routing? |

These are independent questions. Typeless's documentation says history sync is optional while recognition remains cloud-based. Flow distinguishes training permission from cloud storage and notes that meeting-related data has separate handling. Neither a local history setting nor a third-party no-training commitment answers the whole checklist.[^typeless][^flow]

A network-disconnected test establishes whether a workflow remains usable without a connection. It is **not** a full privacy audit: software could queue uploads, and local logs or backups may retain sensitive material. For stricter requirements, inspect network activity when connected, review retained files, and check the provider and synchronization settings after restarts and sign-in.

## A practical comparison you can run

This is a proposed protocol, not a report of tests already performed.

### Use a small, representative test set

Prepare twelve clips or short passages: three everyday messages, three technical prompts, three bilingual passages, and three difficult cases such as background noise, hesitations, or a long pause. Keep the microphone and room constant, and repeat important examples in the real target applications. File-import results alone do not test a global hotkey or keyboard insertion path.

Use both a literal reference transcript and a desired final message. For example:

```text
Spoken:
Please do not merge pull request forty-two yet—actually, forty-three.
Keep get_user_id unchanged. The retry limit is fifteen, not fifty.

Required meaning:
Do not merge PR 43 yet.
Keep get_user_id unchanged.
The retry limit is 15, not 50.
```

For bilingual evaluation, combine Chinese speech with English product names and code identifiers. Check whether the app preserves the requested script and languages rather than translating or normalizing them without permission. Do not use a single English benchmark to infer bilingual quality.

### Measure the complete interaction

| Measure | Why it matters |
| --- | --- |
| Meaning-changing mistakes | Count wrong negations, names, numbers, omitted constraints, and unintended actions separately. |
| Correction effort | Record editing time and substantive corrections per 100 intended words. |
| Stop-to-final-insertion time | Measure from releasing the recording key to stable, usable text in the actual target field. Record median and slow cases. |
| Insertion failures | Count wrong-field pastes, lost focus, missing text, duplicated text, and clipboard damage. |
| Cold versus warm behavior | Compare the first use after launch with repeated use after models are loaded. |
| Resource and offline behavior | Observe memory, CPU/GPU activity, battery impact, and disconnected operation with the same configuration. |

A fast provisional transcript is not the same as fast final text. Streaming tools may display words early and revise them later. Conversely, a local model may take longer to load initially but avoid network delays afterward. Keep those timing boundaries explicit.

For literal transcription, word error rate counts substitutions, deletions, and insertions divided by the number of reference words. But intentional filler removal can worsen that metric while improving a message. For polished dictation, prioritize **semantic correctness and editing effort**, and still retain the raw-recognition result where available to locate the source of errors.

### Test settings and failure recovery, not just the happy path

Run one pass with cleanup disabled or minimized, then another with the preferred writing mode. Test an unfamiliar name before and after adding it to the dictionary. Disconnect the microphone mid-session, switch applications, try a long pause, and deliberately break the network. Confirm that a failed paste leaves a recoverable transcript rather than losing the recording.

On Linux, record the distribution, desktop environment, and whether the session uses X11 or Wayland. On Windows, record processor architecture and graphics support. On a phone, test switching keyboards and returning from the recording app. These details make a result reusable instead of merely anecdotal.

Finally, leave automatic message sending and command execution disabled during evaluation. Review identifiers and destructive instructions before passing dictation into a terminal or an agent. A useful dictation tool should reduce editing work without silently acquiring permission to act.

## Source record

These sources supplement the full linked source list in the main article. Access date: September 13, 2026.

[^typeless]: [Typeless Data Controls](https://www.typeless.com/data-controls), updated August 25, 2026; also links its help, release, status, and trust surfaces.
[^flow]: [Wispr Flow Data Controls](https://wisprflow.ai/data-controls), updated August 18, 2026.
[^aqua]: [Aqua Voice FAQ](https://aquavoice.com/info/faq) and [pricing](https://aquavoice.com/pricing).
[^super-home]: [Superwhisper homepage](https://superwhisper.com/), Free section.
[^super-price]: [Superwhisper Plans & Pricing](https://superwhisper.com/docs/billing/plans), Free versus Pro table.
[^super-windows]: [Superwhisper on Windows](https://superwhisper.com/docs/get-started/windows), requirements and differences from macOS.
[^voiceink-home]: [VoiceInk homepage](https://tryvoiceink.com/).
[^voiceink-source]: [VoiceInk repository](https://github.com/Beingpax/VoiceInk), license and contribution policy.
[^voiceink-release]: [VoiceInk releases](https://github.com/Beingpax/VoiceInk/releases), v2.13 and v2.11.
[^voiceink-ios]: [VoiceInk iOS companion](https://tryvoiceink.com/ios).
[^handy-release]: [Handy v0.9.6](https://github.com/cjpais/Handy/releases/tag/v0.9.6), August 24, 2026.
[^openwhispr-release]: [OpenWhispr v1.10.0](https://github.com/OpenWhispr/openwhispr/releases/tag/v1.10.0), September 11, 2026.
[^openwhispr-terms]: [OpenWhispr terms](https://openwhispr.com/terms), desktop license and proprietary-service boundaries.
[^openwhispr-price]: [OpenWhispr pricing](https://openwhispr.com/pricing), local/BYOK versus managed entitlements.
[^spokenly]: [Spokenly pricing](https://spokenly.app/pricing) and [terms](https://spokenly.app/terms).
[^macwhisper]: [MacWhisper & Whisper Transcription Difference](https://docs.macwhisper.com/article/40-macwhisper-whisper-transcription-difference), updated August 6, 2026.
[^willow]: [Willow Voice homepage](https://willowvoice.com/), offline-mode claim.
[^willow-price]: [Willow pricing](https://willowvoice.com/pricing).
[^willow-help]: [Willow Pricing Plans Overview](https://help.willowvoice.com/en/articles/12854184-willow-pricing-plans-overview), dated July 9, 2026.
[^parakeet]: [NVIDIA Parakeet TDT 0.6B v3 model card](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3).
