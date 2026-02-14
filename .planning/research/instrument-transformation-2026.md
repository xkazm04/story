# Research: Audio Instrument Transformation & Timbre Transfer (2025-2026)

**Domain:** Audio AI / Sound Design / Instrument Transformation for Web-Based Production
**Researched:** 2026-02-14
**Overall Confidence:** MEDIUM (rapidly evolving field, verified with official docs where possible)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Timbre Transfer Models](#1-timbre-transfer-models)
3. [MIDI-to-Audio Synthesis](#2-midi-to-audio-synthesis)
4. [Cloud APIs & Services](#3-cloud-apis--services)
5. [Neural Audio Effects](#4-neural-audio-effects)
6. [Text-to-Sound with Instrument Control](#5-text-to-sound-with-instrument-control)
7. [LLM-Guided Audio](#6-llm-guided-audio)
8. [Quality Assessment](#7-quality-assessment)
9. [Recommended Architecture for Story App](#8-recommended-architecture-for-story-app)
10. [Sources & Confidence Levels](#9-sources--confidence-levels)

---

## Executive Summary

The audio AI landscape in early 2026 has matured significantly but remains fragmented. There is **no single API** that does everything -- no "one call to transform a guitar into a cello while preserving melody." Instead, the practical approach requires composing multiple services and techniques.

**The three most viable paths for instrument transformation in a web app are:**

1. **Stable Audio 2.5 Audio-to-Audio** -- The closest thing to "change this instrument to that one" via a cloud API. You upload audio + text prompt ("replace guitar with synth") and get transformed audio back. Quality is good but not perfect for surgical instrument swaps. Available on Replicate (~$0.20/run) and Stability AI's own platform.

2. **MusicGen Melody on Replicate** -- Upload a melody reference audio + text prompt specifying target instrumentation. It generates new audio that follows the input melody but rendered in the requested style/instrument. Not a "transform" per se but a "re-render." ~$0.07/run on Replicate.

3. **Decompose-then-Resynthesize Pipeline** -- Use stem separation (Demucs on Replicate, ~$0.016/run) to isolate the instrument, then use Stable Audio or MusicGen to re-render it, then remix. Most control but most complexity.

For MIDI-to-audio, the practical web option is **SoundFont-based synthesis** (js-synthesizer, SpessaSynth, WebAudioFont) for immediate playback, with the option to render through neural synthesis (MIDI-DDSP) server-side for production quality on specific instruments.

**Key finding:** True timbre transfer (DDSP, RAVE) remains primarily a research/desktop tool with no production-ready cloud API. The practical web approach uses text-conditioned audio generation/transformation APIs rather than pure timbre transfer models.

---

## 1. Timbre Transfer Models

### DDSP (Differentiable Digital Signal Processing) -- Google Magenta

**What it does:** Combines neural networks with classical DSP (oscillators, filters, reverb). Conditions synthesis on fundamental frequency and loudness, producing high-quality timbre transfer for monophonic harmonic instruments.

**Strengths:**
- Excellent pitch following -- strict conditioning on F0 means the melody is preserved faithfully
- Trains on minimal data (~13 minutes of audio per instrument)
- Real-time capable (DDSP-VST plugin exists for desktop DAWs)
- Well-understood, published research (Google Magenta)

**Limitations:**
- **Monophonic only** -- cannot handle chords, polyphonic instruments (piano, guitar strumming)
- **Harmonic sounds only** -- cannot model percussion, noise-based sounds
- **No production cloud API** -- available as Python library, Colab notebooks, and VST plugin but NOT as a hosted API you can call from a web app
- Desktop-focused: DDSP-VST runs in DAWs, not in browsers

**MIDI-DDSP Extension:**
- Converts MIDI directly to audio through a 3-level hierarchy (Notes -> Performance -> Synthesis)
- Supports 13 orchestral instruments (violin, viola, cello, double bass, flute, oboe, clarinet, saxophone, bassoon, trumpet, horn, trombone, tuba)
- Also no cloud API -- Python/Colab only

**Confidence:** HIGH (verified via official Magenta documentation)
**Verdict for Story app:** Not directly usable as a cloud API. Could be self-hosted on a GPU server but requires significant infrastructure work. The 13-instrument MIDI-DDSP library is compelling for orchestral sounds but impractical without self-hosting.

### RAVE (Realtime Audio Variational autoEncoder)

**What it does:** A VAE that encodes/decodes raw audio using convolutional neural networks. Uses PQMF sub-band coding for real-time CPU performance.

**Strengths:**
- **No harmonic assumptions** -- can model ANY sound (percussion, noise, polyphonic)
- Real-time on CPU (unlike most neural audio models)
- Unique sonic character -- produces creative, sometimes unpredictable transformations
- Available models via Neutone plugin: violin, kora, drum kit, voice, NASA telecom sounds, Amen break

**Limitations:**
- Less pitch-accurate than DDSP (no explicit pitch conditioning)
- Models are instrument-specific -- you need a separate trained model per target timbre
- **No cloud API** -- runs as a Neutone VST/AU plugin in desktop DAWs
- Quality varies significantly per model

**BRAVE (2025 update):**
- Improved version with better pitch and loudness replication
- Similar timbre modification capabilities to RAVE
- Optimized for lower latency
- Still desktop/research focused

**Confidence:** HIGH (verified via Neutone official blog and APSIPA 2025 paper)
**Verdict for Story app:** Not directly usable as a web API. The Neutone plugin ecosystem is desktop-only. Interesting for creative sound design but requires self-hosting for web integration.

### Key Insight: The Desktop-Web Gap

The timbre transfer research world (DDSP, RAVE, BRAVE, Neutone) operates almost entirely in the desktop DAW plugin ecosystem. There is a significant gap between what these models can do and what's accessible via a cloud API call from a web application. **This is the fundamental challenge for your use case.**

---

## 2. MIDI-to-Audio Synthesis

### Tier 1: Browser-Native (SoundFont-Based)

These run entirely in the browser using Web Audio API + WebAssembly. Instant playback, no server round-trip.

| Library | Tech | Quality | Notes |
|---------|------|---------|-------|
| **js-synthesizer** | FluidSynth compiled to WASM | Good (SoundFont dependent) | Most mature, full FluidSynth feature set |
| **SpessaSynth** | Custom WASM SoundFont engine | Good | Supports SF2/SF3/DLS, pure TypeScript, actively maintained |
| **WebAudioFont** | Pre-rendered Web Audio | Medium | Full GM instrument set, simple API, no WASM needed |
| **soundfont-player** | Pre-rendered samples | Medium | Lightweight, loads pre-rendered sounds, no SoundFont files needed |
| **Tone.js** | Web Audio synthesis | Variable | Framework for synthesis, not sample playback. Great for synth sounds, poor for realistic instruments |

**Recommendation:** Use **SpessaSynth** or **js-synthesizer** for realistic SoundFont-based MIDI playback in the browser. Pair with a high-quality GM SoundFont (FluidR3, SGM, Timbres of Heaven) for decent realism. This gives you immediate, zero-latency playback.

**Quality ceiling:** SoundFont quality is "good enough for previewing" but distinctly synthetic compared to real instruments. Think MIDI karaoke quality, not film score quality.

**Confidence:** HIGH (verified via GitHub repos and documentation)

### Tier 2: Server-Side Neural Synthesis

For production-quality rendering, process MIDI on the server:

| Approach | Quality | Instruments | Latency | Cost |
|----------|---------|-------------|---------|------|
| **MIDI-DDSP** (self-hosted) | High | 13 orchestral | 5-30s | GPU server cost |
| **ACE Studio 2.0** | Very high | Violin, viola, cello, sax, trumpet, duduk + 140 vocal models | N/A (desktop app) | $99-249 license, no API |
| **FluidSynth** (server-side) | Good | Full GM | <1s | CPU only, cheap |

**ACE Studio 2.0** (released Dec 2025) is notable -- it produces remarkably realistic orchestral instruments from MIDI input. However, it is a **desktop application only** with no API. It would require manual rendering, not programmatic integration.

**Recommendation:** For a web app, use **SoundFont in browser for preview**, then offer an optional **server-side render** using either FluidSynth with high-quality SoundFonts or a self-hosted MIDI-DDSP pipeline for the 13 supported instruments.

**Confidence:** MEDIUM (ACE Studio info from press releases, MIDI-DDSP from official repo)

---

## 3. Cloud APIs & Services

### A. APIs with Official Developer Access (Recommended)

#### ElevenLabs

| Capability | Status | Notes |
|------------|--------|-------|
| Sound Effects (SFX v2) | Available | Text-to-SFX, up to 30s, 48kHz, seamless looping |
| Text-to-Speech | Available | Industry-leading voice quality |
| Music Generation (Eleven Music) | Available | Text-to-music, 3s to 5min, MP3 44.1kHz |
| Music Inpainting | Enterprise only | Modify sections, change style, extend tracks |
| Audio-to-Audio Instrument Transform | NOT available | Cannot upload audio and change its instrument |
| Voice Cloning | Available | For voice, not instruments |

**Pricing:** Credit-based. SFX costs 200 credits per generation (auto-duration) or 40 credits/second (manual duration). Music: ~$0.02-$0.06 per generation depending on plan.

**Verdict:** Excellent for SFX and music generation. Cannot do instrument transformation. Already integrated in Story's sound lab.

**Confidence:** HIGH (verified via official ElevenLabs documentation)

#### Stability AI -- Stable Audio 2.5

| Capability | Status | Notes |
|------------|--------|-------|
| Text-to-Audio | Available | Up to 3 min, 44.1kHz, multiple genres |
| **Audio-to-Audio** | **Available** | **Upload audio + text prompt = transformed audio** |
| Audio Inpainting | Available | Edit specific sections |
| Custom Fine-tuning | Enterprise | Train on your own sound library |

**Audio-to-Audio Parameters:**
- `prompt` (required): Text describing desired transformation (e.g., "replace guitar with synths and add echo")
- `audio_url` (required): Source audio to transform
- `strength` (0-1, default 0.8): 0 = identical to input, 1 = completely new
- `guidance_scale` (1-25, default 1): Prompt adherence
- `num_inference_steps` (4-8, default 8): Quality vs speed
- `total_seconds` (1-190): Output duration

**Pricing:** ~$0.20/run on Replicate. Stability AI platform pricing updated Aug 2025.

**THIS IS THE CLOSEST THING TO INSTRUMENT TRANSFORMATION VIA API.** You can literally prompt "replace guitar with synths" and get transformed audio back. Quality is good but not perfect -- complex audio with many instruments produces less predictable results.

**Confidence:** HIGH (verified via official Stability AI docs and EachLabs model page)

#### Google -- Lyria RealTime (via Gemini API)

| Capability | Status | Notes |
|------------|--------|-------|
| Real-time music generation | Available | WebSocket streaming, <2s latency |
| Instrument specification | Available | Extensive instrument list via text prompts |
| BPM control | Available | 60-200 BPM |
| Key/scale control | Available | 12 musical scales |
| Density/brightness | Available | Fine-grained tonal control |
| Vocals | NOT available | Instrumental only |
| Audio-to-audio | NOT available | Generate only, cannot transform existing audio |

**Technical:** Uses WebSocket for real-time bidirectional streaming. 48kHz stereo output. All output is watermarked (SynthID). Excellent for interactive music creation but cannot transform existing audio.

**Pricing:** Available via Gemini API. Specific audio pricing not confirmed in research.

**Verdict:** Excellent for real-time interactive music but cannot do instrument transformation of existing audio. Could be used to generate new music in a specific instrument, then the user composes with it.

**Confidence:** HIGH (verified via official Google AI developer documentation)

#### Replicate (Model Marketplace)

Key audio models available:

| Model | Cost/Run | What It Does | Instrument Transform? |
|-------|----------|-------------|----------------------|
| **meta/musicgen** (melody) | ~$0.07 | Text+melody -> music | Indirect (re-renders melody in new style) |
| **Stable Audio Open 1.0** | ~$0.17 | Text -> audio | Text-to-audio only |
| **Stable Audio 2.5 A2A** | ~$0.20 | Audio+text -> audio | **YES** (best option) |
| **cjwbw/demucs** | ~$0.016 | Stem separation | Prerequisite for transform pipeline |
| Various RAVE models | Variable | Timbre transfer | Limited availability |

**MusicGen Melody (1.5B) Deep Dive:**
- Input: text prompt + audio reference
- The audio reference provides melody/harmonic guidance
- Text prompt specifies instrumentation and style
- Output: new audio following input melody but with requested instrumentation
- Not a "transform" -- it generates new audio inspired by the reference
- Useful for "take this melody and render it as jazz piano"

**Confidence:** MEDIUM (pricing verified on Replicate, capabilities partially verified)

### B. APIs with Limited/Unofficial Access

#### Suno AI
- **NO official public API** as of Feb 2026
- V5 model (Sep 2025) produces the highest quality full-song generation
- Unofficial third-party wrappers exist (sunoapi.org, gcui-art/suno-api) but:
  - Legal grey area (reverse-engineered)
  - Can break without notice
  - Not suitable for production
- Cannot do instrument transformation -- generates complete songs from prompts
- **Verdict: Do not integrate.** Wait for official API or use alternatives.

**Confidence:** MEDIUM (verified via multiple sources that no official API exists)

#### Udio AI
- **NO official public API** as of Feb 2026
- Third-party wrappers exist (musicapi.ai, udioapi.pro) -- same caveats as Suno
- Models: v1.0, v1.5, v1.5 Allegro
- Cannot do instrument transformation
- **Verdict: Do not integrate.** Same recommendation as Suno.

**Confidence:** MEDIUM (verified via official Udio help center stating no public API)

#### Kits.AI
- Has an official API for voice conversion and voice-to-instrument
- **Acquired by Splice in late January 2026** -- API future uncertain
- Can convert audio (voice, instrument) into other instruments (guitar, bass, sax, cello)
- Enterprise API access available
- TTS functionality deprecated from API as of Sep 2025
- **Verdict: Interesting but risky.** The Splice acquisition creates uncertainty about API continuity and pricing.

**Confidence:** MEDIUM (API exists but acquisition creates uncertainty)

#### Audimee
- Voice-to-instrument conversion (guitar, brass, woodwinds, strings)
- API access on enterprise plans only (contact hi@audimee.com)
- 100+ voice models, can convert singing/humming to instruments
- **Verdict: Worth exploring** for voice-to-instrument specifically, but enterprise pricing likely high.

**Confidence:** LOW (limited API documentation available publicly)

### C. Music Generation APIs (Not Instrument Transform, But Related)

| Service | API Status | Strengths | Instrument Transform? |
|---------|------------|-----------|----------------------|
| **Soundverse** | Official API (July 2025) | Enterprise-grade, JS SDK, stem splitting, ethical licensing | No |
| **Mubert** | Official API 3.0 | Real-time streaming, 150+ moods, sub-second latency, DMCA-free | No |
| **OpenAI** | No music API yet | Reportedly developing audio gen model (Q1 2026) | TBD |

**Confidence:** MEDIUM

---

## 4. Neural Audio Effects

### What Exists

| Tool | Type | Real-Time? | Web API? | Notes |
|------|------|-----------|----------|-------|
| **Neutone** | VST/AU plugin with neural effects | Yes (CPU) | No | RAVE-based timbre transfer models (violin, kora, drums, voice) |
| **DDSP-VST** | VST neural synthesizer | Yes | No | Real-time neural audio synthesis |
| **Masterchannel** | AI mastering service | Near-real-time | Yes (web service) | Grammy-winning producer quality |
| **eMastered** | AI mastering service | Near-real-time | Yes (web service) | Created by Grammy winners |
| **AI Mastering** | AI mastering service | Near-real-time | Yes (web service) | Automatic online mastering |
| **Waves Online Mastering** | AI mastering | Near-real-time | Yes (web service) | From Waves (industry standard) |
| **RoEx** | AI mixing/mastering | Near-real-time | API available | Mixing and mastering services |

### Advanced Research (2025)

- **Differentiable Mastering Chain**: White-box models with interpretable parameters allow text-prompt-driven mastering adjustments ("enhance clarity", "tighten dynamics", "widen stereo")
- **DDSP-based effect modeling**: Neural networks controlling DSP parameters (filters, compressors) in real-time based on input analysis
- **Style transfer mixing (MixFXcloner)**: Transfers the mixing style of a reference track to your multitrack

### What's Practical for a Web App

For the Story app, the most practical neural audio effects are:

1. **AI Mastering APIs** (Masterchannel, eMastered, RoEx) -- Apply to final mixes for polish
2. **Web Audio API native effects** -- Standard reverb, delay, EQ, compression run natively in browser
3. **Stable Audio 2.5 Audio-to-Audio** with low strength -- Apply subtle style changes to existing audio

Neural real-time effects (Neutone, DDSP-VST) are desktop-only and cannot be run in a browser.

**Confidence:** MEDIUM

---

## 5. Text-to-Sound with Instrument Control

### "Take this melody and play it on a cello" -- What Actually Works?

This is the core question. Here's the honest assessment:

#### Approach 1: MusicGen Melody (Best Available)
1. Extract melody from source audio (or provide as audio reference)
2. Prompt: "solo cello performance, classical, expressive, warm tone"
3. MusicGen generates new audio following the melody contour but played as cello
4. **Quality: MEDIUM** -- follows melody reasonably well, cello sound is recognizable but not studio-grade
5. **Cost:** ~$0.07/run on Replicate

#### Approach 2: Stable Audio 2.5 Audio-to-Audio
1. Upload source audio (e.g., guitar melody)
2. Prompt: "replace guitar with solo cello, classical, warm tone"
3. Strength: 0.5-0.7 (preserve structure but change instrument)
4. **Quality: MEDIUM** -- can change timbral character but results vary
5. **Cost:** ~$0.20/run on Replicate

#### Approach 3: Decompose + Resynthesize (Most Control)
1. Separate stems with Demucs ($0.016)
2. Isolate the instrument track you want to transform
3. Run through MusicGen Melody or Stable Audio A2A
4. Remix with other stems
5. **Quality: MEDIUM-HIGH** -- cleaner because you're transforming isolated audio
6. **Cost:** ~$0.10-0.25 combined

#### Approach 4: Voice-to-Instrument (Kits.AI / Audimee)
1. Hum or sing the melody
2. Convert to target instrument via Kits.AI or Audimee
3. **Quality: MEDIUM** -- specialized for this task but quality varies by instrument
4. **API availability uncertain** (Kits.AI acquired by Splice)

#### Approach 5: MIDI Extraction + Neural Render (Most Faithful)
1. Extract MIDI from audio (using Essentia.js pitch detection or a cloud transcription service)
2. Render MIDI through MIDI-DDSP for the target instrument
3. **Quality: HIGH** for supported instruments (13 orchestral)
4. **Requires self-hosted GPU** for MIDI-DDSP
5. Most faithful to original melody but limited instrument palette

### Honest Assessment

**No model can perfectly "swap instruments" in arbitrary audio while preserving exact melody and rhythm.** The technology is close but not there yet. The best results come from:
- Isolated/clean source audio (single instrument, no background)
- Common target instruments (piano, guitar, strings, synths)
- Accepting some creative interpretation rather than demanding exact replication

**Confidence:** MEDIUM (tested via multiple sources, but quality claims hard to verify without hands-on testing)

---

## 6. LLM-Guided Audio

### GPT-4o Audio Capabilities

- Strong audio understanding: intent classification, speech recognition, singing analysis
- New TTS model (gpt-4o-mini-tts-2025-12-15) with 35% lower word error rates
- Improved Realtime API (Aug 2025 GA) with better tool calling
- **Cannot generate music or sound effects** -- speech/voice only
- **Cannot transform audio** -- understanding only, no generation
- GPT-4o retired from ChatGPT Feb 13, 2026 (replaced by GPT-5)
- OpenAI reportedly developing dedicated audio generation model for Q1 2026

**Useful for:** Analyzing audio content, transcribing, understanding musical structure. NOT useful for generation or transformation.

**Confidence:** HIGH (verified via official OpenAI announcements)

### Gemini Audio Capabilities

- Natively multimodal: understands audio, video, text, images, code
- Gemini 2.5: up to 8.4 hours of audio per prompt (1M input tokens)
- Can do: transcription, chapterization, key event detection, translation
- Music analysis: performs well on MIDI but less reliably on raw audio
- **Gemini 2.5 + Lyria RealTime**: Can understand audio AND generate music (different models, same API ecosystem)

**Useful for:** Audio analysis pipeline -- analyze source audio with Gemini, then use analysis to condition Lyria RealTime or other generation APIs.

**Confidence:** HIGH (verified via official Google documentation and ISMIR 2025 benchmark)

### Practical LLM-Audio Integration Pattern

```
User uploads audio
  -> Gemini analyzes (key, tempo, instruments, mood, melody description)
  -> LLM constructs optimized prompt for generation API
  -> Stable Audio / MusicGen / Lyria generates new audio
  -> Result returned to user
```

This "LLM as audio understanding + prompt engineer" pattern is the most practical way to use LLMs in an audio transformation pipeline. The LLM does not do the transformation -- it understands the input and crafts the optimal prompt for the generation model.

---

## 7. Quality Assessment

### Production Quality Tiers

| Tier | Technology | Quality Level | Use Case |
|------|-----------|--------------|----------|
| **Studio** | Suno V5, Udio V1.5 | Near-professional for full songs | End-user music creation |
| **Professional** | ACE Studio 2.0 | Professional for specific instruments | Orchestral/vocal scoring |
| **Good** | Stable Audio 2.5, ElevenLabs Music | Good for most production use | Sound design, background music |
| **Functional** | MusicGen, AudioLDM2 | Recognizable instruments, some artifacts | Prototyping, previews |
| **Preview** | SoundFont/MIDI | Obviously synthetic | Quick MIDI playback |

### Instrument Transformation Quality (Honest Assessment)

| Approach | Melody Preservation | Instrument Realism | Artifacts | Overall |
|----------|--------------------|--------------------|-----------|---------|
| Stable Audio A2A (strength 0.5) | Good | Medium-Good | Occasional | 7/10 |
| MusicGen Melody | Medium | Medium | Some | 6/10 |
| Demucs + Resynth pipeline | Good | Medium-Good | Depends on separation quality | 7/10 |
| MIDI-DDSP (self-hosted) | Excellent | Good (13 instruments) | Minimal | 8/10 |
| Kits.AI voice-to-instrument | Medium | Medium | Variable | 5-7/10 |
| SoundFont re-render | Excellent (MIDI) | Low-Medium | None (but synthetic) | 5/10 |

**Key takeaway:** Nothing scores 10/10. The best approach depends on your priority:
- **Preserve melody exactly?** MIDI extraction + SoundFont or MIDI-DDSP
- **Best instrument realism?** Stable Audio 2.5 A2A or Decompose+Resynth
- **Fastest/cheapest?** MusicGen Melody on Replicate

---

## 8. Recommended Architecture for Story App

### Tier 1: Implement First (Cloud APIs, No Self-Hosting)

```
Browser Layer (Tone.js + Web Audio API + SpessaSynth)
  |
  |-- MIDI Preview: SpessaSynth (SoundFont-based, instant playback)
  |-- Audio Effects: Web Audio API (reverb, delay, EQ, compression)
  |-- Pitch Detection: Essentia.js (melody extraction from audio)
  |
API Layer (Next.js Route Handlers)
  |
  |-- /api/ai/audio/transform
  |      -> Stable Audio 2.5 Audio-to-Audio (Replicate)
  |      -> Upload audio + instrument prompt = transformed audio
  |
  |-- /api/ai/audio/generate-from-melody
  |      -> MusicGen Melody (Replicate)
  |      -> Upload melody reference + instrument prompt = new audio
  |
  |-- /api/ai/audio/separate-stems
  |      -> Demucs (Replicate)
  |      -> Isolate instruments from mixed audio
  |
  |-- /api/ai/audio/sfx (existing)
  |      -> ElevenLabs SFX v2
  |
  |-- /api/ai/audio/music (existing or new)
  |      -> ElevenLabs Music API or Lyria RealTime
```

### Tier 2: Enhanced Pipeline (Composition)

```
Instrument Transformation Pipeline:
  1. User selects audio region
  2. Gemini analyzes audio (key, tempo, instruments, character)
  3. User picks target instrument
  4. System constructs optimal prompt
  5. If mixed audio: Demucs separates stems first
  6. Stable Audio 2.5 A2A transforms the target stem
  7. Remix stems and return result

Cost per transformation: ~$0.02 (Gemini) + $0.016 (Demucs) + $0.20 (Stable Audio) = ~$0.24
```

### Tier 3: Advanced (Self-Hosting Required)

```
Self-hosted GPU server:
  - MIDI-DDSP for high-quality orchestral instrument synthesis
  - Custom RAVE models for creative timbre transfer
  - DDSP models for monophonic instrument transformation

Requires: NVIDIA GPU server (A10G or better), Python/PyTorch runtime
Cost: $0.50-1.50/hr for GPU instance
```

### Recommended Starting Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| MIDI Playback (browser) | SpessaSynth or js-synthesizer | WASM-based, high quality SoundFonts, no server needed |
| Audio Effects (browser) | Web Audio API + Tone.js | Native, zero latency, standard DSP effects |
| Instrument Transform | Stable Audio 2.5 A2A via Replicate | Best quality API for instrument swapping |
| Melody Re-render | MusicGen Melody via Replicate | Best for "play this melody as X instrument" |
| Stem Separation | Demucs via Replicate | Prerequisite for clean transformation |
| Sound Effects | ElevenLabs SFX v2 | Already integrated, excellent quality |
| Music Generation | ElevenLabs Music or Lyria RealTime | Already partially integrated |
| Audio Analysis | Gemini 2.5 or Essentia.js | Understanding audio before transforming |
| Pitch Detection | Essentia.js | Browser-side melody extraction |

---

## 9. Sources & Confidence Levels

### HIGH Confidence (Official Documentation Verified)

- [DDSP - Google Magenta](https://magenta.tensorflow.org/ddsp) -- Official project page
- [MIDI-DDSP](https://midi-ddsp.github.io/) -- Official project page with supported instruments
- [ElevenLabs Sound Effects Docs](https://elevenlabs.io/docs/overview/capabilities/sound-effects) -- Official API docs
- [ElevenLabs Music Docs](https://elevenlabs.io/docs/overview/capabilities/music) -- Official capability docs
- [Lyria RealTime API Docs](https://ai.google.dev/gemini-api/docs/music-generation) -- Official Google AI docs
- [MusicGen - Facebook Research](https://github.com/facebookresearch/audiocraft/blob/main/docs/MUSICGEN.md) -- Official GitHub
- [Stable Audio 2.5](https://stability.ai/stable-audio) -- Official product page
- [Neutone SDK](https://github.com/Neutone/neutone_sdk) -- Official GitHub
- [js-synthesizer (FluidSynth WASM)](https://deepwiki.com/jet2jet/js-synthesizer) -- Documentation
- [SpessaSynth](https://github.com/spessasus/spessasynth_core) -- Official GitHub
- [WebAudioFont](https://github.com/surikov/webaudiofont) -- Official GitHub
- [OpenAI Audio Models Update](https://developers.openai.com/blog/updates-audio-models/) -- Official blog
- [Demucs - Facebook Research](https://github.com/facebookresearch/demucs) -- Official GitHub
- [Replicate MusicGen](https://replicate.com/meta/musicgen) -- Official model page

### MEDIUM Confidence (Multiple Sources Agree)

- [Stable Audio 2.5 Audio-to-Audio on EachLabs](https://www.eachlabs.ai/ai-models/stable-audio-2-5-audio-to-audio) -- Third-party but detailed parameters
- [APSIPA 2025 Paper on Unified Timbre Transfer](http://www.apsipa.org/proceedings/2025/papers/APSIPA2025_P071.pdf) -- Conference paper
- [Neutone Blog on Neural Timbre Transfer](https://neutone.ai/blog/neural-timbre-transfer-effects-for-neutone) -- Official blog
- [BRAVE low-latency model](https://arxiv.org/html/2503.11562v2) -- Research paper
- [Kits.AI Instrument Converter](https://musictech.com/news/gear/kits-ai-instrument-converter-ai/) -- Press coverage
- [ACE Studio 2.0 Release](https://acestudio.ai/blog/ace-studio-2-released/) -- Official blog
- [Soundverse API](https://www.soundverse.ai/ai-music-generation-api) -- Official product page
- [AudioShake Developer Portal](https://developer.audioshake.ai/) -- Official docs
- Replicate pricing (~$0.07/run MusicGen, ~$0.20/run Stable Audio, ~$0.016/run Demucs) -- Replicate model pages

### LOW Confidence (Needs Validation)

- Suno V5 quality claims (sourced from promotional and third-party review sites)
- Udio V1.5 quality claims (sourced from comparison blog posts)
- Audimee API capabilities (limited public documentation)
- Kits.AI post-acquisition API status (Splice acquisition just happened Jan 2026)
- OpenAI's rumored audio generation model for Q1 2026 (unconfirmed reports)
- Exact Stable Audio 2.5 pricing on Stability AI's own platform (pricing page updated Aug 2025 but exact per-request cost not confirmed)
- Quality ratings in Section 7 (subjective assessments from community, not formal benchmarks)

---

## Appendix: Anti-Patterns to Avoid

1. **Do NOT use unofficial Suno/Udio APIs in production.** They are reverse-engineered, legally risky, and will break without warning.

2. **Do NOT try to run DDSP/RAVE in the browser.** These are GPU-heavy Python models. Even WASM compilation would produce unusable performance for real-time use.

3. **Do NOT promise "perfect instrument transformation."** No current technology can perfectly swap instruments in complex mixed audio. Set user expectations for "creative reinterpretation" rather than "surgical swap."

4. **Do NOT skip stem separation.** Trying to transform instruments in a mixed track produces much worse results than isolating first, transforming, then remixing.

5. **Do NOT ignore watermarking.** Lyria RealTime output is watermarked (SynthID). Stable Audio may also watermark. Check licensing terms for commercial use.

6. **Do NOT over-invest in self-hosting neural models** unless you have a clear use case that cloud APIs cannot serve. The infrastructure cost and maintenance burden is significant.

---

## Appendix: Cost Estimation

For a user performing 100 instrument transformations per month:

| Operation | Per-Use Cost | Monthly (100x) |
|-----------|-------------|-----------------|
| Stable Audio A2A | $0.20 | $20.00 |
| MusicGen Melody | $0.07 | $7.00 |
| Demucs Separation | $0.016 | $1.60 |
| Full Pipeline (Demucs + SA A2A) | $0.22 | $22.00 |
| ElevenLabs SFX | ~$0.02-0.06 | $2.00-6.00 |

**Total estimated cost for moderate usage: $25-50/month** on Replicate, plus ElevenLabs plan costs.

---

## Appendix: Gaps in Research

1. **Hands-on quality testing:** All quality assessments are based on documentation and community reports. Actual A/B testing of Stable Audio A2A vs MusicGen Melody for instrument transformation would be valuable.

2. **Latency benchmarks:** Exact end-to-end latency for the Demucs + Stable Audio pipeline needs real-world measurement.

3. **Replicate cold start times:** First inference on Replicate models can take 30-60s due to cold starts. Need to test and potentially use warm pools for production.

4. **ElevenLabs Music Inpainting:** Enterprise-only feature that could be very useful for instrument changes. Worth exploring if Story app scales to enterprise pricing.

5. **Google Lyria RealTime pricing:** Available via Gemini API but exact per-request pricing not confirmed in this research.

6. **OpenAI's upcoming audio model:** If launched Q1 2026, could change the landscape significantly.
