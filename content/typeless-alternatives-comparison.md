---
date: 2026-09-13
title: "Typeless Alternatives: What to Choose and Why"
description: "Compare AI dictation tools by workflow, desktop and mobile support, open-source licensing, offline processing, maturity, and real cost."
---

**Research snapshot: September 13, 2026.** This is a comparison of official product documentation, pricing, source repositories, and release notes—not a hands-on accuracy benchmark. Features can differ by operating system, model, and purchase channel. The [evidence and testing sections](#typeless-reference) record the important uncertainties and a repeatable evaluation procedure.

## The important choice is the workflow, not the speech model

A useful Typeless replacement must do more than transcribe a recording. It must put the **right text into the right application, with the amount of rewriting you actually want**.

My shortlist is therefore conditional: **Wispr Flow** for a closely comparable managed experience across desktop and phone; **Aqua Voice** for technical vocabulary and voice editing; **Superwhisper** for configurable local/cloud workflows; **Handy** for a free, open-source local starting point; **OpenWhispr** for a broader open-source desktop workspace; and **VoiceInk** for a paid, source-available-to-modify Mac application without a subscription. These are recommendations about fit, not measured rankings of recognition accuracy. The comparison below supplies their supporting facts.

It helps to separate four stages:

```text
Microphone → speech recognition → optional rewriting → insertion into the target app
```

An application can run speech recognition locally but send the resulting text to a cloud rewriting model. It can also save history locally while performing all recognition in the cloud. Calling both arrangements “private” hides a decision that matters.

## Platforms, source access, and offline operation

“Local available” means a supported local transcription path exists; it does **not** mean every model, cleanup feature, or mobile build runs offline. “Commercial” below means no open-source application license was established in the sources reviewed; using an open speech model does not make the surrounding app open source.

| Product | Desktop support | Mobile support | Application source | Offline position |
| --- | --- | --- | --- | --- |
| **Typeless** | macOS, Windows | iOS, Android | Commercial | Cloud transcription; local history is not local inference.[^typeless][^typeless-data] |
| **Wispr Flow** | macOS, Windows | iOS, Android | Commercial | Transcription always uses the cloud.[^flow][^flow-data] |
| **Aqua Voice** | macOS, Windows | iOS | Commercial | Requires internet; Avalon runs in the cloud.[^aqua-faq] |
| **Superwhisper** | macOS, Windows | iOS/iPadOS | Commercial | Local and cloud models; hardware and feature differences matter.[^super][^super-windows] |
| **VoiceInk** | macOS; current packaged app requires Apple silicon | Separate iOS/iPadOS companion, advertised as beta | **GPL-3.0 Mac project**; do not assume that establishes the iOS license | Local Mac models available; select models and enhancement settings deliberately.[^voiceink][^voiceink-source][^voiceink-ios] |
| **Handy** | macOS, Windows, Linux | No mobile app verified | **MIT** | Local dictation; optional post-processing needs a separate privacy check.[^handy] |
| **OpenWhispr** | macOS, Windows, Linux | iOS/iPadOS companion listed in paid offering | **MIT desktop**; managed cloud and website are proprietary | Local desktop recognition and reasoning available; BYOK/cloud also supported.[^openwhispr][^openwhispr-terms][^openwhispr-price] |
| **Spokenly** | macOS, Windows, Linux | iOS | Commercial | Free local models; BYOK or managed cloud optional. Check the exact build.[^spokenly][^spokenly-price] |
| **MacWhisper** | macOS | Separate **Whisper Transcription** iOS app | Commercial | Local transcription; optional cloud transcription/AI. Direct Mac build provides system-wide dictation.[^macwhisper][^macwhisper-editions] |
| **Willow Voice** | macOS, Windows | iOS; Android still “coming soon” | Commercial | Offline mode advertised; platform/model parity was not established.[^willow][^willow-price] |

Two immediate filters follow. For **Linux**, start with Handy, OpenWhispr, or Spokenly rather than trying to force a Mac-only workflow onto it. For **one managed product across Mac, Windows, iPhone, and Android**, Typeless and Wispr Flow are the clearly documented candidates in this selection. Neither conclusion implies identical functionality on every supported platform.

An iPhone companion is not automatically equivalent to a desktop hotkey application. For example, Superwhisper documents a custom-keyboard workflow, device-local modes, and an iOS 26.4 app-return limitation. OpenWhispr lists its mobile companion as a paid-plan feature; VoiceInk labels its companion beta. Evaluate the phone separately.[^super-ios][^openwhispr-price][^voiceink-ios]

## Functionality: what each alternative changes

| Product | Distinctive functionality | Main tradeoff and maturity consideration |
| --- | --- | --- |
| **Typeless, the baseline** | Converts conversational speech into organized writing; handles fillers, restarts, lists, tone, vocabulary, and selected-text assistance. | A managed writing layer rather than a model-control tool. Staying is reasonable when its transformation style and free allowance already fit.[^typeless] |
| **Wispr Flow** | Context-sensitive cleanup, personalized vocabulary, snippets, and Command Mode; a closely comparable speak-into-any-app workflow. | Strong documented platform breadth, but cloud dependence and several separate data controls. The newer Notetaker feature is Mac-only at this snapshot, not universal platform parity.[^flow][^flow-price] |
| **Aqua Voice** | Context-aware technical dictation, custom instructions/dictionary, and voice editing. Max adds live text through Realtime Mode and a “Send it” command. | A good trial candidate for names and technical terminology. Do not buy Pro expecting every streaming feature shown in a Max demo.[^aqua][^aqua-price] |
| **Superwhisper** | Modes let you combine recognition models, rewriting instructions, vocabulary, and context for different jobs; also supports files and meetings. | More control means more setup. Windows documentation explicitly lists missing Mac features, including agentic coding integrations.[^super][^super-windows] |
| **VoiceInk** | Mac-native dictation with dictionary, context-specific Modes, and Assistant workflows. Recent releases add on-device Refine enhancement. | Attractive for a Mac-focused one-time purchase, but the iOS companion and Mac product have different maturity. The source project currently says it is not accepting pull requests.[^voiceink-source][^voiceink-releases] |
| **Handy** | A straightforward global-shortcut/local-model workflow, personal vocabulary, history, and optional post-processing. | Good first experiment for someone who values inspectable software over a managed ecosystem. Its README documents Linux/Wayland and hardware-specific rough edges.[^handy] |
| **OpenWhispr** | Dictation plus meeting notes, file transcription, local/cloud reasoning, editable prompts, and API/CLI/MCP-oriented workflows. | Broader than a small dictation utility. Active releases are encouraging, but greater scope creates more settings and more opportunities for routing or integration errors.[^openwhispr][^openwhispr-release] |
| **Spokenly** | Unlimited local models without an app fee; bring your own provider keys or pay for managed models and cleanup. | A useful middle ground between paid SaaS and building from source. Free local use is not the same as an open-source license.[^spokenly][^spokenly-price][^spokenly-terms] |
| **MacWhisper** | Especially useful when dictation shares a workflow with audio/video files, meeting capture, subtitle exports, and transcript processing. | More of a transcription workbench than a minimal typing replacement. Buy the correct edition: system-wide dictation is in the direct Mac download, not the App Store edition.[^macwhisper][^macwhisper-editions] |
| **Willow Voice** | Style matching, an auto-learning dictionary, shortcuts, and Scribe-assisted writing; paid Smart Memory emphasizes personalization. | Worth testing for automatic adaptation. Its free plan uses a weaker model, and its help page contains conflicting old/new plan details.[^willow][^willow-price][^willow-help] |

### What “mature” should mean here

I would not collapse maturity into a single star rating. Separate **release activity**, **reliability in the target apps**, **platform parity**, **support and governance**, and **the ability to keep working if the vendor disappears**.

The open-source projects offer unusually concrete inspection points: Handy v0.9.6 was released on August 24, VoiceInk v2.13 on August 27, and OpenWhispr v1.10.0 on September 11, 2026. Their release notes also contain real microphone, paste, model, and routing fixes. This demonstrates maintenance—not a comparative defect rate. Commercial documentation likewise reveals differences that marketing platform badges do not.[^handy-release][^voiceink-releases][^openwhispr-release][^super-windows]

The reference sections provide product-by-product maturity judgments and their evidence. Those judgments are inferences from public records, not claims of independently tested stability.

## Price comparisons that do not mix unlike plans

Prices below are vendor website list prices checked on September 13, 2026, generally before applicable taxes. All amounts are **USD except MacWhisper, quoted in EUR**. “Annual” is the amount paid for a year, not an option to cancel a yearly commitment after one month. App Store purchases can differ.

| Product | Free use | Paid reference price | Important qualification |
| --- | --- | --- | --- |
| **Typeless** | 8,000 words/week | 30/month or 144/year | Pro removes the word cap and adds higher-tier capabilities.[^typeless-price] |
| **Wispr Flow** | 2,000 words/week desktop; 1,000/week iPhone; Android currently listed as unlimited | 15/month or 144/year | The Android allowance is a current listing, not a promise of permanent pricing.[^flow-price] |
| **Aqua Voice** | 1,000 starter words | Pro: 10/month or 96/year. Max: 30/month or 288/year | Starter is not a verified recurring weekly allowance. Realtime Mode is Max.[^aqua-price][^aqua-faq] |
| **Superwhisper** | Free tier plus 3,000-word Pro trial | 8.49/month; 84.99/year; 249.99 lifetime | Official homepage and billing documentation disagree about free model/custom-mode entitlements. Verify in the app.[^super-price][^super] |
| **VoiceInk** | Self-build Mac source; packaged trial | 25 for one Mac; 39 for two; 49 for three, one-time | iOS is separately advertised as free during beta, with a later one-time purchase.[^voiceink][^voiceink-ios] |
| **Handy** | Free local application | No app subscription | Optional external processing can still incur provider fees.[^handy] |
| **OpenWhispr** | Unlimited local/BYOK desktop; managed cloud 2,000 words/week | Pro: 80/year; Business: 160/year | Paid managed plans add workflow, meeting, sync, and mobile features. BYOK usage is billed by the provider.[^openwhispr-price] |
| **Spokenly** | Unlimited local models; no app charge for BYOK | 9.99/month or 99.99/year | Pro mainly adds managed cloud services; external-key usage is additional.[^spokenly-price][^spokenly-students] |
| **MacWhisper** | Free edition | Pro: EUR 64 one-time | Direct-build license and App Store/iOS purchases are not interchangeable.[^macwhisper][^macwhisper-editions] |
| **Willow Voice** | Unlimited Frontier Mini, a weaker model | Pro: 15/month or 144/year | Compare the model tier as well as the word limit.[^willow-price] |

A useful consequence: **Typeless is much more expensive than Flow when paid monthly, but their published annual totals are equal.** Conversely, Aqua's headline annual Pro price does not buy Max's live mode. A price-only ranking can reverse when the required feature or billing cadence changes.

Treat “lifetime” as an offer with product and vendor dependencies, not a guarantee of perpetual compatibility. With BYOK, budget for both recognition and rewriting when both are remote. With local models, account for setup time, storage, memory, and battery load rather than only the absence of a subscription.

## Privacy and language quality are separate buying decisions

### Privacy: follow the data, not the label

Typeless explicitly says transcription and contextual processing happen in the cloud; history is local unless optional sync is enabled. Wispr Flow also always transcribes in the cloud, and separately controls model-improvement sharing and persistent dictation storage. Thus **no training**, **no retention**, **local history**, and **offline processing** are four different properties.[^typeless-data][^flow-data]

For confidential drafting, I would first test a deliberately local configuration in Handy, VoiceInk, OpenWhispr, Superwhisper, Spokenly, or MacWhisper. Check the **rewriting model and sync settings too**. OpenWhispr's September release explicitly fixed cases where local users were unexpectedly routed to cloud processing; that is a reason to inspect the installed version and actual behavior, not to assume the license itself enforces privacy.[^openwhispr-release]

Microphone, accessibility, window-context, clipboard, and keyboard permissions also matter. Limit them to what the workflow needs. For organizational use, ask for the actual retention controls, provider list, deployment controls, and support commitments; do not treat a compliance badge as proof that a particular configuration meets your requirements.

### Multilingual and technical writing: test your errors, not a language count

An advertised language count says little about mixed-language accuracy, accents, technical identifiers, or preservation of intent. One concrete example: NVIDIA's **Parakeet TDT 0.6B v3** supports 25 European languages, not Mandarin. That does not mean every model named Parakeet lacks Chinese; it means the exact model and version matter.[^parakeet]

For Chinese–English work, test code-switching inside a sentence, Simplified versus Traditional output, names, punctuation, and accidental translation. For technical writing, test identifiers such as `get_user_id`, `PostgreSQL`, and `OAuth`, plus numbers and negation. A fluent rewrite that drops “not” is worse than an awkward but faithful transcript.

**Dictating a prompt to a coding agent is not the same task as editing code hands-free.** The former benefits from natural language cleanup; the latter may require exact symbols, navigation commands, and explicit control over execution. Keep automatic “send” actions disabled during initial tests.

## Which tools I would actually try

For **ordinary writing across computer and phone**, start with Typeless versus **Wispr Flow**. Add **Aqua** when technical vocabulary or voice editing is the problem, and **Willow** when personalization is the main attraction. This is a test order, not a claim that one vendor always recognizes speech better.

For **local processing and control**, start with **Handy** to establish a free baseline. Then try **Superwhisper** for configurable managed workflows, **VoiceInk** for a Mac-focused one-time purchase, or **OpenWhispr** when broader notes and integration workflows are useful. **Spokenly** deserves a trial when free local processing matters more than source access.

For **files, meetings, and subtitles as well as dictation**, prioritize **MacWhisper** or **OpenWhispr**. An alternative need not replace everything: one small local dictation utility and a separate transcription workbench may be simpler than a single feature-heavy app.

There are also useful options outside the direct-comparison category. **Apple Dictation** is a built-in baseline; its settings indicate whether general text is processed on-device. **Windows voice typing** needs internet, whereas **Windows Voice Access** supports offline dictation and computer control. **Talon** is designed for hands-free control and scriptable commands across macOS, Windows, and Linux/X11, but its core is proprietary. **Buzz** is an MIT-licensed offline transcription tool for files/live microphone audio, not something to assume has Typeless-equivalent writing and insertion behavior.[^apple][^windows-typing][^windows-access][^talon][^talon-license][^buzz]

My practical rule is simple: **keep the tool that produces the most usable text with the fewest corrections in your actual applications**. Run the same short test set through two or three finalists, including a network-disconnected test where privacy matters. Do not switch merely because two products use different models or one has a more impressive demo.

## Sources

All sources were consulted on September 13, 2026. Product descriptions and prices are vendor claims; recommendation and maturity judgments are this note's synthesis.

(typeless-reference)=
## Evidence, privacy checks, and comparison tests

**Checked September 13, 2026.** These reference sections preserve the details that change how the comparison tables should be interpreted.

Open a section for the supporting detail; the main explanation above remains the reading path.

(typeless-reference-what-this-research-does-and-does-not-establish)=
````{dropdown} What this research does and does not establish

The sources establish what vendors document, what public application licenses say, what builds are offered, and what maintainers report changing. They do not establish a controlled ranking of accuracy, latency, resource use, support responsiveness, or long-term reliability. No application was installed or benchmarked for this research.

Official documentation is preferable to a competitor's comparison page, but it is not automatically consistent or complete. A dated release note can be more informative than a homepage. Conversely, a capability on a repository's development branch may not yet exist in the installed stable release. Platform-level conclusions should therefore be checked against the actual build selected for a trial.

Vendor claims such as “four times faster,” “best accuracy,” or a headline word-error rate are not used as a comparative ranking here. Different audio sets, languages, microphones, models, cleanup rules, and timing boundaries can produce numbers that cannot be compared directly.
````

(typeless-reference-maturity-evidence-and-interpretation)=
````{dropdown} Maturity: evidence and interpretation

The judgment column is deliberately qualitative. “Active” does not mean bug-free, and a long feature list does not prove reliability.

| Product | Evidence worth inspecting | Interpretation for a buyer |
| --- | --- | --- |
| **Typeless** | Current release-note, help, status, and data-control surfaces; explicit documentation of processing and optional history sync.[^detail-typeless] | An operational managed product, not merely a prototype repository. Verify recovery from failed transcription and the actual mobile experience before committing annually. |
| **Wispr Flow** | Documentation separates dictation, storage, model improvement, context awareness, and the newer Notetaker workflow.[^detail-flow] | A developed product surface with evolving features. The practical maturity question is whether new adjacent features change permissions or retention, not just whether basic dictation works. |
| **Aqua Voice** | FAQ distinguishes desktop support, its April 2026 iPhone launch, and cloud requirements; pricing distinguishes Pro from Max.[^detail-aqua] | A focused commercial option whose technical-language positioning merits a trial. A newer phone client and a premium realtime mode should be evaluated independently from ordinary desktop dictation. |
| **Superwhisper** | Dedicated Windows documentation lists both hardware requirements and missing Mac features.[^detail-super-windows] | Good transparency about cross-platform limitations. A Mac recommendation should not be copied unchanged to Windows, especially for automated input or coding-agent integrations. |
| **VoiceInk** | Mac v2.13 released August 27; v2.11 added local Refine. The separate phone app is labeled beta, and the repository currently declines new pull requests.[^detail-voiceink-release][^detail-voiceink-ios][^detail-voiceink-source] | Actively maintained but maintainer-directed. Source access provides an exit option; it does not guarantee an active community will maintain a fork or that Mac and phone features match. |
| **Handy** | v0.9.6, August 24, includes fixes for Linux paste behavior, Wayland overlays, custom words, and disconnected microphones, with multiple contributors.[^detail-handy-release] | Active community engineering around real integration problems. That is encouraging, but also explains why the exact desktop environment belongs in the test plan. |
| **OpenWhispr** | v1.10.0, September 11, adds functionality and fixes routing, lost-paste recovery, meetings, Windows, and Linux behavior.[^detail-openwhispr-release] | Fast-moving and broad in scope. Pin the version used for evaluation and retest after major updates; newly fixed issues are neither proof of universal unreliability nor evidence that all related cases are solved. |
| **Spokenly** | Current pricing and terms name four platforms and distinguish local, external-key, and managed use.[^detail-spokenly] | Commercial distribution with a generous local entry point. Do not infer open-source governance or identical feature availability from the free price. |
| **MacWhisper** | An August 2026 support article explicitly distinguishes direct Mac distribution, the Mac App Store edition, and iOS licensing/features.[^detail-macwhisper] | A comparatively developed transcription-workbench offering. Edition selection is a more actionable risk than a generic “maturity score.” |
| **Willow Voice** | Its help article contains both unlimited Frontier Mini and an older 2,000-word limit in different sections; offline mode is advertised without a complete platform/model matrix in the reviewed material.[^detail-willow-help][^detail-willow] | A documented shipping product with documentation drift. Resolve the precise tier and offline behavior during the trial rather than assuming every published claim describes the same configuration. |

Do not rank maturity by GitHub stars or release-number magnitude. A 2.x product is not inherently more dependable than a 0.x product, and an open project's visible bug list should not be compared with a closed vendor's invisible internal bug tracker as though both were equal measurements.

For a daily-use tool, the most useful maturity evidence is mundane: successful insertion into the applications you use, recoverable recordings, stable shortcuts, intelligible updates, a maintained support channel, and an export path for your dictionary and prompts.
````

(typeless-reference-documentation-traps-preserved-from-this-snapshot)=
````{dropdown} Documentation traps preserved from this snapshot

### Superwhisper's free entitlements are inconsistent

The homepage lists unlimited Whisper use and custom prompt control under Free. The billing documentation places local voice models, custom modes, vocabulary, and AI modes under Pro. Both were accessible during this research. The main article therefore gives the paid prices but does not promise a particular free offline configuration. The product's in-app entitlement screen or a written support answer should settle a purchase decision.[^detail-super-home][^detail-super-price]

Windows support is real, not merely a roadmap item. However, Windows ARM lacks some local model paths, and several input and coding integrations remain Mac-only. This is a concrete example of why “supports Windows” is a weaker claim than “all Mac features work on Windows.”[^detail-super-windows]

### VoiceInk's local option is not a claim that every model is local

The homepage emphasizes local Mac transcription. However, the current release history also lists external transcription-provider support alongside local models. The defensible statement is that VoiceInk offers a local path—not that selecting any available provider keeps audio on-device. Local Refine, remote enhancement, and a remote transcription provider have different data paths.[^detail-voiceink-home][^detail-voiceink-release]

The GPL verification applies to the inspected Mac repository. The iOS companion's existence does not, by itself, prove its source license, device requirements, or offline parity. Its public page calls it beta and describes a future one-time purchase.[^detail-voiceink-source][^detail-voiceink-ios]

### OpenWhispr is not an entirely open managed service

The terms explicitly distinguish the MIT desktop app from the proprietary cloud API and website. Local operation, bring-your-own-key traffic, managed cloud processing, account-backed synchronization, and mobile features are separate choices. The paid service's entitlements should not be projected onto what a self-built desktop app can do, or vice versa.[^detail-openwhispr-terms][^detail-openwhispr-price]

Version 1.10.0 specifically reports fixes for signing in unexpectedly rerouting local dictation to the cloud and for note recordings using cloud processing despite otherwise local settings. This is a useful, unusually concrete reason to test the complete workflow after sign-in—not just a disconnected demonstration immediately after installation.[^detail-openwhispr-release]

### Willow's free and offline claims need scope

The current primary pricing page says the free plan has unlimited Frontier Mini, while Pro uses Frontier Pro. The help article's prose matches the newer free offer, but its table still says 2,000 words per week. The main comparison uses the current pricing page and records the conflict instead of averaging the two.[^detail-willow-price][^detail-willow-help]

Willow's product page advertises on-device offline mode. Its help page lists offline dictation under Pro. The reviewed material did not establish a complete per-platform/per-model offline feature matrix. “Offline advertised; verify the desired workflow” is more accurate than either calling Willow cloud-only or asserting complete offline parity.[^detail-willow][^detail-willow-help]

### Similar names and editions are not interchangeable

MacWhisper's direct-download license does not activate the App Store edition. System-wide Mac dictation belongs to the direct version; the separately named iOS Whisper Transcription app offers local models and optional cloud/assistant features. These are meaningful product boundaries, not cosmetic naming differences.[^detail-macwhisper]

Likewise, an app advertising 100-plus languages may offer a fast default model with a narrower language set. NVIDIA's Parakeet TDT 0.6B v3 is specifically a 25-European-language model. Do not turn that fact into a claim about every newer or specialized Parakeet model; record the full model identifier used in a test.[^detail-parakeet]
````

(typeless-reference-a-privacy-checklist-for-a-chosen-configuration)=
````{dropdown} A privacy checklist for a chosen configuration

For each finalist, record answers to these questions before using sensitive material:

| Boundary | What to establish |
| --- | --- |
| Recognition | Does raw audio stay on-device, go directly to a provider, or pass through the app vendor? |
| Rewriting | Is the transcript or surrounding context sent to another model after recognition? |
| Context | Is only selected text read, the surrounding field, or a wider application window? |
| History and sync | Are audio and text retained locally, remotely, or both? Can each be disabled and deleted? |
| Training and diagnostics | Is model-improvement sharing opt-in, and what is included when feedback is submitted? |
| Recovery and updates | Can recordings survive a failed insertion? Can an update change the selected provider or routing? |

These are independent questions. Typeless's documentation says history sync is optional while recognition remains cloud-based. Flow distinguishes training permission from cloud storage and notes that meeting-related data has separate handling. Neither a local history setting nor a third-party no-training commitment answers the whole checklist.[^detail-typeless][^detail-flow]

A network-disconnected test establishes whether a workflow remains usable without a connection. It is **not** a full privacy audit: software could queue uploads, and local logs or backups may retain sensitive material. For stricter requirements, inspect network activity when connected, review retained files, and check the provider and synchronization settings after restarts and sign-in.
````

(typeless-reference-a-practical-comparison-you-can-run)=
````{dropdown} A practical comparison you can run

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
````

(typeless-reference-source-record)=
````{dropdown} Source record

These sources supplement the full linked source list in the main article. Access date: September 13, 2026.
````

[^typeless]: [Typeless product page](https://www.typeless.com/).
[^typeless-data]: [Typeless Data Controls](https://www.typeless.com/data-controls), updated August 25, 2026.
[^typeless-price]: [Typeless pricing](https://www.typeless.com/pricing).
[^flow]: [Wispr Flow product page](https://wisprflow.ai/).
[^flow-data]: [Wispr Flow Data Controls](https://wisprflow.ai/data-controls), updated August 18, 2026.
[^flow-price]: [Wispr Flow pricing and platform-specific allowances](https://wisprflow.ai/pricing).
[^aqua]: [Aqua Voice product page](https://aquavoice.com/).
[^aqua-faq]: [Aqua Voice FAQ](https://aquavoice.com/info/faq), including cloud requirement, starter allowance, languages, and iOS availability.
[^aqua-price]: [Aqua Voice pricing](https://aquavoice.com/pricing), including monthly/annual and Pro/Max distinctions.
[^super]: [Superwhisper product page](https://superwhisper.com/).
[^super-price]: [Superwhisper Plans & Pricing](https://superwhisper.com/docs/billing/plans).
[^super-windows]: [Superwhisper on Windows](https://superwhisper.com/docs/get-started/windows).
[^super-ios]: [Superwhisper on iOS](https://superwhisper.com/docs/get-started/ios).
[^voiceink]: [VoiceInk product page and Mac pricing](https://tryvoiceink.com/).
[^voiceink-source]: [VoiceInk source, requirements, license, and contribution policy](https://github.com/Beingpax/VoiceInk).
[^voiceink-ios]: [VoiceInk iOS companion](https://tryvoiceink.com/ios).
[^voiceink-releases]: [VoiceInk releases](https://github.com/Beingpax/VoiceInk/releases), including v2.13 and v2.11.
[^handy]: [Handy source, license, features, and known issues](https://github.com/cjpais/Handy).
[^handy-release]: [Handy v0.9.6 release](https://github.com/cjpais/Handy/releases/tag/v0.9.6).
[^openwhispr]: [OpenWhispr desktop source and features](https://github.com/OpenWhispr/openwhispr).
[^openwhispr-terms]: [OpenWhispr terms](https://openwhispr.com/terms), distinguishing MIT desktop from proprietary services.
[^openwhispr-price]: [OpenWhispr pricing](https://openwhispr.com/pricing).
[^openwhispr-release]: [OpenWhispr v1.10.0 release](https://github.com/OpenWhispr/openwhispr/releases/tag/v1.10.0), September 11, 2026.
[^spokenly]: [Spokenly product page](https://spokenly.app/).
[^spokenly-price]: [Spokenly pricing](https://spokenly.app/pricing).
[^spokenly-students]: [Spokenly student pricing](https://spokenly.app/students), showing regular monthly and annual prices alongside discounts.
[^spokenly-terms]: [Spokenly terms](https://spokenly.app/terms).
[^macwhisper]: [MacWhisper features and direct-build pricing](https://www.macwhisper.com/).
[^macwhisper-editions]: [MacWhisper & Whisper Transcription Difference](https://docs.macwhisper.com/article/40-macwhisper-whisper-transcription-difference), updated August 6, 2026.
[^willow]: [Willow Voice product page](https://willowvoice.com/), including advertised offline mode.
[^willow-price]: [Willow pricing](https://willowvoice.com/pricing).
[^willow-help]: [Willow Pricing Plans Overview](https://help.willowvoice.com/en/articles/12854184-willow-pricing-plans-overview), dated July 9, 2026; internally inconsistent on the free allowance.
[^parakeet]: [NVIDIA Parakeet TDT 0.6B v3 model card](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3).
[^apple]: [Apple: Dictate messages and documents on Mac](https://support.apple.com/guide/mac-help/use-dictation-mh40584/mac).
[^windows-typing]: [Microsoft: Use voice typing](https://support.microsoft.com/en-us/accessibility/windows/use-voice-typing-to-talk-instead-of-type-on-your-pc).
[^windows-access]: [Microsoft: Get started with voice access](https://support.microsoft.com/en-us/accessibility/windows/voice-access/get-started-with-voice-access).
[^talon]: [Talon features and platform downloads](https://talonvoice.com/).
[^talon-license]: [Talon EULA](https://talonvoice.com/EULA.txt).
[^buzz]: [Buzz source, license, and features](https://github.com/chidiwilliams/buzz).
[^detail-typeless]: [Typeless Data Controls](https://www.typeless.com/data-controls), updated August 25, 2026; also links its help, release, status, and trust surfaces.
[^detail-flow]: [Wispr Flow Data Controls](https://wisprflow.ai/data-controls), updated August 18, 2026.
[^detail-aqua]: [Aqua Voice FAQ](https://aquavoice.com/info/faq) and [pricing](https://aquavoice.com/pricing).
[^detail-super-home]: [Superwhisper homepage](https://superwhisper.com/), Free section.
[^detail-super-price]: [Superwhisper Plans & Pricing](https://superwhisper.com/docs/billing/plans), Free versus Pro table.
[^detail-super-windows]: [Superwhisper on Windows](https://superwhisper.com/docs/get-started/windows), requirements and differences from macOS.
[^detail-voiceink-home]: [VoiceInk homepage](https://tryvoiceink.com/).
[^detail-voiceink-source]: [VoiceInk repository](https://github.com/Beingpax/VoiceInk), license and contribution policy.
[^detail-voiceink-release]: [VoiceInk releases](https://github.com/Beingpax/VoiceInk/releases), v2.13 and v2.11.
[^detail-voiceink-ios]: [VoiceInk iOS companion](https://tryvoiceink.com/ios).
[^detail-handy-release]: [Handy v0.9.6](https://github.com/cjpais/Handy/releases/tag/v0.9.6), August 24, 2026.
[^detail-openwhispr-release]: [OpenWhispr v1.10.0](https://github.com/OpenWhispr/openwhispr/releases/tag/v1.10.0), September 11, 2026.
[^detail-openwhispr-terms]: [OpenWhispr terms](https://openwhispr.com/terms), desktop license and proprietary-service boundaries.
[^detail-openwhispr-price]: [OpenWhispr pricing](https://openwhispr.com/pricing), local/BYOK versus managed entitlements.
[^detail-spokenly]: [Spokenly pricing](https://spokenly.app/pricing) and [terms](https://spokenly.app/terms).
[^detail-macwhisper]: [MacWhisper & Whisper Transcription Difference](https://docs.macwhisper.com/article/40-macwhisper-whisper-transcription-difference), updated August 6, 2026.
[^detail-willow]: [Willow Voice homepage](https://willowvoice.com/), offline-mode claim.
[^detail-willow-price]: [Willow pricing](https://willowvoice.com/pricing).
[^detail-willow-help]: [Willow Pricing Plans Overview](https://help.willowvoice.com/en/articles/12854184-willow-pricing-plans-overview), dated July 9, 2026.
[^detail-parakeet]: [NVIDIA Parakeet TDT 0.6B v3 model card](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3).
