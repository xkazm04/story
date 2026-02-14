# Audio AI APIs & Services Ecosystem Research

**Domain:** Audio AI APIs for web-based audio production tools
**Researched:** 2026-02-14
**Overall Confidence:** MEDIUM-HIGH
**Context:** Researched for integration into a Next.js storytelling app with Sound Lab module

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [ElevenLabs](#1-elevenlabs---comprehensive-audio-ai-platform)
3. [Replicate.com](#2-replicatecom---model-marketplace)
4. [Stability AI / Stable Audio](#3-stability-ai--stable-audio)
5. [Google Lyria / Vertex AI](#4-google-lyria--vertex-ai)
6. [AudioShake](#5-audioshake)
7. [LALAL.AI](#6-lalalai)
8. [Moises.ai](#7-moisesai)
9. [Fadr.com](#8-fadrcom)
10. [Freesound.org](#9-freesoundorg)
11. [Spotify Audio Analysis](#10-spotify-audio-analysis-api)
12. [Browser-Based / WASM Options](#11-browserbased--wasm-options)
13. [Emerging Players](#12-emerging-players)
14. [Comparison Matrix](#comparison-matrix)
15. [Recommendations for This Project](#recommendations-for-this-project)

---

## Executive Summary

The audio AI API landscape in early 2026 is maturing rapidly but remains fragmented. No single provider covers all audio production needs. **ElevenLabs** has emerged as the strongest all-in-one platform, covering TTS, voice cloning, sound effects, music generation, audio isolation, and speech-to-text. For specialized needs like stem separation, dedicated services like **AudioShake**, **LALAL.AI**, and **Fadr** offer superior quality. For music generation specifically, **Google Lyria** on Vertex AI and **Stable Audio 2.5** provide strong alternatives to ElevenLabs.

**Key insight for this project:** The existing Sound Lab already uses ElevenLabs. The recommendation is to deepen ElevenLabs integration first (it covers 80% of needs), then selectively add specialized services (Replicate for open-source models, Freesound for sample sourcing, browser WASM for real-time analysis).

---

## 1. ElevenLabs - Comprehensive Audio AI Platform

**Confidence:** HIGH (verified via official docs)
**Status:** Production-ready, industry leader
**Already integrated:** Yes (TTS, SFX, music, voice cloning, audio isolation in Sound Lab)

### Complete API Endpoint Catalog

| Endpoint | Method | Description | Billing |
|----------|--------|-------------|---------|
| `/v1/text-to-speech/{voice_id}` | POST | Text to speech synthesis | Per character |
| `/v1/text-to-speech/{voice_id}/stream` | POST | Streaming TTS | Per character |
| `/v1/speech-to-text` | POST | Transcription (Scribe v2) | Per audio minute |
| `/v1/sound-generation` | POST | Text to sound effects | Per generation |
| `/v1/music` | POST | Text to music (Eleven Music) | Per generation |
| `/v1/music/stream` | POST | Streaming music generation | Per generation |
| `/v1/music/composition-plan` | POST | Create structured composition plan | Free (rate-limited) |
| `/v1/audio-isolation` | POST | Remove background noise / isolate vocals | Per generation |
| `/v1/audio-isolation/stream` | POST | Streaming audio isolation | Per generation |
| `/v1/voices/add` | POST | Instant voice cloning (IVC) | Free |
| `/v1/text-to-voice/design` | POST | Design voice from text description | Per generation |
| `/v1/dubbing` | POST | Audio/video dubbing & translation | Per generation |
| `/v1/forced-alignment` | POST | Word-level timestamp alignment | Per generation |
| Voice Changer | POST | Replace one voice with another | Per generation |

### Sound Effects API Details

- **Endpoint:** `POST /v1/sound-generation`
- **Model:** `eleven_text_to_sound_v2`
- **Duration:** 0.5-30 seconds per generation
- **Parameters:**
  - `text` (required): Description of desired sound
  - `duration_seconds`: 0.5-30s
  - `loop`: Boolean for seamless looping (v2 only)
  - `prompt_influence`: 0-1 range (default 0.3)
- **Output formats:** MP3 (8 variants), PCM (7 formats), Opus (5 variants), mu-law, A-law
- **Quality:** Production-ready, excellent for cinematic SFX
- **Latency:** ~2-5 seconds for short effects

### Music Generation (Eleven Music) Details

- **Endpoint:** `POST /v1/music`
- **Model:** `music_v1`
- **Duration:** 3 seconds to 5 minutes
- **Key Parameters:**
  - `prompt`: Natural language description OR
  - `composition_plan`: Structured multi-section plan with per-section lyrics, styles
  - `music_length_ms`: 3,000-600,000ms
  - `force_instrumental`: Boolean
  - `respect_sections_durations`: Boolean
  - `store_for_inpainting`: Enterprise only
- **Output:** MP3 at 44.1kHz, 128-192kbps
- **Quality:** Studio-grade, supports vocals and instrumental
- **Languages:** Multilingual vocals (English, Spanish, German, Japanese, more)
- **Composition Plan:** Free endpoint to create structured plans (no credits consumed)
- **NOTE:** Music API available only to paid users

### Audio Isolation Details

- **Endpoint:** `POST /v1/audio-isolation`
- **Input:** Audio file upload (multipart)
- **Output:** Isolated audio (vocal-only or noise-removed)
- **Also available as streaming endpoint**
- **Quality:** Good for voice isolation; not as granular as dedicated stem separators

### Voice Design API

- **Endpoint:** `POST /v1/text-to-voice/design`
- **Models:** `eleven_multilingual_ttv_v2`, `eleven_ttv_v3`
- **Parameters:**
  - `voice_description`: Natural language voice description
  - `reference_audio_base64`: Reference audio (v3 only)
  - `guidance_scale`: Prompt adherence (default 5)
  - `loudness`, `quality`, `seed`: Fine-tuning controls
- **Output:** Array of voice previews with base64 audio + generated voice IDs
- **Text length:** 100-1000 characters for preview

### Speech-to-Text (Scribe)

- **Endpoint:** `POST /v1/speech-to-text`
- **Models:** Scribe v2, Scribe v2 Realtime
- **Languages:** 90+
- **Features:** Word-level timestamps, speaker diarization, audio tagging
- **Latency:** Scribe v2 Realtime: <150ms
- **Pricing:** $0.22-0.40 per hour of audio (volume-dependent)
- **Speed:** 20-50x real-time

### Voice Cloning

- **Endpoint:** `POST /v1/voices/add`
- **Types:** Instant Voice Cloning (IVC) and Professional Voice Cloning (PVC)
- **Input:** Multipart form with audio files
- **Parameters:** `name`, audio files, `remove_background_noise`, `description`, `labels`
- **Minimum audio:** ~1 minute recommended for quality
- **Output:** Voice ID for use with TTS

### Pricing Structure (2026)

| Plan | Monthly Cost | Credits | Key Limits |
|------|-------------|---------|------------|
| Free | $0 | 10,000 chars | 3 custom voices |
| Starter | $5 | ~30,000 chars | Basic features |
| Creator | $22 | ~100,000 chars | Higher quality formats |
| Pro | $99 | 500,000 chars | PCM 44.1kHz, all formats |
| Scale | $330 | 2,000,000 chars | Volume pricing |
| Business | Custom | Up to 11M credits | Enterprise |

- Credits are unified across models (TTS, SFX, Music)
- Flash v2.5/Turbo models: 0.5 credits per character (50% savings)
- Credit rollover: up to 2 months unused
- Sound Effects & Music: billed per generation from credit pool
- Speech-to-Text: billed per audio minute separately

### Sources
- [ElevenLabs API Reference](https://elevenlabs.io/docs/api-reference/introduction)
- [Sound Effects API](https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert)
- [Music API](https://elevenlabs.io/docs/api-reference/music/compose)
- [Audio Isolation](https://elevenlabs.io/docs/api-reference/audio-isolation)
- [Voice Design](https://elevenlabs.io/docs/api-reference/text-to-voice/design)
- [Pricing](https://elevenlabs.io/pricing/api)
- [Eleven Music Overview](https://elevenlabs.io/docs/overview/capabilities/music)

---

## 2. Replicate.com - Model Marketplace

**Confidence:** MEDIUM-HIGH
**Status:** Production-ready platform, model quality varies
**Access:** REST API, pay-per-run

Replicate hosts open-source AI models with simple API access. You pay per prediction run, with pricing based on GPU time.

### Music Generation Models

| Model | Cost/Run | Description | Quality |
|-------|----------|-------------|---------|
| `meta/musicgen` | ~$0.044 | Meta's text-to-music, 32kHz, 4 codebooks | Production |
| `riffusion/riffusion` | ~$0.044 | Stable Diffusion for real-time music | Good/Experimental |
| `stability-ai/stable-audio-2.5` | ~$0.17 | Stability's latest, up to 3 min, 44.1kHz | Production |
| `stackadoc/stable-audio-open-1.0` | ~$0.17 | Open-source Stable Audio | Good |
| `pollinations/music-gen` | ~$0.04 | Community MusicGen variant | Good |

**MusicGen Details:**
- Trained on 20K hours of licensed music (internal + ShutterStock + Pond5)
- Supports text-to-music and melody conditioning
- Fine-tuning available for custom styles
- 32kHz output, mono

### Stem Separation Models

| Model | Cost/Run | Outputs | Quality |
|-------|----------|---------|---------|
| `cjwbw/demucs` | ~$0.016 | vocals, drums, bass, other | Production |
| `cjwbw/demucs` (htdemucs_ft) | ~$0.064 | Same, fine-tuned (4x slower) | Best |
| `cjwbw/demucs` (htdemucs_6s) | ~$0.016 | 6 stems (+piano, guitar) | Experimental |

**Demucs Variants Available:**
- `htdemucs`: Default Hybrid Transformer, trained on MusDB + 800 songs
- `htdemucs_ft`: Fine-tuned version, 4x slower but higher quality
- `htdemucs_6s`: 6-source version (piano source noted as weak)
- `hdemucs_mmi`: Hybrid Demucs v3
- `mdx`, `mdx_extra`: MusDB HQ trained models

### Speech & TTS Models

| Model | Cost/Run | Description | Quality |
|-------|----------|-------------|---------|
| `openai/whisper` | ~$0.01 | Speech-to-text, 57 languages | Production |
| `victor-upmeet/whisperx` | ~$0.01 | Whisper + timestamps + diarization | Production |
| `jaaari/kokoro-82m` | ~$0.01 | Lightweight TTS, 82M params, sub-0.3s | Good |
| `minimax/speech-02-turbo` | ~$0.02 | Low-latency TTS with voice cloning | Production |
| `minimax/speech-02-hd` | ~$0.03 | High-fidelity TTS, 40+ languages | Production |

### Audio Enhancement Models

| Model | Cost/Run | Description | Quality |
|-------|----------|-------------|---------|
| `lucataco/resemble-enhance` | ~$0.02 | Speech denoising + bandwidth extension to 44.1kHz | Good |

### Voice Cloning

| Model | Description |
|-------|-------------|
| `minimax/voice-cloning` | Voice clone from sample + TTS |
| Singing voice models | Clone & fine-tune singing voices |

### Key Replicate Advantages
- Pay-per-use, no subscriptions
- Open-source models you can also self-host
- Simple REST API with webhooks for async processing
- Model fine-tuning support (MusicGen)
- ~62 Demucs runs per $1 (very cost-effective for stem separation)

### Sources
- [Replicate Music Generation Collection](https://replicate.com/collections/ai-music-generation)
- [Demucs on Replicate](https://replicate.com/cjwbw/demucs)
- [MusicGen on Replicate](https://replicate.com/meta/musicgen)
- [Stable Audio 2.5 on Replicate](https://replicate.com/stability-ai/stable-audio-2.5)
- [Whisper on Replicate](https://replicate.com/openai/whisper)

---

## 3. Stability AI / Stable Audio

**Confidence:** MEDIUM (pricing details not fully verified)
**Status:** Production-ready, enterprise focus

### Stable Audio 2.5 Capabilities

| Feature | Details |
|---------|---------|
| Text-to-Audio | Full tracks up to 3 minutes from text prompts |
| Audio-to-Audio | Transform existing audio with text guidance |
| Audio Inpainting | Extend, reshape, or fill gaps in existing tracks |
| Output Quality | 44.1kHz stereo |
| Generation Speed | Up to 3-minute tracks in under 2 seconds |
| Watermarking | SynthID included |

### API Access Points

1. **Stability AI Platform API** (direct)
2. **Replicate** (~$0.17/run)
3. **fal.ai** (alternative host)
4. **ComfyUI** (node-based workflow)

### Pricing
- Direct API: Enterprise pricing, custom quotes
- Replicate: ~$0.17 per run
- Stability Platform: Pricing updated August 2025 (specific per-generation costs not publicly listed)

### Strengths
- Audio-to-audio transformation is unique capability
- Audio inpainting for editing existing tracks
- High-quality output (44.1kHz stereo)
- Very fast generation

### Weaknesses
- Enterprise pricing focus (expensive for small projects)
- No vocal generation
- Pricing transparency is poor

### Sources
- [Stable Audio 2.5 Announcement](https://stability.ai/news/stability-ai-introduces-stable-audio-25-the-first-audio-model-built-for-enterprise-sound-production-at-scale)
- [Stability AI Platform](https://platform.stability.ai/pricing)
- [Stable Audio on Replicate](https://replicate.com/stability-ai/stable-audio-2.5)

---

## 4. Google Lyria / Vertex AI

**Confidence:** HIGH (verified via official Google Cloud docs)
**Status:** Production-ready, GA on Vertex AI

### Lyria 2 Music Generation

| Feature | Details |
|---------|---------|
| Model | `lyria-002` |
| Output | 30-second WAV clips, 48kHz |
| Content | Instrumental only (no vocals) |
| Prompts | US English only |
| Watermarking | SynthID included |
| Safety | Content safety filters applied |

### API Details

**Endpoint:**
```
POST https://LOCATION-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/LOCATION/publishers/google/models/lyria-002:predict
```

**Request Parameters:**
- `prompt` (required): Text description of desired music
- `negative_prompt` (optional): What to exclude
- `seed` (optional): Deterministic output
- `sample_count` (optional): Number of samples (mutually exclusive with seed)

**Response:** Base64-encoded WAV in `predictions[].audioContent`

### Lyria RealTime

- Interactive music generation model
- Powers MusicFX DJ
- Available via API and AI Studio
- Real-time control over generative music

### Pricing

**$0.06 per 30 seconds of generated music**
(= $0.12/minute = $7.20/hour)

### Strengths
- Google Cloud infrastructure reliability
- SynthID watermarking for content authenticity
- Lyria RealTime for interactive music
- Clear, transparent pricing

### Weaknesses
- Instrumental only (no vocals)
- US English prompts only
- 30-second clip limit (short)
- Requires GCP project setup

### Sources
- [Lyria API Documentation](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/lyria-music-generation)
- [Lyria Overview](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/music/generate-music)
- [Vertex AI Pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)

---

## 5. AudioShake

**Confidence:** HIGH (verified via developer docs)
**Status:** Production-ready, professional-grade

### API Capabilities

AudioShake specializes in audio separation with three core services:

#### Instrument Stem Separation (1.0 credit/min)
| Stem Type | Available |
|-----------|-----------|
| Vocals (lead/backing) | Yes |
| Instrumental | Yes |
| Drums | Yes |
| Bass | Yes |
| Guitar (acoustic/electric) | Yes |
| Piano | Yes |
| Keys | Yes |
| Strings | Yes |
| Wind | Yes |
| Other/Residual | Yes |

High-quality variants for vocals and instrumental: 1.5 credits/min

#### Dialogue, Music & Effects Separation (1.5 credits/min)
- Dialogue isolation (speech from any other sound)
- Effects extraction (ambient/SFX without dialogue/music)
- Music & Effects (clean background stem)
- Music Detection (0.5 credits/min)
- Multi-Voice separation (contact for access)

#### Transcription & Alignment (1.0 credit/min)
- Speech-to-text transcription
- Word-level timestamp alignment
- Works with provided transcripts

### API Access
- REST API via `/task` route
- API Dashboard for account management
- SDK for real-time separation on edge devices
- JavaScript widget for embedded processing
- Max audio length: 3 hours (stems), 1 hour (transcription)
- Output formats: WAV, MP3, AAC, FLAC, AIFF, PCM up to 192kHz

### Pricing
- Credit-based system
- Pricing available upon inquiry
- Third-party sources suggest ~$19.99/month base
- Real-time SDK available separately

### Strengths
- Widest range of stem types (10+ instruments)
- Works on mono recordings (unique capability)
- Real-time SDK for live applications
- Professional film/TV quality
- Multi-speaker separation

### Weaknesses
- Pricing not transparent (contact sales)
- More expensive than Replicate/Demucs for basic separation
- Overkill for simple vocal/instrumental splits

### Sources
- [AudioShake Developer Portal](https://developer.audioshake.ai/)
- [AudioShake Models](https://developer.audioshake.ai/models)
- [AudioShake Features](https://www.audioshake.ai/features/ai-stem-separation)

---

## 6. LALAL.AI

**Confidence:** MEDIUM-HIGH
**Status:** Production-ready, consumer + API

### Stem Types Supported

| Stem | Pair Output |
|------|-------------|
| Vocals | Vocal + Instrumental |
| Drums | Drums + Drumless |
| Bass | Bass + Bassless |
| Guitar | Guitar + Guitarless |
| Synth | Synth + Synthless |
| Strings | Strings + Stringless |
| Wind | Wind + Windless |

### Additional Features
- Background noise removal
- Vocal plosive removal
- Mic rumble removal
- Echo & reverb removal
- Voice changing
- Voice cloning from custom recordings

### API Details
- **Type:** REST API with OpenAPI v1 specification
- **Docs:** https://www.lalal.ai/api/v1/docs/
- **OpenAPI Spec:** https://www.lalal.ai/api/v1/openapi.json
- **GitHub Examples:** https://github.com/OmniSaleGmbH/lalalai
- **Authentication:** Activation key from user profile
- **Queue:** API requests always use Fast Queue
- **Requirements:** Valid LALAL.AI license (Pro or Enterprise plan)

### Neural Network Models (2025-2026)
- **Orion**: Latest generation, set new quality benchmarks
- **Andromeda**: Released 2025, previous generation
- Quality consistently rated among the best in the industry

### Pricing (One-Time Purchases, Not Subscriptions)

| Plan | Price | Minutes | Per-Minute Cost |
|------|-------|---------|-----------------|
| Lite | $15 | 90 min | $0.167/min |
| Plus | $50 | 330 min | $0.152/min |
| Pro | $70 | 550 min | $0.127/min |
| Master (Business) | $100 | 750 min | $0.133/min |
| Premium (Business) | $190 | 3,000 min | $0.063/min |
| Enterprise (Business) | $300 | 5,000 min | $0.060/min |

**Important:** Minutes are deducted based on audio length x number of stem types selected.

### Strengths
- One-time purchase model (no recurring fees)
- Excellent separation quality (Orion/Andromeda networks)
- Simple REST API with OpenAPI spec
- Voice cloning + audio cleanup features
- VST plugin coming 2026

### Weaknesses
- API requires purchased license (no pure API-only plan)
- Limited to stem separation + audio cleanup (no generation)
- Minutes consumed per stem type selected (costs multiply)
- Enterprise pricing requires contacting sales

### Sources
- [LALAL.AI API](https://www.lalal.ai/api/)
- [LALAL.AI Pricing](https://www.lalal.ai/pricing/)
- [LALAL.AI GitHub Examples](https://github.com/OmniSaleGmbH/lalalai)

---

## 7. Moises.ai

**Confidence:** MEDIUM (API in beta, limited docs)
**Status:** Beta API, mature consumer product

### Developer API (Beta)

- **Type:** GraphQL API
- **Endpoint:** `POST https://api.moises.ai/graphql`
- **Operations:** Queries (fetch) and Mutations (modify)
- **Status:** BETA - frequent changes expected

### Core API Operations

| Operation | Description | Output Formats |
|-----------|-------------|----------------|
| SEPARATE_B | Flagship source separation | .m4a (compressed), .wav (hi-res) |

**Separation outputs:** Vocals, drums, bass, other

### Advanced Features (Consumer App)
- 5-stem separation (woodwind/brass for Premium/Pro)
- Drum parts separation (kick, snare, cymbals) - Pro only
- Technology licensed to Ableton Live 12.3
- 70M users as of 2025

### Workflow
1. Upload audio (signed URL or direct URL import)
2. Create task with operation + parameters
3. Poll status (STARTED, QUEUED, COMPLETED, FAILED)
4. Download processed files

### Pricing
- API pricing not publicly disclosed
- Consumer: Free tier, Premium, Pro plans
- Developer playground available at playground.moises.ai

### Strengths
- Technology proven at scale (Ableton partnership)
- Hi-fi separation quality
- Advanced drum parts separation

### Weaknesses
- API is in beta (unstable, subject to change)
- Limited operations available via API (mainly separation)
- Pricing opaque
- GraphQL adds complexity vs REST

### Sources
- [Moises Developer Platform](https://playground.moises.ai/)
- [Moises 2025 Year in Review](https://moises.ai/newsroom/company-milestones/2025-year-in-review/)

---

## 8. Fadr.com

**Confidence:** HIGH (verified via official docs)
**Status:** Production-ready API

### API Capabilities

| Feature | Details |
|---------|---------|
| Stem Separation | 5 primary stems: vocals, drums, bass, melodies, instrumental |
| Extended Stems | Up to 16 stems total (lead/backing vocals, guitar, piano, strings, wind, etc.) |
| MIDI Extraction | Auto-generated for vocals, drums, bass stems |
| Chord Detection | Chord progression as text + MIDI |
| Key Detection | Automatic key identification |
| Tempo Detection | Automatic BPM detection |

### API Architecture
- **Concepts:** Files (cloud storage), Assets (database docs), Tasks (processing jobs)
- **Upload:** Presigned URLs for file upload/download
- **Processing:** Async task-based (create task, poll status, download results)
- **Paid endpoint:** `Create Stem Task` only

### Pricing

| Item | Cost |
|------|------|
| Stem separation | $0.05 per minute of audio |
| Fadr Plus subscription (required) | $10/month or $100/year |
| Monthly API credit included | $10 |
| Billing threshold | Starts at $10, increases with usage |

**Example:** A 4-minute song costs $0.20 for full separation + MIDI + key/tempo/chords.

### What's Included Per Stem Task
- 5 primary stems (vocals, drums, bass, melodies, instrumental)
- MIDI files for vocals, drums, bass
- Chord progression MIDI
- Key and tempo detection
- All for one flat rate ($0.05/min)

### Strengths
- Extremely cost-effective ($0.05/min includes everything)
- MIDI extraction bundled (unique value)
- Key/tempo/chord detection included
- Up to 16 stem types available
- AI remix generation capability

### Weaknesses
- Requires Fadr Plus subscription for API access
- Smaller company, less enterprise infrastructure
- Documentation is basic
- Only stem separation via API (no generation)

### Sources
- [Fadr API Overview](https://fadr.com/docs/api)
- [Fadr API Billing](https://fadr.com/docs/api-billing)
- [Fadr API Stems Tutorial](https://fadr.com/docs/api-stems-tutorial)

---

## 9. Freesound.org

**Confidence:** HIGH (verified via official API docs)
**Status:** Production-ready, mature API (v2)

### API Overview

Freesound is a collaborative database of Creative Commons licensed sounds. The API provides comprehensive access to browse, search, and download from a massive library of user-uploaded sounds.

### Key Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /apiv2/search/` | API Key | Text-based sound search |
| `GET /apiv2/sounds/<id>/` | API Key | Sound details |
| `GET /apiv2/sounds/<id>/analysis/` | API Key | Audio descriptors & features |
| `GET /apiv2/sounds/<id>/similar/` | API Key | Find similar sounds |
| `GET /apiv2/sounds/<id>/download/` | OAuth2 | Download original file |
| `POST /apiv2/sounds/upload/` | OAuth2 | Upload sounds |
| `GET /apiv2/users/<username>/` | API Key | User profiles |
| `GET /apiv2/packs/<id>/` | API Key | Sound pack details |

### Search Capabilities
- **Text search:** Tags, names, descriptions, pack names
- **Operators:** Exclusion (`-term`), phrases (`"exact phrase"`)
- **Filters:** Duration, sample rate, bitrate, channels, tags, license, type
- **Numeric ranges:** `filter=duration:[0.1 TO 0.3]`
- **Geospatial search:** Point-based and rectangular area
- **Similarity search:** Sound-to-sound or vector-based
  - `laion_clap` (512 dimensions): Acoustic + semantic embeddings
  - `freesound_classic` (100 dimensions): Low-level acoustic features
- **Sorting:** Relevance, duration, date, downloads, rating

### Audio Analysis / Descriptors (100+ features extracted via Essentia)
- **Spectral:** Centroid, flatness, complexity, rolloff, entropy
- **Tonal:** Pitch, key detection, chord progression, tonality
- **Temporal:** Attack time, decay, duration
- **Perceptual:** Brightness, warmth, depth, hardness, roughness, sharpness
- **Rhythmic:** BPM, beat positions, onset times
- **Signal:** MFCC, HPCP, loudness, dynamic range

### Supported Upload Formats
WAV, AIFF, FLAC, OGG, MP3

### Pricing
- **Free for non-commercial use**
- Commercial license available (contact Freesound)
- API key required (free registration)
- OAuth2 for downloads and uploads

### Pagination
- Default: 15 results/page
- Maximum: 150 results/page

### Strengths
- Massive free sound library (500K+ sounds)
- Rich audio analysis data pre-computed
- Similarity search is powerful for finding related sounds
- Creative Commons licensing
- No per-request costs

### Weaknesses
- Quality varies (user-uploaded content)
- OAuth2 required for downloads
- Content-based search deprecated (Dec 2023)
- Rate limiting on free tier
- Not AI-generated (real recordings only)

### Sources
- [Freesound API Documentation](https://freesound.org/docs/api/)
- [Freesound API Resources v2](https://freesound.org/docs/api/resources_apiv2.html)
- [Freesound Developer Help](https://freesound.org/help/developers/)

---

## 10. Spotify Audio Analysis API

**Confidence:** HIGH
**Status:** DEPRECATED - No longer accessible for new applications

### Critical Update (November 2024)

Spotify **deprecated** its Audio Features and Audio Analysis endpoints in November 2024. Only apps with a pending quota extension before November 27, 2024 can continue using them. **New applications cannot access these endpoints.**

### What Was Available (Historical)
- **Audio Features:** Tempo (BPM), key, energy, danceability, valence, acousticness, instrumentalness, liveness, speechiness, loudness
- **Audio Analysis:** Detailed sections with tempo, key, mode, time signature, loudness; bar/beat/tatum timing; segment-level pitch and timbre

### Alternatives for Audio Feature Extraction
Since Spotify's endpoints are gone, consider:
1. **Essentia.js** (browser-based, free)
2. **Freesound API** (pre-computed descriptors for their library)
3. **Meyda** (browser-based, lightweight)
4. **Custom analysis** with Web Audio API + WASM models

### Sources
- [Spotify API Changes Blog Post](https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api)
- [Audio Analysis Deprecation Discussion](https://medium.com/@soundnet717/spotify-audio-analysis-has-been-deprecated-what-now-4808aadccfcb)

---

## 11. Browser-Based / WASM Options

**Confidence:** MEDIUM-HIGH
**Status:** Mature libraries, active development

### Tone.js

| Feature | Details |
|---------|---------|
| Purpose | Web Audio framework for interactive music in the browser |
| npm | `tone` |
| License | MIT |
| TypeScript | Supported |
| Test Coverage | ~100% |

**Key Capabilities:**
- Global transport for synchronizing/scheduling events
- Prebuilt synths (AMSynth, FMSynth, MonoSynth, PolySynth, etc.)
- Effects library (reverb, delay, chorus, distortion, EQ, compressor)
- Audio-rate signal control (sample-accurate)
- Time abstraction ("4n" = quarter note, "8t" = eighth triplet, "1m" = one measure)
- Sequencing and looping
- External audio input (WebRTC)
- Transport API for playback control

**Best for:** Building the DAW-like interface, playback engine, synthesizers, effects processing.

### Essentia.js

| Feature | Details |
|---------|---------|
| Purpose | Music/audio analysis powered by C++ via WASM |
| npm | `essentia.js` |
| Backend | Essentia C++ compiled to WebAssembly via Emscripten |
| ML Support | Pre-trained TensorFlow.js models included |
| Status | Under rapid development (APIs may change) |

**Key Capabilities:**
- Real-time AND offline audio analysis
- Pitch detection (pYIN)
- Beat detection / tempo estimation
- MFCC extraction
- Spectral features (centroid, flatness, rolloff)
- Key/scale detection
- Onset detection
- Chord recognition
- Genre/mood classification (via TF.js models)

**Performance:**
- Most algorithms: 1.5-6.8% of audio duration
- MFCC: up to 28.9% of audio duration
- pYIN pitch: up to 54.7% of audio duration (slowest)

**Best for:** Audio analysis, feature extraction, beat detection, key detection. Replaces need for Spotify Audio Analysis API.

### Meyda

| Feature | Details |
|---------|---------|
| Purpose | Lightweight audio feature extraction |
| npm | `meyda` (v5.6.3) |
| TypeScript | Via `@types/meyda` |
| Size | Very small |

**Key Capabilities:**
- Real-time and offline feature extraction
- Spectral features (centroid, flatness, flux, slope, rolloff, spread, skewness, kurtosis)
- MFCC extraction
- RMS energy
- Zero crossing rate
- Loudness (specific, total)
- Perceptual spread/sharpness
- Chromagram
- Power spectrum

**Best for:** Lightweight real-time visualization, simple audio analysis. Less comprehensive than Essentia.js but much smaller footprint.

### ONNX Runtime Web

| Feature | Details |
|---------|---------|
| Purpose | Run ML models in the browser |
| npm | `onnxruntime-web` |
| Backends | WebGL, WebGPU, WebNN (GPU) or WASM (CPU) |

**Audio-Relevant Capabilities:**
- Run Demucs v4 ONNX models for in-browser stem separation (GSoC 2025 project)
- Model quantization and sharding for efficient loading
- GPU detection with WASM fallback
- Multi-core parallelization

**Status for Audio:** The Demucs-to-ONNX conversion is an active research project (GSoC 2025). Not yet production-ready for browser-based stem separation, but promising for the future.

### Web Audio API + AudioWorklet + WASM

**Native browser capabilities:**
- `AudioWorklet`: Custom audio processing in a separate thread (low latency)
- WASM AudioWorklets: C/C++/Rust compiled to WASM for audio processing
- No GC pauses (zero JavaScript garbage in audio thread)
- Sample-accurate processing
- All modern browsers supported

**2025 Developments:**
- Rust + WASM audio effect libraries gaining traction
- Emscripten's Wasm Audio Worklets API mature and stable
- Pattern: WebGPU for ML inference, WASM for DSP, AudioWorklet for real-time

**Limitation:** `TextDecoder`/`TextEncoder` not available in AudioWorklet context (relevant for Rust WASM).

### Recommendation for Browser-Based Stack

```
Tone.js          -> Playback engine, synths, effects, transport
Essentia.js      -> Audio analysis (tempo, key, beats, features)
Meyda            -> Lightweight real-time visualization features
Web Audio API    -> Foundation for all audio processing
AudioWorklet     -> Custom DSP in separate thread
ONNX Runtime Web -> Future: in-browser ML models (when Demucs ONNX matures)
```

### Sources
- [Tone.js](https://tonejs.github.io/)
- [Essentia.js](https://mtg.github.io/essentia.js/)
- [Meyda](https://meyda.js.org/)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
- [AudioWorklet MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet)
- [Demucs to ONNX (GSoC 2025)](https://mixxx.org/news/2025-10-27-gsoc2025-demucs-to-onnx-dhunstack/)

---

## 12. Emerging Players

### Suno AI

**Confidence:** MEDIUM
**Status:** No official public API

- Consumer platform for full song generation with vocals
- Considered the best quality AI music generation (with vocals)
- **No official API** - only third-party wrappers exist
- Third-party API access: ~$0.144/call (CometAPI), ~$19/mo for ~50 songs (Apiframe)
- Consumer pricing: Pro $10/mo, Premier $30/mo (~$0.03-0.04/song)
- **Risk:** Third-party APIs are unofficial and could break

### Udio

**Confidence:** MEDIUM
**Status:** No official public API

- High-quality AI music generation with vocals
- Multiple model versions (v1.0, v1.5, v1.5 Allegro)
- **No official API** - only third-party/reverse-engineered wrappers
- Third-party providers: MusicAPI.ai, CometAPI, UdioWrapper (Python)
- **Risk:** Same as Suno - unofficial APIs

### Mubert

**Confidence:** MEDIUM-HIGH
**Status:** Official API available (API 3.0)

| Feature | Details |
|---------|---------|
| Music Generation | 200+ moods and themes |
| Streaming | Infinite music streams, sub-second latency |
| Library | 12,000+ pre-generated tracks |
| Track Length | Short loops to 25-minute mixes |
| Genres | 150+ |
| Licensing | Royalty-free, DMCA-free |

**Pricing:**
| Plan | Monthly | Best For |
|------|---------|----------|
| Free | $0 | Personal projects |
| Creator | $14 | Social media |
| Business | $199 | Film/TV/Enterprise |
| API/Enterprise | Custom | Integration |

**Strengths:** Official API, real-time streaming, massive genre variety, sub-licensing available.
**Weaknesses:** Quality below Suno/Udio for full songs, more suited for background/ambient music.

### ACE Studio

**Confidence:** LOW-MEDIUM
**Status:** Desktop app, no public API found

- AI music studio (macOS/Windows)
- 140+ AI Voice Models, 8 languages
- AI instruments and generative kits
- DAW integration
- Version 2.0 released December 2025
- Open-source model ACE-Step-1.5 available on GitHub
- **No public API for integration** - desktop app only

### AIVA

**Confidence:** MEDIUM
**Status:** No public developer API found

- Specializes in orchestral/cinematic music
- Trained on 30,000+ classical compositions
- MIDI export for DAW integration
- Own neural codec (OmniCodec) and transformer (Lyra)
- **Pricing:** Free (3 downloads/mo), Standard ($11/mo, AIVA owns copyright), Pro ($33/mo, you own copyright)
- **No dedicated developer API** - web interface + export only
- Good for: Film scores, game soundtracks, orchestral arrangements

### Soundraw

**Confidence:** MEDIUM
**Status:** API available for enterprise

- AI music generation with mood/genre/theme selection
- Real-time customization (tempo, instruments, sections)
- Royalty-free, copyright-safe
- **API available** with 6-month minimum commitment
- Used by Canva, Filmora, Captions
- Pricing: Creator $11.04/mo, Artist Starter $19.49/mo, Custom API plans
- Ultra-fast generation, unlimited downloads on API plan

### Boomy

**Confidence:** LOW
**Status:** Consumer only, no API

- Extremely simple song generation
- Distribution to streaming platforms (Spotify, Apple Music, TikTok)
- No developer API
- Best for: Quick, simple song creation for social media

### Amper Music / Shutterstock

**Confidence:** MEDIUM
**Status:** API available via Shutterstock

- Acquired by Shutterstock in 2020
- 100,000+ pre-generated tracks
- API for batch generation + customization
- Pricing: $5/track download, Pro $14.99/mo, Enterprise custom
- Genre, mood, instrumentation controls
- **Integration via Shutterstock API**

### Sources
- [Suno AI](https://suno.ai/)
- [Mubert API](https://landing.mubert.com/)
- [ACE Studio](https://acestudio.ai/)
- [AIVA](https://www.aiva.ai/)
- [Soundraw](https://soundraw.io/)
- [Soundraw API Blog](https://soundraw.io/blog/post/soundraw-api-ethical-ai-music-for-royalty-free-songs-at-scale)

---

## Comparison Matrix

### Music Generation Comparison

| Service | Quality | Vocals | Max Duration | Pricing | API Status | Latency |
|---------|---------|--------|--------------|---------|------------|---------|
| ElevenLabs Music | High | Yes | 5 min | Credits | Official | ~10-30s |
| Google Lyria 2 | High | No | 30 sec | $0.06/30s | Official | ~5-10s |
| Stable Audio 2.5 | High | No | 3 min | ~$0.17/run | Official | <2s |
| MusicGen (Replicate) | Good | No | ~30s | ~$0.044/run | Official | ~10-20s |
| Mubert | Medium | No | 25 min | $14-199/mo | Official | Sub-second |
| Soundraw | Medium | No | Varies | $11-20/mo | Enterprise | Fast |
| Suno | Excellent | Yes | ~3 min | Unofficial | Third-party | ~30-60s |
| Udio | Excellent | Yes | ~2 min | Unofficial | Third-party | ~30-60s |

### Stem Separation Comparison

| Service | Stem Types | Quality | Pricing | API Type | Real-Time |
|---------|-----------|---------|---------|----------|-----------|
| AudioShake | 10+ instruments | Best | Credits (opaque) | REST | SDK available |
| LALAL.AI | 7 types | Excellent | $0.06-0.17/min | REST | No |
| Fadr | 16 types + MIDI | Very Good | $0.05/min | REST | No |
| Demucs (Replicate) | 4-6 types | Very Good | ~$0.016/run | REST | No |
| Moises | 4-5+ types | Very Good | Opaque (beta) | GraphQL | No |
| ElevenLabs | Vocal isolation | Good | Credits | REST | No |

### Sound Effects / SFX Comparison

| Service | Quality | Duration | Pricing | Features |
|---------|---------|----------|---------|----------|
| ElevenLabs SFX | Excellent | 0.5-30s | Credits | Looping, prompt control |
| Freesound | Varies | Varies | Free | 500K+ real recordings |
| Stable Audio 2.5 | High | Up to 3 min | ~$0.17/run | Also does music |

### TTS / Voice Comparison

| Service | Quality | Cloning | Languages | Pricing |
|---------|---------|---------|-----------|---------|
| ElevenLabs | Best | IVC + PVC | 30+ | Credits |
| Replicate (Minimax) | Very Good | Yes | 40+ | ~$0.02-0.03/run |
| Replicate (Kokoro) | Good | No | 5 | ~$0.01/run |

### Audio Analysis Comparison

| Tool | Type | Cost | Features | Real-Time |
|------|------|------|----------|-----------|
| Essentia.js | Browser WASM | Free | 100+ features, ML models | Yes |
| Meyda | Browser JS | Free | ~20 features | Yes |
| Freesound API | Server | Free | 100+ descriptors | No (pre-computed) |
| Spotify | DEPRECATED | N/A | N/A | N/A |

---

## Recommendations for This Project

Given the existing Sound Lab module architecture and the storytelling app context:

### Tier 1: Deepen Existing (ElevenLabs)

The Sound Lab already integrates ElevenLabs. Maximize this investment:

1. **Music Generation** - Use Eleven Music API for narrative soundtracks
   - Composition plans for structured multi-section scores
   - Force instrumental for background music
   - Full vocal songs for musical narrative moments

2. **Sound Effects** - Already integrated, expand prompt library
   - Build SFX prompt templates for common story scenarios (battle, nature, urban, etc.)
   - Use looping for ambient backgrounds

3. **Voice Cloning** - Character voice creation
   - Design voices for characters via text description
   - Clone reference voices for consistent character audio

4. **Speech-to-Text** - Scribe for transcription features
   - Transcribe recorded narration
   - Word-level alignment for subtitle/caption generation

### Tier 2: Add Specialized Services

5. **Replicate Demucs** ($0.016/run) - Cost-effective stem separation
   - Use htdemucs_ft for highest quality when needed
   - 62 runs per dollar makes it ideal for experimentation

6. **Freesound.org API** (Free) - Sample/sound sourcing
   - Similarity search for finding related sounds
   - Pre-computed audio descriptors
   - Creative Commons library integration

7. **Fadr API** ($0.05/min) - When you need MIDI extraction + stems
   - Best value: stems + MIDI + key/tempo/chords in one call
   - 16-stem types for detailed separation

### Tier 3: Browser-Based Enhancement

8. **Tone.js** - Upgrade audio engine
   - Replace or augment current Web Audio API usage
   - Transport system for timeline playback
   - Built-in synths and effects

9. **Essentia.js** - Audio analysis in browser
   - Replace need for server-side analysis
   - Key/tempo/beat detection
   - Real-time feature extraction for visualizations

### Services to SKIP for This Project

| Service | Reason to Skip |
|---------|---------------|
| Google Lyria | 30-second limit too short, instrumental only, GCP complexity |
| Stable Audio 2.5 | ElevenLabs covers music generation better (vocals + longer) |
| AudioShake | Overkill pricing for this use case |
| LALAL.AI | Replicate Demucs is cheaper and equally good |
| Moises.ai | Beta API, opaque pricing, GraphQL complexity |
| Suno/Udio | No official API - risky to depend on |
| ACE Studio | No API |
| AIVA | No API |
| Boomy | No API |
| Spotify Analysis | Deprecated |

### Architecture Recommendation

```
                    +-------------------+
                    |   Next.js App     |
                    |   (Sound Lab)     |
                    +-------------------+
                           |
              +------------+------------+
              |            |            |
    +---------+--+  +------+------+  +--+---------+
    | ElevenLabs |  |  Replicate  |  | Freesound  |
    | (Primary)  |  | (Specialty) |  | (Sourcing) |
    +------------+  +-------------+  +------------+
    | TTS        |  | Demucs      |  | Search     |
    | SFX        |  | (Stems)     |  | Download   |
    | Music      |  | Whisper     |  | Analysis   |
    | Cloning    |  | (STT)       |  | Similarity |
    | Isolation  |  | Enhancement |  +------------+
    | STT        |  +-------------+
    +------------+
              |
    +---------+---------+
    | Browser (Client)  |
    +-------------------+
    | Tone.js (Engine)  |
    | Essentia.js       |
    | (Analysis)        |
    | Meyda             |
    | (Visualization)   |
    | Web Audio API     |
    | AudioWorklet+WASM |
    +-------------------+
```

### Cost Estimation (Monthly, Moderate Usage)

| Service | Estimated Cost | Usage Assumption |
|---------|---------------|------------------|
| ElevenLabs Pro | $99/mo | 500K chars TTS + SFX + Music |
| Replicate | ~$5-10/mo | ~300 Demucs runs + misc |
| Freesound | $0 | Free tier |
| Fadr Plus | $10/mo | When MIDI extraction needed |
| **Total** | **~$115-120/mo** | Moderate production use |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| ElevenLabs | HIGH | Verified via official docs, already integrated |
| Replicate | MEDIUM-HIGH | Models verified, pricing approximate (pay-per-use varies) |
| Stable Audio | MEDIUM | Capabilities verified, pricing partially opaque |
| Google Lyria | HIGH | Verified via official GCP docs |
| AudioShake | HIGH | Official developer docs verified |
| LALAL.AI | MEDIUM-HIGH | Pricing verified, API docs reference-only |
| Moises | MEDIUM | API in beta, limited documentation |
| Fadr | HIGH | Official docs verified, pricing clear |
| Freesound | HIGH | Official API docs comprehensive |
| Spotify | HIGH | Confirmed deprecated |
| Browser/WASM | MEDIUM-HIGH | Libraries verified, ONNX audio still experimental |
| Emerging Players | LOW-MEDIUM | Most lack official APIs, third-party info |

## Gaps to Address

- **AudioShake credit pricing:** Exact dollar-per-credit cost not publicly available
- **Moises API pricing:** Completely opaque, beta status adds risk
- **Stable Audio direct API pricing:** Enterprise-focused, unclear per-generation cost
- **ElevenLabs Music credit cost:** Exact credit-per-generation ratio not documented clearly
- **Replicate GPU pricing fluctuations:** Costs vary by model load and GPU type
- **ONNX browser stem separation:** GSoC 2025 project status and production readiness unclear
