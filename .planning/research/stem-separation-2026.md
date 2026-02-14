# Audio Stem Separation / Source Separation: State of the Art (2025-2026)

**Researched:** 2026-02-14
**Context:** Web-based audio production tool (Next.js / Sound Lab module)
**Overall Confidence:** MEDIUM-HIGH (strong consensus across multiple sources)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Best Models Available](#best-models-available)
3. [Cloud APIs and Services](#cloud-apis-and-services)
4. [Browser-Based Options](#browser-based-options)
5. [Stem Capabilities: Beyond 4-Stem](#stem-capabilities-beyond-4-stem)
6. [Quality Comparison and Benchmarks](#quality-comparison-and-benchmarks)
7. [Instrument Recognition / Detection](#instrument-recognition--detection)
8. [Self-Hosted Options](#self-hosted-options)
9. [Recommendation for Story Sound Lab](#recommendation-for-story-sound-lab)
10. [Sources](#sources)

---

## Executive Summary

Audio stem separation has matured dramatically since 2023. The field has moved well beyond the original 4-stem paradigm (vocals, drums, bass, other) into 6-stem, 8-stem, and even 16-stem territory. The current state of the art is dominated by three model families: **MelBand RoFormer**, **BS-RoFormer**, and **SCNet**, with ensemble approaches combining these models producing the highest quality results.

For a web-based tool like Story's Sound Lab, the practical choice comes down to:
- **Cloud API (recommended):** Music.ai or AudioShake for production quality with the broadest stem support (8-18 stems), transparent per-minute pricing, and Node.js SDKs
- **ElevenLabs (already integrated):** Offers both audio isolation (voice/noise separation) and 6-stem separation, which may be sufficient and avoids adding a new vendor
- **Browser-based (experimental only):** FreeMusicDemixer has proven Demucs can run in-browser via WASM, but processing times are 5-17 minutes for a 4-minute song -- impractical for production use

The key tradeoff is quality vs. latency vs. cost. Cloud APIs deliver the best quality with 10-60 second processing times. Browser-based approaches are free but painfully slow. Self-hosted GPU servers offer a middle ground but add operational complexity.

---

## Best Models Available

### Tier 1: State of the Art (2024-2025)

#### MelBand RoFormer
- **Origin:** ByteDance AI Labs (extension of BS-RoFormer)
- **Paper:** "Mel-Band RoFormer for Music Source Separation" (Oct 2023, arxiv.org/abs/2310.01809)
- **Key Innovation:** Uses mel-scale-based frequency band projection instead of heuristic band splits, capturing perceptual differences in frequencies
- **Performance:** ~12.4-12.6 dB SDR for vocals on MUSDB18HQ; outperforms BS-RoFormer for vocals, drums, and "other" stems by ~0.5 dB average
- **Strengths:** Best single model for vocal separation (selected for 97% of songs in ensemble testing); mel-band mapping mimics human auditory perception
- **Status:** ACTIVE, widely used in UVR and MVSEP
- **Confidence:** HIGH (verified across multiple academic and community sources)

#### BS-RoFormer (Band-Split Roformer)
- **Origin:** ByteDance AI Labs
- **Paper:** "Music Source Separation with Band-Split RoPE Transformer" (Sep 2023, arxiv.org/abs/2309.02612)
- **Key Innovation:** Hierarchical Transformer with Rotary Position Embedding (RoPE), band-split scheme for multi-band mask estimation
- **Performance:** 12.9 dB SDR for vocals, 11.99 dB average SDR with extra training data; won SDX23 Challenge
- **Strengths:** Most consistent across all stem types; best for instrumental extraction
- **Status:** ACTIVE, backbone of most production systems
- **Confidence:** HIGH

#### SCNet (Sparse Compression Network)
- **Origin:** Research paper (Jan 2024, arxiv.org/abs/2401.13276)
- **Key Innovation:** Splits spectrogram into subbands with variable compression ratios -- higher compression for less informative bands, preserving fidelity where it matters
- **Performance:** 9.0 dB SDR on MUSDB18HQ without extra data; CPU inference only 48% of HTDemucs time
- **Strengths:** Excellent efficiency/quality tradeoff; much faster inference than RoFormer models; SCNet-XL variant used in top ensembles
- **Status:** ACTIVE, newer model gaining adoption
- **Confidence:** HIGH

#### Ensemble: BS-RoFormer + MelBand RoFormer + SCNet-XL
- **Used by:** MVSEP Premium, UVR ensemble mode
- **Performance:** +0.8-1.0 dB SDR improvement over any single model
- **Status:** Current gold standard for maximum quality
- **Confidence:** HIGH

### Tier 2: Proven and Widely Available

#### HTDemucs (Hybrid Transformer Demucs v4)
- **Origin:** Meta/Facebook AI Research
- **Architecture:** Dual U-Nets (temporal + spectral) with Transformer cross-attention
- **Performance:** Won Sony MDX Challenge; lower SDR than RoFormer models but excellent versatility
- **Variants:**
  - `htdemucs` -- standard 4-stem model (81 MB weights)
  - `htdemucs_ft` -- fine-tuned, 4x slower but ~0.5 dB better
  - `htdemucs_6s` -- 6-stem (adds guitar, piano) but piano quality is poor (53 MB weights)
- **Strengths:** Open source (MIT license), ONNX-convertible, broadest community support, Docker images available
- **Weaknesses:** 6-stem model has significant stem bleeding for piano; lower quality than RoFormer ensemble
- **Status:** ACTIVE but no longer SOTA; still the most accessible open-source option
- **Confidence:** HIGH

#### BandIt Plus
- **Origin:** Research paper "A Generalized Bandsplit Neural Network for Cinematic Audio Source Separation"
- **Purpose:** Specifically designed for **cinematic** separation: dialogue, music, and effects (DME)
- **Performance:** State of the art on Divide and Remaster dataset for dialogue stem
- **Strengths:** Psychoacoustically motivated frequency scales; great for film/TV content
- **Weaknesses:** Not designed for music stem separation (vocals/drums/bass/guitar)
- **Status:** ACTIVE, available via MVSEP
- **Confidence:** MEDIUM (niche use case)

### Tier 3: Deprecated / Outdated

#### Spleeter (Deezer, 2019)
- **Status:** Effectively abandoned. No updates since 2019. Deezer considers it "feature complete."
- **Quality:** Significantly behind modern models (multiple dB lower SDR)
- **Recommendation:** Do NOT use. Choose Demucs v4 as minimum baseline.

#### Open-Unmix (UMX)
- **Status:** Research reference implementation. Not competitive with current SOTA.

---

## Cloud APIs and Services

### Recommended: Music.ai

| Attribute | Details |
|-----------|---------|
| **API Type** | REST API with Node.js and Python SDKs |
| **Stem Types** | 18+ stem types (industry-leading) |
| **Pricing Model** | Pay-per-minute, no subscription required |
| **Free Tier** | $0 upfront, 48h temporary storage, 2 concurrent jobs |
| **Documentation** | https://music.ai/docs/api/reference/ |

**Per-Minute Pricing:**

| Stem Type | Cost/min |
|-----------|----------|
| Instrumental (vocals removed) | $0.05 |
| Cinematic (dialogue/music/effects) | $0.05 |
| Individual musical stems (bass, drums, guitars, keys, piano, strings, vocals, wind) | $0.07 each |
| Lead + backing vocals split | $0.10 |
| Guitar parts (rhythm/solo) or acoustic/electric | $0.10 |
| Drum sub-stems (kick, snare, toms, hi-hat, cymbals) | $0.15 |
| Instrument detection (classification) | $0.02 |

**Supported Musical Stems:** Vocals, Bass, Drums, Guitars, Keys, Piano, Strings, Wind, Lead Vocals, Backing Vocals, Kick Drum, Snare Drum, Toms, Hi-hat, Cymbals, Rhythm Guitar, Solo Guitar, Acoustic Guitar, Electric Guitar

**Why recommended:** Broadest stem coverage (18 stems), instrument detection module, transparent per-minute pricing, Node.js SDK, no minimum commitment. They claim 15.8% higher average SDR than nearest competitor and achieved highest subjective quality rating (66.07) in human evaluation testing.

**Confidence:** MEDIUM-HIGH (pricing verified from official site; quality claims are self-reported benchmarks)

---

### Strong Alternative: AudioShake

| Attribute | Details |
|-----------|---------|
| **API Type** | REST API (Tasks API) + JavaScript widget + Native SDK |
| **Stem Types** | 14 instrument stems + dialogue/effects + transcription |
| **Pricing Model** | Credit-based (1 credit/minute for most stems) |
| **SDK** | Native SDK with <50ms latency for real-time separation (iOS, Android, Windows, Linux) |
| **Documentation** | https://developer.audioshake.ai/ |

**Available Stems (1.0 credit/min each):**
- Vocals (with `high_quality` variant at 1.5 credits/min)
- Lead Vocals, Backing Vocals
- Instrumental (with `high_quality` variant)
- Drums, Bass, Guitar, Electric Guitar, Acoustic Guitar
- Piano, Keys, Strings, Wind, Other

**Additional Capabilities:**
- Dialogue/Music/Effects separation (for film/TV content)
- Multi-voice speaker separation (2-speaker and n-speaker)
- Lyric transcription with word-level alignment
- Music detection (0.5 credits/min)

**Why notable:** Only provider with a real-time native SDK (<50ms latency, 200x real-time). JavaScript widget exists for browser embedding but is a pop-up tool, not a full client-side SDK. Strong for film/TV use cases with DME separation.

**Confidence:** HIGH (verified from developer docs)

---

### Already Integrated: ElevenLabs

| Attribute | Details |
|-----------|---------|
| **API Type** | REST API (already used in Sound Lab) |
| **Stem Separation Endpoint** | `POST /v1/music/stem-separation` |
| **Stem Modes** | `two_stems_v1` (2 stems) or `six_stems_v1` (6 stems, default) |
| **Audio Isolation Endpoint** | `POST /v1/audio-isolation` (voice isolator) |
| **Pricing** | 0.5x generation cost for 2 stems, 1.0x for 4 stems |
| **File Limits** | Up to 500MB, 1 hour |
| **Output** | ZIP archive with separated stems |

**Key Details:**
- The 6-stem mode was launched with their Eleven Music product (Oct 2025)
- Specific 6-stem breakdown not fully documented in API docs (likely vocals, drums, bass, guitar, piano, other based on industry standard)
- Audio isolation is a separate endpoint specifically for voice/noise separation (speech from background)
- Streaming audio isolation available for real-time use
- Supports MP3, WAV, MP4, MOV formats

**Why consider:** Already integrated into the Sound Lab. Adding stem separation is just one new API endpoint call. No new vendor, no new billing. The 6-stem mode covers most use cases.

**Weakness:** Limited to 6 stems maximum. No instrument-specific granularity (e.g., no separate acoustic/electric guitar, no drum sub-stems). Quality benchmarks not independently published.

**Confidence:** HIGH (verified from official ElevenLabs documentation)

---

### Budget Option: MVSEP

| Attribute | Details |
|-----------|---------|
| **API Type** | REST API (Python examples on GitHub) |
| **Models** | BS-RoFormer, MelBand RoFormer, SCNet, HTDemucs, BandIt Plus, and ensembles |
| **Unique Strength** | Most models available anywhere -- users can choose specific algorithms |
| **Pricing** | Credit-based; Free tier with limits; Premium for ensemble + API |

**Plan Tiers:**

| Feature | Unregistered | Registered (Free) | Premium |
|---------|-------------|-------------------|---------|
| Audio length | 10 min | 10 min | 100 min |
| File size | 100 MB | 100 MB | 1000 MB |
| Concurrent jobs | 1 | 1 | Unlimited |
| Models | Old + HQ | Old + HQ | All + Ensemble |
| Output formats | MP3 only | MP3/FLAC/WAV/M4A | All |
| API access | No | Limited | Full |
| Queue priority | Low | Medium | High |

**Stem Support (via various models):**
- Standard 4-stem (vocals, drums, bass, other)
- 6-stem (adds guitar, piano)
- Instrument-specific: keyboard instruments (piano, organ, harpsichord, accordion), guitars (acoustic, electric, lead, rhythm), strings (violin, cello, harp, etc.), wind/brass (saxophone, flute, trumpet, trombone, oboe, clarinet, french horn, tuba, etc.), percussion (timpani, tambourine, marimba, xylophone, etc.)
- Specialized: karaoke, choir, male/female voice split, crowd removal, lead/backing vocals
- Cinematic: speech, music, effects (via BandIt Plus)

**Why consider:** Most comprehensive model selection. Premium ensemble mode reportedly produces the best raw SDR scores. Excellent for experimentation and comparing models. API documentation has Python examples.

**Weakness:** Pricing is opaque (no published per-minute rates for Premium). API is Python-focused with no official Node.js SDK. Queue-based processing may have unpredictable latency.

**Confidence:** MEDIUM (API access verified; pricing details incomplete)

---

### Other Services

#### LALAL.AI
- **API:** Enterprise-only (requires contacting sales for a quote)
- **Consumer pricing:** Pay-per-minute packs ($20/90min, $27/300min, $35/500min)
- **Stems:** Vocals, instrumental, drums, bass, piano, guitars, synthesizer, strings, wind
- **Formula:** Minutes deducted = file length x number of stem types
- **Notable:** VST plugin coming in 2026 for offline use
- **API verdict:** Not practical for integration -- enterprise pricing is opaque, no self-service API
- **Confidence:** MEDIUM (pricing from official site; API access unverified)

#### Moises.ai
- **API:** NO PUBLIC API. Consumer-only product.
- **Pricing:** $2.74/month (Premium), $18.33/month (Pro)
- **Quality:** Good consumer experience but not integratable
- **Verdict:** Not an option for programmatic integration
- **Confidence:** HIGH (no API confirmed by multiple sources)

#### Fadr.com
- **API:** No documented public developer API
- **Consumer pricing:** Free (4 stems, MP3) or $10/month (16 stems, WAV)
- **Notable:** Claims 16 stem types -- the most of any consumer tool (lead vocals, backing vocals, kick, snare, other drums, piano, guitar, strings, wind, and more)
- **Verdict:** Potentially interesting model quality but no API for integration
- **Confidence:** MEDIUM (no API verification possible)

#### Replicate (Demucs)
- **Pricing:** ~$0.016 per run (varies by audio length)
- **Models:** Demucs v4 (htdemucs, htdemucs_ft, mdx_extra)
- **Verdict:** Cheapest cloud option for basic 4-stem separation; good for prototyping
- **Confidence:** MEDIUM (pricing approximate)

---

## Browser-Based Options

### Current State: Technically Possible, Practically Limited

#### FreeMusicDemixer (freemusicdemixer.com)
- **Technology:** Demucs v4 compiled to WebAssembly via demucs.cpp + Emscripten
- **Model sizes:** htdemucs (81 MB), htdemucs_6s (53 MB) -- stored as float16
- **Performance:**
  - Single-threaded WASM: ~17 minutes for a 4-minute song
  - Multi-threaded with SSE4.2 translation: ~25% faster, still 8-12 minutes
  - Max memory setting (16-32 GB allocation) helps with parallel workers
- **Supports:** 4-stem and 6-stem separation
- **Status:** Original repository archived (April 2025); live site continues separately
- **Verdict:** Proves concept but impractical for production use. Users will not wait 10+ minutes.

#### ONNX Runtime Web + WebGPU
- **State:** ONNX conversion of Demucs v4 was accomplished as a GSOC 2025 project (Mixxx DJ software)
- **Potential:** ONNX Runtime Web supports WebGPU backend, which provides ~19x speedup for some models (SAM encoder benchmark)
- **Reality for stem separation:** No production-ready browser implementation of RoFormer or Demucs using WebGPU exists yet
- **Quantization:** INT8/FP16 quantization can shrink models without major accuracy loss
- **Browser inference:** Still ~5x slower than native GPU for most models

#### Transformers.js
- **Capabilities:** Runs ONNX models in browser with WebGPU acceleration
- **Audio support:** Demonstrated with Whisper (speech recognition)
- **Stem separation:** No production stem separation models available in Transformers.js format
- **Potential:** Could theoretically run a quantized MelBand RoFormer, but no one has done this yet

### Browser-Based Verdict

**Do NOT plan on browser-based stem separation as a primary feature.** The processing times are 10-100x too slow for a good user experience. Use cloud APIs for processing and stream results back to the browser.

**Exception:** If privacy/offline is critical, browser-based separation could be offered as an "experimental" feature with clear expectations ("This will take 10-15 minutes").

**Confidence:** HIGH (verified through multiple implementations and benchmarks)

---

## Stem Capabilities: Beyond 4-Stem

### Standard 4-Stem (Universally Available)
1. Vocals
2. Drums
3. Bass
4. Other (everything else)

### 6-Stem (Widely Available)
5. Guitar
6. Piano

Available via: Demucs htdemucs_6s, ElevenLabs 6-stem mode, Music.ai, AudioShake, MVSEP
Note: Quality degrades compared to 4-stem, especially for piano

### 8-Stem (Available from Top Services)
7. Strings
8. Wind/Brass

Available via: Music.ai, AudioShake, LALAL.AI, MVSEP

### 10+ Stem (Instrument-Specific, Premium Services)
- Lead Vocals vs. Backing Vocals (Music.ai, AudioShake, MVSEP)
- Acoustic Guitar vs. Electric Guitar (Music.ai, AudioShake, LALAL.AI)
- Rhythm Guitar vs. Solo Guitar (Music.ai)
- Keys (organ, synth) vs. Piano (Music.ai, AudioShake)

### 16+ Stem (Maximum Granularity)
- Kick, Snare, Toms, Hi-hat, Cymbals (drum sub-stems) -- Music.ai, Fadr
- Individual orchestral instruments (violin, cello, etc.) -- MVSEP
- Individual brass/woodwind (trumpet, sax, flute, etc.) -- MVSEP

### How Multi-Stem Actually Works

Most services achieve high stem counts through **cascaded separation**, not a single model:
1. First pass: 4-stem separation (vocals/drums/bass/other)
2. Second pass: Sub-separate each stem (e.g., drums -> kick/snare/hi-hat/cymbals)
3. Third pass: Further granularity (e.g., other -> guitar/piano/strings/wind)

Each cascading step introduces additional artifacts. Quality degrades with each level. The first 4 stems are always the cleanest.

**Confidence:** HIGH (consistent across all sources)

---

## Quality Comparison and Benchmarks

### SDR Scores (Signal-to-Distortion Ratio) on MUSDB18HQ

Higher = better. Above 6 dB is "decent," above 8 dB is "very clean," above 10 dB is excellent.

| Model/Service | Vocals SDR | Drums SDR | Bass SDR | Other SDR | Avg SDR |
|--------------|------------|-----------|----------|-----------|---------|
| MVSEP Ensemble (BS-RoFormer + MelBand + SCNet) | ~13.0+ | ~11.0+ | ~10.0+ | ~8.0+ | ~12.0+ |
| BS-RoFormer (single) | 12.9 | ~10.5 | ~9.5 | ~7.5 | ~11.99 |
| MelBand RoFormer (single) | ~12.5 | ~10.5 | ~9.0 | ~7.5 | ~11.5 |
| AudioShake (latest) | 13.5 | -- | -- | -- | -- |
| Music.ai | "15.8% higher than nearest competitor" | -- | -- | -- | -- |
| SCNet | ~8.5 | ~8.5 | ~8.0 | ~6.5 | 9.0 |
| HTDemucs v4 (htdemucs_ft) | ~10.5 | ~10.0 | ~9.0 | ~6.5 | ~9.0 |
| Spleeter (2019) | ~6.5 | ~5.5 | ~5.0 | ~4.0 | ~5.3 |

**Note:** Commercial services (Music.ai, AudioShake) self-report their scores. Independent verification is limited. MVSEP ensemble scores are community-reported.

### Important Caveat: SDR != Perceptual Quality

Recent 2025 research (arxiv.org/html/2507.06917) demonstrates that SDR scores correlate poorly with human perception. A model with lower SDR can sound better to listeners. In human subjective evaluation:

| Service | Avg. Human Rating (out of 100) |
|---------|-------------------------------|
| Music.ai | 66.07 |
| AudioShake | 61.95 |
| AudioStrip | 51.33 |
| LALAL.AI | 48.58 |

(Source: Music.ai's own subjective analysis -- note potential bias in self-conducted evaluation)

### Practical Quality Rankings (Community Consensus)

Based on Gearspace, VI-Control, and AudioSEX forum discussions (2025):

1. **MVSEP Ensemble (Premium)** -- Best overall quality for both vocal/instrumental and 4-stem
2. **UVR5 with BS-RoFormer ensemble** -- Close to MVSEP, free but requires local GPU
3. **Music.ai** -- Best commercial API quality
4. **AudioShake** -- Strong quality, especially for dialogue/effects
5. **Logic Pro 11.2** -- Surprisingly good 6-stem; convenient for Apple ecosystem
6. **ElevenLabs** -- Good but limited benchmarks available
7. **LALAL.AI** -- Decent consumer quality, not top-tier
8. **Demucs standalone** -- Good baseline, struggles with piano and subtle instruments

**Confidence:** MEDIUM (community consensus is subjective; benchmark data from commercial providers may be biased)

---

## Instrument Recognition / Detection

### Available Solutions

#### Music.ai Instrument Detection Module
- **API Endpoint:** Available as a classification module
- **Pricing:** $0.02/min (cheapest module they offer)
- **Detected Instruments:** Vocals, Bass, Guitars, Drums, Strings, Piano, Keys, Wind (8 categories)
- **Output:** List of detected instruments with configurable threshold
- **Integration:** Same API as their stem separation -- can detect first, then separate only detected stems
- **Confidence:** HIGH (verified from official documentation)

#### Implicit Detection via Stem Separation
Most services do not offer a standalone "what instruments are in this mix?" endpoint. Instead, the common pattern is:
1. Run stem separation
2. Check which stems have significant audio content (non-silent)
3. This implicitly tells you which instruments are present

#### Research/Experimental Options
- **RauGen AI:** Uses Gemini AI for instrument identification (melody role, harmony, rhythm, prominence)
- **Tencent Media Lab:** Identifies instruments and notes, can convert between 31 instruments
- **CNN-based classifiers:** Academic research achieves 86-99% accuracy for individual instruments in isolation, but polyphonic detection (instruments in a mix) is significantly harder

### Recommendation for Instrument Detection

Use **Music.ai's instrument detection module** at $0.02/min as a pre-processing step. It's cheap enough to run on every uploaded track, and the results can drive UI decisions (show relevant stem separation options, display instrument labels).

If cost is a concern, run stem separation first and detect non-empty stems as a "free" instrument detection approach.

**Confidence:** MEDIUM (Music.ai module verified; quality of detection not independently benchmarked)

---

## Self-Hosted Options

For teams wanting to avoid per-minute API costs at scale:

### audio-separator (Python, pip)
- **Install:** `pip install audio-separator`
- **Models:** MDX-Net (21-65 MB), Demucs (84-870 MB), BS-RoFormer, MDXC, VR Arch
- **Usage:** CLI or Python library
- **Best model:** `model_bs_roformer_ep_317_sdr_12.9755.ckpt` (BS-RoFormer)
- **GPU:** Supports CUDA, DirectML (AMD/Intel)
- **Docker:** Can be containerized easily

### StemSplitter (Docker + Flask)
- **Repo:** github.com/jinoAlgon/StemSplitter-Audio-Separation-Server
- **Stack:** Flask API + Docker + Demucs
- **Usage:** REST API, self-hosted

### voice-separator-demucs (Docker Compose)
- **Repo:** github.com/paladini/voice-separator-demucs
- **Stack:** Docker Compose, web UI at localhost:7860
- **Models:** Demucs v3, v4, HD variants

### demucs.onnx (C++ ONNX)
- **Repo:** github.com/sevagh/demucs.onnx
- **Purpose:** C++ inference via ONNX Runtime, no Python dependency
- **Use case:** Embedded systems, native apps, or custom servers

### Cost Analysis: Self-Hosted vs. Cloud API

| Volume | Cloud API (Music.ai @ $0.07/min) | Self-Hosted GPU Server (~$0.50/hr) |
|--------|----------------------------------|-------------------------------------|
| 100 min/month | $7.00 | ~$15-20 (server cost) |
| 1,000 min/month | $70.00 | ~$15-20 |
| 10,000 min/month | $700.00 | ~$30-50 (more processing time) |
| 100,000 min/month | $7,000.00 | ~$100-200 |

Self-hosted becomes cost-effective above ~500-1,000 minutes/month. Below that, cloud APIs are cheaper when accounting for engineering time, maintenance, and GPU idle costs.

**Confidence:** MEDIUM (self-hosted cost estimates are approximate; depends heavily on hardware choices)

---

## Recommendation for Story Sound Lab

### Primary Recommendation: ElevenLabs (Already Integrated)

Since the Sound Lab already integrates with ElevenLabs for TTS, music generation, SFX, voice cloning, and audio isolation, **start with their stem separation API**:

```
POST /v1/music/stem-separation
- stem_variation_id: "six_stems_v1" (default) or "two_stems_v1"
- Returns: ZIP archive with separated stems
```

**Advantages:**
- Zero new vendor integration
- Existing billing relationship
- 6 stems covers 80%+ of use cases
- Audio isolation already works for voice/noise separation

**Limitations:**
- Maximum 6 stems (no drum sub-stems, no individual string/wind)
- No instrument detection
- Quality benchmarks not publicly available

### Upgrade Path: Music.ai (When More Stems Needed)

If users need more than 6 stems or instrument detection:

```
Music.ai API:
- 18+ stem types
- Instrument detection at $0.02/min
- Node.js SDK available
- Pay-per-minute, no commitment
```

### Implementation Architecture

```
User uploads audio
    |
    v
[Instrument Detection] --- Music.ai ($0.02/min) or skip
    |
    v
[Stem Separation Request]
    |
    +---> ElevenLabs API (6 stems, simple case)
    |     or
    +---> Music.ai API (8-18 stems, advanced case)
    |
    v
[ZIP with stems downloaded]
    |
    v
[Stems loaded into Sound Lab timeline]
    |
    v
[Web Audio API playback with solo/mute per stem]
```

### Cost Estimate

For typical Story Sound Lab usage (creative writing tool, not a DAW):
- Average track: 3-5 minutes
- Usage: Maybe 10-50 separations/month
- ElevenLabs: Included in existing plan (credits-based)
- Music.ai fallback: $2-20/month

### Do NOT Build

- **Browser-based separation:** 10-17 minute processing times are unacceptable
- **Self-hosted GPU server:** Operational complexity not justified for expected volume
- **Custom ML model training:** Not a core competency, existing models are excellent

---

## Sources

### Academic Papers
- [BS-RoFormer: Music Source Separation with Band-Split RoPE Transformer](https://arxiv.org/abs/2309.02612) - ByteDance, Sep 2023
- [Mel-Band RoFormer for Music Source Separation](https://arxiv.org/abs/2310.01809) - Oct 2023
- [SCNet: Sparse Compression Network for Music Source Separation](https://arxiv.org/abs/2401.13276) - Jan 2024
- [An Ensemble Approach to Music Source Separation](https://arxiv.org/html/2410.20773v1) - Oct 2024
- [Musical Source Separation Bake-Off: Comparing Objective Metrics with Human Perception](https://arxiv.org/html/2507.06917) - Jul 2025

### Official Documentation
- [ElevenLabs Stem Separation API](https://elevenlabs.io/docs/api-reference/music/separate-stems)
- [ElevenLabs Audio Isolation API](https://elevenlabs.io/docs/api-reference/audio-isolation/convert)
- [AudioShake Developer Docs](https://developer.audioshake.ai/)
- [AudioShake Models Reference](https://developer.audioshake.ai/models)
- [Music.ai API Reference](https://music.ai/docs/api/reference/)
- [Music.ai Pricing](https://music.ai/pricing/)
- [Music.ai Instrument Detection](https://music.ai/modules/classification/instruments-detection/)
- [LALAL.AI Business Solutions](https://www.lalal.ai/business-solutions/)
- [LALAL.AI Pricing](https://www.lalal.ai/pricing/)
- [MVSEP Plans](https://mvsep.com/en/plans)
- [MVSEP API Examples (GitHub)](https://github.com/ZFTurbo/MVSep-API-Examples)
- [Demucs (GitHub)](https://github.com/facebookresearch/demucs)

### Tools and Libraries
- [audio-separator (PyPI)](https://pypi.org/project/audio-separator/)
- [python-audio-separator (GitHub)](https://github.com/nomadkaraoke/python-audio-separator)
- [FreeMusicDemixer (GitHub)](https://github.com/sevagh/free-music-demixer)
- [demucs.onnx (GitHub)](https://github.com/sevagh/demucs.onnx)
- [StemSplitter Docker Server](https://github.com/jinoAlgon/StemSplitter-Audio-Separation-Server)
- [Demucs on Replicate](https://replicate.com/cjwbw/demucs)

### Benchmarks and Reviews
- [Music.ai Source Separation Benchmarks](https://music.ai/blog/research/source-separation-benchmarks/)
- [Music.ai Subjective Source Separation Analysis](https://music.ai/blog/research/Music-AI-Subjective-Analysis-Source-Separation/)
- [AudioShake: How to Choose Stem Separation](https://www.audioshake.ai/post/how-to-choose-the-best-vocal-stem-separation-tool)
- [MusicTech: Best Stem Separation Tools](https://musictech.com/guides/buyers-guide/best-stem-separation-tools/)
- [MusicRadar: 11 Best Stem Separation Tools](https://www.musicradar.com/music-tech/i-tested-11-of-the-best-stem-separation-tools-and-you-might-already-have-the-winner-in-your-daw)
- [Gearspace: Best Stem Separator 2025](https://gearspace.com/board/electronic-music-instruments-and-electronic-music-production/1443674-best-stem-separator-2025-a.html)
- [GSOC 2025: Converting Demucs v4 to ONNX](https://mixxx.org/news/2025-10-27-gsoc2025-demucs-to-onnx-dhunstack/)

### Browser/WASM
- [ONNX Runtime Web + WebGPU](https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html)
- [Transformers.js v3](https://huggingface.co/blog/transformersjs-v3)
- [FreeMusicDemixer Hacker News Discussion](https://news.ycombinator.com/item?id=37507734)
