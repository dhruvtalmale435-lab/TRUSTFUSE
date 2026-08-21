# DFDC Sample Dataset

This directory holds the DFDC (Deepfake Detection Challenge) sample data used
by the TRUSTFUSE dataset module.

## Structure

```
dfdc_sample/
├── videos/          ← Place downloaded .mp4 files here
│   └── .gitkeep
│
├── metadata/        ← Place metadata.json here
│   └── .gitkeep
│
└── README.md        ← This file
```

## How to populate this folder

### 1. Download the DFDC sample dataset

The DFDC dataset is hosted on Kaggle. You can access the sample (Part 0) here:

- URL: https://www.kaggle.com/c/deepfake-detection-challenge/data

> You need a Kaggle account and must accept the competition rules.

### 2. Extract videos

After downloading, extract the `.mp4` video files into:

```
dfdc_sample/videos/
```

For example:

```
dfdc_sample/videos/
├── aagfhgtpmv.mp4
├── abarnvbtwb.mp4
├── ...
```

### 3. Place metadata.json

DFDC packages include a `metadata.json` file at the root of each part folder.
Copy it to:

```
dfdc_sample/metadata/metadata.json
```

### 4. Expected metadata.json format

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

## What NOT to push to Git

- `*.mp4` files (already in `.gitignore`)
- Any other video formats

Only code, manifests, and placeholder `.gitkeep` files should be committed.
