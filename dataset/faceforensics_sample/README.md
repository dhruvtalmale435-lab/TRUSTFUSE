# FaceForensics++ Sample Dataset

This directory holds the FaceForensics++ (FF++) data used by the TRUSTFUSE
dataset module.

---

## STEP 1 — Download FaceForensics++

FaceForensics++ is hosted on GitHub and requires requesting access.

**Official repository:**  
https://github.com/ondyari/FaceForensics

**Request access form:**  
https://docs.google.com/forms/d/e/1FAIpQLSdRRR3L5zAv6tQ_CKxmK4W96tAab_pfBu2EKAgQbeDVhmXagg/viewform

After your access is approved you will receive download scripts.

> **Tip for hackathon use:** Request only the **compressed (c23)** version
> and only Part 0 or a small subset to keep download size manageable.

---

## STEP 2 — Place REAL (original) videos

Extract the original (untampered) videos into:

```
faceforensics_sample/videos/original/
```

Example:

```
faceforensics_sample/videos/original/
├── 000.mp4
├── 001.mp4
├── 002.mp4
└── ...
```

---

## STEP 3 — Place FAKE (manipulated) videos

Extract the manipulated videos into:

```
faceforensics_sample/videos/manipulated/
```

You can place all files flat OR keep per-method sub-folders:

```
faceforensics_sample/videos/manipulated/
├── Deepfakes/
│   ├── 000.mp4
│   └── ...
├── Face2Face/
│   └── ...
├── FaceSwap/
│   └── ...
└── NeuralTextures/
    └── ...
```

The loader handles both flat and sub-folder layouts automatically.

---

## STEP 4 — (Optional) Place binary masks

If you downloaded the face masks, place them in:

```
faceforensics_sample/masks/
├── 000.mp4
└── ...
```

Masks are optional. The loader will work without them.

---

## STEP 5 — (Optional) Create metadata.json

If you want metadata-driven loading instead of folder-scan mode,
create a `metadata.json` file at:

```
faceforensics_sample/metadata/metadata.json
```

### Supported format A (object keyed by filename):

```json
{
  "000.mp4": {
    "label": "REAL",
    "split": "train",
    "manipulation_method": null
  },
  "001.mp4": {
    "label": "FAKE",
    "split": "train",
    "manipulation_method": "Deepfakes",
    "original": "000.mp4"
  }
}
```

### Supported format B (list of objects):

```json
[
  { "filename": "000.mp4", "label": "REAL",  "split": "train" },
  { "filename": "001.mp4", "label": "FAKE",  "split": "train", "manipulation_method": "Deepfakes" }
]
```

**Supported labels:**  `REAL`, `ORIGINAL`, `FAKE`, `DEEPFAKE`, `MANIPULATED`, `ALTERED`

---

## STEP 6 — Validate

```bash
python ff_validator.py
# or validate all datasets at once:
python dataset_validator.py --source FF
```

---

## Expected Final Structure

```
faceforensics_sample/
│
├── videos/
│   ├── original/            ← REAL .mp4 files
│   │   ├── 000.mp4
│   │   └── .gitkeep
│   │
│   └── manipulated/         ← FAKE .mp4 files (flat or sub-folders)
│       ├── Deepfakes/
│       │   └── 000.mp4
│       └── .gitkeep
│
├── masks/                   ← optional binary masks
│   └── .gitkeep
│
├── metadata/
│   ├── metadata.json        ← optional manifest (place here)
│   └── .gitkeep
│
└── README.md                ← this file
```

---

## What NOT to push to Git

- `*.mp4` files (already excluded by `.gitignore`)
- Any downloaded archive files

Only code, `.gitkeep`, and optional `metadata.json` should be committed.
