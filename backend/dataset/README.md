# TRUSTFUSE — Dataset Module

> **AI-Based Investor Fraud & Impersonation Detection**  
> Dual-source dataset management for deepfake detection

---

## Overview

This module handles **all dataset concerns** for the TRUSTFUSE deepfake
detection pipeline. It is a **standalone, lightweight Python package** that:

- Loads and normalises labelled video metadata from two dataset sources
- Validates dataset folder structure and data integrity
- Creates balanced hackathon-sized samples
- Returns clean, standardised records ready for the ML inference pipeline

**Supported datasets:**

| Dataset | Format | Labels |
|---------|--------|--------|
| [DFDC — Deepfake Detection Challenge](https://www.kaggle.com/c/deepfake-detection-challenge) | `.mp4` + `metadata.json` | `REAL` / `FAKE` |
| [FaceForensics++](https://github.com/ondyari/FaceForensics) | `.mp4` in `original/` & `manipulated/` | `REAL` / `FAKE` |

**Label normalisation:**

| Raw label | Internal ground truth |
|-----------|-----------------------|
| `REAL`, `ORIGINAL` | `REAL` |
| `FAKE`, `DEEPFAKE`, `MANIPULATED`, `ALTERED` | `DEEPFAKE` |

**This module does NOT:**
- Train or run any ML model
- Connect to any database
- Expose API routes
- Contain frontend code

---

## Folder Structure

```
dataset/
│
├── dfdc_sample/                          ← DFDC dataset files
│   ├── videos/
│   │   └── .gitkeep
│   ├── metadata/
│   │   └── .gitkeep
│   └── README.md                         ← DFDC download instructions
│
├── faceforensics_sample/                 ← FaceForensics++ dataset files
│   ├── videos/
│   │   ├── original/                     ← REAL videos
│   │   │   └── .gitkeep
│   │   └── manipulated/                  ← FAKE videos (flat or sub-folders)
│   │       └── .gitkeep
│   ├── masks/                            ← optional binary masks
│   │   └── .gitkeep
│   ├── metadata/
│   │   └── .gitkeep
│   └── README.md                         ← FF++ download instructions
│
├── config.py                             ← Unified configuration (reads .env)
├── dfdc_loader.py                        ← DFDC-specific loader
├── dfdc_validator.py                     ← DFDC-specific validator
├── ff_loader.py                          ← FaceForensics++-specific loader
├── ff_validator.py                       ← FaceForensics++-specific validator
├── dataset_loader.py                     ← UNIFIED loader (DFDC + FF++)
├── dataset_validator.py                  ← UNIFIED validator
├── dataset_sampler.py                    ← UNIFIED sampler (balanced subset)
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md                             ← This file
```

---

## Installation

```bash
pip install -r requirements.txt
```

Only `python-dotenv` is required. All other utilities are part of the Python
standard library.

---

## Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your local paths:

```dotenv
# ─── DFDC ────────────────────────────────────────────────────
DATASET_PATH=./dfdc_sample
VIDEO_PATH=./dfdc_sample/videos
METADATA_PATH=./dfdc_sample/metadata/metadata.json
MAX_REAL_VIDEOS=50
MAX_FAKE_VIDEOS=50

# ─── FaceForensics++ ─────────────────────────────────────────
FF_DATASET_PATH=./faceforensics_sample
FF_ORIGINAL_VIDEO_PATH=./faceforensics_sample/videos/original
FF_MANIPULATED_VIDEO_PATH=./faceforensics_sample/videos/manipulated
FF_MASKS_PATH=./faceforensics_sample/masks
FF_METADATA_PATH=./faceforensics_sample/metadata/metadata.json
FF_MAX_REAL_VIDEOS=50
FF_MAX_FAKE_VIDEOS=50

# ─── Shared ──────────────────────────────────────────────────
RANDOM_SEED=42
```

> **Never commit `.env`** — it is already in `.gitignore`.

---

## Dataset 1: DFDC — Deepfake Detection Challenge

### Download

1. Create a Kaggle account at https://www.kaggle.com
2. Join the competition at https://www.kaggle.com/c/deepfake-detection-challenge
3. Accept the competition rules
4. Download **Part 0** (`dfdc_train_part_0.tar.gz`)
5. Extract `.mp4` files → `dfdc_sample/videos/`
6. Copy `metadata.json` → `dfdc_sample/metadata/metadata.json`

### Expected metadata.json format

```json
{
  "aagfhgtpmv.mp4": {
    "label": "FAKE",
    "original": "vudstoyrfk.mp4",
    "split": "train"
  },
  "vudstoyrfk.mp4": {
    "label": "REAL",
    "original": null,
    "split": "train"
  }
}
```

### Validate DFDC

```bash
python dfdc_validator.py
```

---

## Dataset 2: FaceForensics++

### Download

1. Go to https://github.com/ondyari/FaceForensics
2. Fill in the access request form (Google Form linked in the repo)
3. After approval, use the provided download script

For hackathon use, request only the **c23 (compressed)** version.

### Place files

- REAL videos → `faceforensics_sample/videos/original/`
- FAKE videos → `faceforensics_sample/videos/manipulated/`  
  _(sub-folders per method are supported, e.g. `manipulated/Deepfakes/`)_
- Masks (optional) → `faceforensics_sample/masks/`

See [`faceforensics_sample/README.md`](faceforensics_sample/README.md) for full steps.

### Validate FF++

```bash
python ff_validator.py
```

---

## Validating All Datasets at Once

```bash
python dataset_validator.py
```

Validate a specific source:

```bash
python dataset_validator.py --source DFDC
python dataset_validator.py --source FF
```

Strict mode (exit code 1 if any file missing):

```bash
python dataset_validator.py --strict
```

Example combined output:

```
============================================================
  DFDC Validation Report  [✔ VALID]
============================================================
  ...
  Total records  : 100  |  REAL: 50  |  DEEPFAKE: 50  |  Missing: 0
============================================================

============================================================
  FaceForensics++ Validation Report  [✔ VALID]
============================================================
  ...
  Total records  : 80  |  REAL: 40  |  DEEPFAKE: 40  |  Missing: 0
============================================================

============================================================
  COMBINED DATASET SUMMARY  [✔ ALL VALID]
============================================================
  Sources checked : DFDC, FF
  Total records   : 180
  REAL            : 90
  DEEPFAKE        : 90
  Missing files   : 0
============================================================
```

---

## Loading Dataset Records

### Unified loader (both sources)

```bash
python dataset_loader.py
python dataset_loader.py --source DFDC   --filter REAL     --max 10
python dataset_loader.py --source FF     --filter DEEPFAKE --max 10 --shuffle
python dataset_loader.py --source ALL    --filter ALL
```

### Programmatic usage

```python
from dataset_loader import DatasetLoader

# Load from both sources
loader = DatasetLoader(source="ALL")
records = loader.load(filter_label="ALL", max_records=50, shuffle=True)

# Load only from DFDC
dfdc_loader = DatasetLoader(source="DFDC")
real_records = dfdc_loader.load_real(max_records=20)

# Load only from FF++
ff_loader = DatasetLoader(source="FF")
fakes = ff_loader.load_deepfake()
```

### Standard record format (ready for backend/ml/)

```python
{
    "filename":             "aagfhgtpmv.mp4",
    "video_path":           "/abs/path/to/dfdc_sample/videos/aagfhgtpmv.mp4",
    "ground_truth":         "DEEPFAKE",
    "original_filename":    "vudstoyrfk.mp4",
    "split":                "train",
    "manipulation_method":  None,               # FF++ only (e.g. "Deepfakes")
    "mask_path":            None,               # FF++ only
    "file_exists":          True,
    "dataset_source":       "DFDC"              # or "FaceForensics++"
}
```

---

## Creating a Balanced Sample

```bash
# 20 REAL + 20 DEEPFAKE from all sources
python dataset_sampler.py --max-real 20 --max-fake 20

# 10 REAL + 10 DEEPFAKE from DFDC only
python dataset_sampler.py --source DFDC --max-real 10 --max-fake 10

# From FF++ only, skip missing files
python dataset_sampler.py --source FF --only-existing

# Preview without saving
python dataset_sampler.py --no-save
```

Produces `sample_manifest.json`:

```json
[
  {
    "filename": "video1.mp4",
    "ground_truth": "REAL",
    "video_path": "/path/to/video1.mp4",
    "original_filename": null,
    "split": "train",
    "manipulation_method": null,
    "mask_path": null,
    "file_exists": true,
    "dataset_source": "DFDC"
  },
  {
    "filename": "000.mp4",
    "ground_truth": "DEEPFAKE",
    "video_path": "/path/to/manipulated/Deepfakes/000.mp4",
    "original_filename": null,
    "split": null,
    "manipulation_method": "Deepfakes",
    "mask_path": null,
    "file_exists": true,
    "dataset_source": "FaceForensics++"
  }
]
```

---

## Source-Specific CLI Commands

```bash
# DFDC only
python dfdc_loader.py    [--filter ALL|REAL|DEEPFAKE] [--max N] [--shuffle]
python dfdc_validator.py [--strict]

# FaceForensics++ only
python ff_loader.py      [--filter ALL|REAL|DEEPFAKE] [--max N] [--shuffle]
python ff_validator.py   [--strict]

# Both (unified)
python dataset_loader.py    --source ALL|DFDC|FF [--filter ...] [--max N]
python dataset_validator.py --source ALL|DFDC|FF [--strict]
python dataset_sampler.py   --source ALL|DFDC|FF [--max-real N] [--max-fake N]
```

---

## Files That Must NOT Be Pushed to Git

| Excluded | Reason |
|----------|--------|
| `*.mp4`, `*.avi`, `*.mov`, `*.mkv` | Large video files |
| `*.tar.gz`, `*.zip` | Dataset archives |
| `.env` | Local paths / secrets |
| `__pycache__/`, `*.pyc` | Python bytecode |

**Safe to commit:**
- All `.py` source files
- All `README.md` files
- `.env.example`
- `.gitignore`
- `requirements.txt`
- `.gitkeep` placeholder files
- `sample_manifest.json` *(optional — lightweight JSON, no binary)*

### Root project .gitignore tip

When copying this into `TRUSTFUSE/backend/dataset/`, add these lines to the
**root** `.gitignore`:

```gitignore
backend/dataset/dfdc_sample/videos/*
!backend/dataset/dfdc_sample/videos/.gitkeep
backend/dataset/faceforensics_sample/videos/original/*
!backend/dataset/faceforensics_sample/videos/original/.gitkeep
backend/dataset/faceforensics_sample/videos/manipulated/*
!backend/dataset/faceforensics_sample/videos/manipulated/.gitkeep
backend/dataset/faceforensics_sample/masks/*
!backend/dataset/faceforensics_sample/masks/.gitkeep
```

---

## Integration with Future TRUSTFUSE Backend Modules

```
backend/dataset/          ← THIS MODULE
    │
    │  Returns: video_path + ground_truth + metadata
    ▼
backend/ml/               ← Deepfake inference model (future)
    │
    │  Returns: REAL / DEEPFAKE + confidence score
    ▼
backend/services/         ← Risk calculation engine (future)
    │
    │  Returns: fraud risk score + alert flags
    ▼
backend/database/         ← Persistent storage (future)
    │
    ▼
frontend/                 ← Dashboard (future)
```

The ML module will consume records like this:

```python
from dataset_loader import DatasetLoader

loader = DatasetLoader(source="ALL")
for record in loader.load(filter_label="ALL"):
    video_path   = record["video_path"]      # → feed to cv2.VideoCapture()
    ground_truth = record["ground_truth"]    # → compare with model prediction
    source       = record["dataset_source"]  # → "DFDC" or "FaceForensics++"
```

---

## Error Handling

| Situation | Error message |
|-----------|---------------|
| Dataset folder missing | `ERROR: Dataset root not found: …` |
| metadata.json missing (DFDC) | `ERROR: metadata.json not found. Expected: …` |
| Invalid JSON | `ERROR: metadata.json is not valid JSON — …` |
| Unsupported label | `WARNING: Unsupported label "XYZ" — skipped.` |
| Missing video file | `WARNING: Video not found on disk: "…"` |
| Empty dataset | `ERROR: No valid records found.` |

Missing individual files are **warnings**, not fatal errors,
so a partially populated dataset can still be used for testing.

---

## License

This dataset module is part of the TRUSTFUSE hackathon project.

- DFDC dataset: [Kaggle DFDC competition rules](https://www.kaggle.com/c/deepfake-detection-challenge/rules)
- FaceForensics++: [FF++ access request form and terms](https://github.com/ondyari/FaceForensics)
