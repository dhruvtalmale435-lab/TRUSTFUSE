"""
ff_loader.py — TRUSTFUSE Dataset Module
========================================
FaceForensics++ (FF++) dataset loader.

FF++ dataset structure (what this loader expects):

faceforensics_sample/
├── videos/
│   ├── original/          ← REAL videos (.mp4)
│   └── manipulated/       ← FAKE/DEEPFAKE videos (.mp4)
│       ├── (all methods mixed, OR sub-folders per method)
├── masks/                 ← optional binary masks
└── metadata/
    └── metadata.json      ← optional lightweight manifest

If metadata.json exists, it is used.
If it does NOT exist, the loader scans the folder structure directly
(original/ → REAL, manipulated/ → DEEPFAKE).

Standard output record format (compatible with backend/ml/):
{
    "filename":             "001.mp4",
    "video_path":           "/abs/path/to/001.mp4",
    "ground_truth":         "REAL" | "DEEPFAKE",
    "original_filename":    null,
    "split":                "train" | null,
    "manipulation_method":  "Deepfakes" | null,
    "mask_path":            "/abs/path/to/mask.mp4" | null,
    "file_exists":          true | false,
    "dataset_source":       "FaceForensics++"
}

Usage (programmatic):
    from ff_loader import FFLoader
    loader = FFLoader()
    records = loader.load(filter_label="ALL", max_records=20)

Usage (CLI):
    python ff_loader.py
    python ff_loader.py --filter DEEPFAKE --max 10 --shuffle
"""

import json
import random
import argparse
import sys
from pathlib import Path
from typing import List, Optional

from config import config


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _err(msg: str) -> None:
    """Print a user-friendly error and exit."""
    print(f"\nERROR: {msg}\n", file=sys.stderr)
    sys.exit(1)


def _warn(msg: str) -> None:
    print(f"WARNING: {msg}", file=sys.stderr)


# Recognised video file extensions
_VIDEO_EXTS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}


# ---------------------------------------------------------------------------
# FFLoader
# ---------------------------------------------------------------------------
class FFLoader:
    """
    Loads FaceForensics++ dataset records.

    Two modes:
    1. Metadata-driven — reads metadata.json (preferred when it exists).
    2. Folder-scan mode — scans original/ and manipulated/ automatically.

    Parameters
    ----------
    dataset_path : Path, optional
        Root of the faceforensics_sample folder.
    metadata_path : Path, optional
        Path to metadata.json (None → use folder-scan mode).
    """

    def __init__(
        self,
        dataset_path: Optional[Path] = None,
        metadata_path: Optional[Path] = None,
    ) -> None:
        self.dataset_path: Path = Path(dataset_path or config.FF.DATASET_PATH)
        self.original_path: Path = config.FF.ORIGINAL_VIDEO_PATH
        self.manipulated_path: Path = config.FF.MANIPULATED_VIDEO_PATH
        self.masks_path: Path = config.FF.MASKS_PATH
        self.metadata_path: Path = Path(metadata_path or config.FF.METADATA_PATH)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def load(
        self,
        filter_label: str = "ALL",
        max_records: Optional[int] = None,
        shuffle: bool = False,
        seed: Optional[int] = None,
    ) -> List[dict]:
        """
        Load FF++ dataset records.

        Parameters
        ----------
        filter_label : str
            One of "ALL", "REAL", "DEEPFAKE".
        max_records : int, optional
            Maximum number of records to return.
        shuffle : bool
            Randomly shuffle before slicing.
        seed : int, optional
            RNG seed (defaults to config.RANDOM_SEED).

        Returns
        -------
        list[dict]
        """
        filter_label = filter_label.upper()
        if filter_label not in ("ALL", "REAL", "DEEPFAKE"):
            _err(f'Invalid filter_label "{filter_label}". Choose: ALL, REAL, DEEPFAKE')

        # Choose loading strategy
        if self.metadata_path.exists():
            records = self._load_from_metadata()
        else:
            records = self._load_from_folders()

        # Filter
        if filter_label != "ALL":
            records = [r for r in records if r["ground_truth"] == filter_label]

        # Shuffle
        if shuffle:
            rng = random.Random(seed if seed is not None else config.RANDOM_SEED)
            rng.shuffle(records)

        # Limit
        if max_records is not None:
            records = records[:max_records]

        return records

    def load_real(self, max_records: Optional[int] = None, shuffle: bool = False) -> List[dict]:
        return self.load("REAL", max_records=max_records, shuffle=shuffle)

    def load_deepfake(self, max_records: Optional[int] = None, shuffle: bool = False) -> List[dict]:
        return self.load("DEEPFAKE", max_records=max_records, shuffle=shuffle)

    # ------------------------------------------------------------------
    # Strategy 1: Metadata-driven
    # ------------------------------------------------------------------

    def _load_from_metadata(self) -> List[dict]:
        """
        Parse metadata.json.

        Supported formats:
        A) FF++-style per-video object keyed by filename:
           {
               "001.mp4": {"label": "REAL", "split": "train", ...},
               ...
           }
        B) Simple list of objects:
           [{"filename": "001.mp4", "label": "FAKE", ...}, ...]
        """
        try:
            with open(self.metadata_path, "r", encoding="utf-8") as f:
                raw = json.load(f)
        except json.JSONDecodeError as exc:
            _err(f"metadata.json is not valid JSON.\nFile: {self.metadata_path}\n{exc}")

        records: List[dict] = []

        if isinstance(raw, dict):
            # Format A: {filename: {label, ...}}
            for filename, entry in raw.items():
                rec = self._build_record_from_entry(filename, entry)
                if rec:
                    records.append(rec)

        elif isinstance(raw, list):
            # Format B: [{filename, label, ...}, ...]
            for entry in raw:
                if not isinstance(entry, dict):
                    _warn(f"Skipping malformed list entry: {entry}")
                    continue
                filename = entry.get("filename", "")
                if not filename:
                    _warn("Skipping entry with missing filename.")
                    continue
                rec = self._build_record_from_entry(filename, entry)
                if rec:
                    records.append(rec)
        else:
            _err("metadata.json must be a JSON object or a JSON array.")

        return records

    def _build_record_from_entry(self, filename: str, entry: dict) -> Optional[dict]:
        """Build one standardised record from a metadata entry."""
        if not isinstance(entry, dict):
            _warn(f'Skipping malformed entry for "{filename}".')
            return None

        raw_label = str(entry.get("label", "")).upper()
        if raw_label not in config.SUPPORTED_RAW_LABELS:
            _warn(f'Skipping "{filename}" — unsupported label "{raw_label}".')
            return None

        ground_truth = config.LABEL_MAP[raw_label]

        # Determine video path based on label
        if ground_truth == "REAL":
            video_file = self.original_path / filename
        else:
            video_file = self.manipulated_path / filename

        # Optional mask
        mask_file = self.masks_path / filename
        mask_path = str(mask_file) if mask_file.exists() else None

        return {
            "filename": filename,
            "video_path": str(video_file),
            "ground_truth": ground_truth,
            "original_filename": entry.get("original") or None,
            "split": entry.get("split") or None,
            "manipulation_method": entry.get("manipulation_method") or None,
            "mask_path": mask_path,
            "file_exists": video_file.exists(),
            "dataset_source": config.FF.DATASET_SOURCE,
        }

    # ------------------------------------------------------------------
    # Strategy 2: Folder scan (no metadata.json)
    # ------------------------------------------------------------------

    def _load_from_folders(self) -> List[dict]:
        """
        Auto-discover videos by scanning original/ and manipulated/ folders.
        Falls back gracefully when folders don't exist yet.
        """
        records: List[dict] = []

        # REAL videos from original/
        if self.original_path.exists():
            for video_file in sorted(self.original_path.iterdir()):
                if video_file.suffix.lower() in _VIDEO_EXTS:
                    # Check for an optional mask
                    mask_file = self.masks_path / video_file.name
                    records.append(
                        {
                            "filename": video_file.name,
                            "video_path": str(video_file),
                            "ground_truth": "REAL",
                            "original_filename": None,
                            "split": None,
                            "manipulation_method": None,
                            "mask_path": str(mask_file) if mask_file.exists() else None,
                            "file_exists": True,
                            "dataset_source": config.FF.DATASET_SOURCE,
                        }
                    )
        else:
            _warn(f"original/ folder not found: {self.original_path}")

        # DEEPFAKE videos from manipulated/ (or its sub-folders)
        if self.manipulated_path.exists():
            for item in sorted(self.manipulated_path.iterdir()):
                if item.is_dir():
                    # Sub-folders named by manipulation method
                    method = item.name
                    for video_file in sorted(item.iterdir()):
                        if video_file.suffix.lower() in _VIDEO_EXTS:
                            mask_file = self.masks_path / video_file.name
                            records.append(
                                {
                                    "filename": video_file.name,
                                    "video_path": str(video_file),
                                    "ground_truth": "DEEPFAKE",
                                    "original_filename": None,
                                    "split": None,
                                    "manipulation_method": method,
                                    "mask_path": str(mask_file)
                                    if mask_file.exists()
                                    else None,
                                    "file_exists": True,
                                    "dataset_source": config.FF.DATASET_SOURCE,
                                }
                            )
                elif item.suffix.lower() in _VIDEO_EXTS:
                    # Videos placed directly in manipulated/ (no sub-folder)
                    mask_file = self.masks_path / item.name
                    records.append(
                        {
                            "filename": item.name,
                            "video_path": str(item),
                            "ground_truth": "DEEPFAKE",
                            "original_filename": None,
                            "split": None,
                            "manipulation_method": None,
                            "mask_path": str(mask_file) if mask_file.exists() else None,
                            "file_exists": True,
                            "dataset_source": config.FF.DATASET_SOURCE,
                        }
                    )
        else:
            _warn(f"manipulated/ folder not found: {self.manipulated_path}")

        if not records:
            _warn(
                "No video files found in FaceForensics++ folders.\n"
                "Did you place .mp4 files in:\n"
                f"  {self.original_path}\n"
                f"  {self.manipulated_path}"
            )

        return records


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------
def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="ff_loader",
        description="TRUSTFUSE — FaceForensics++ Loader. Inspect FF++ records.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument("--filter", choices=["ALL", "REAL", "DEEPFAKE"], default="ALL")
    p.add_argument("--max", type=int, default=None, metavar="N")
    p.add_argument("--shuffle", action="store_true")
    p.add_argument("--seed", type=int, default=config.RANDOM_SEED)
    return p


def main() -> None:
    args = _build_parser().parse_args()

    print("=" * 60)
    print("  TRUSTFUSE — FaceForensics++ Loader")
    print("=" * 60)
    print(f"  Dataset   : {config.FF.DATASET_PATH}")
    print(f"  Metadata  : {config.FF.METADATA_PATH}")
    print(f"  Filter    : {args.filter}")
    print("=" * 60)

    loader = FFLoader()
    records = loader.load(
        filter_label=args.filter,
        max_records=args.max,
        shuffle=args.shuffle,
        seed=args.seed,
    )

    real_count = sum(1 for r in records if r["ground_truth"] == "REAL")
    fake_count = sum(1 for r in records if r["ground_truth"] == "DEEPFAKE")
    missing = sum(1 for r in records if not r["file_exists"])

    print(f"\nLoaded {len(records)} record(s)")
    print(f"  REAL     : {real_count}")
    print(f"  DEEPFAKE : {fake_count}")
    print(f"  Missing  : {missing}")

    preview = min(5, len(records))
    if preview:
        print(f"\n--- First {preview} record(s) ---")
        for r in records[:preview]:
            tick = "✔" if r["file_exists"] else "✘ MISSING"
            method = f" [{r['manipulation_method']}]" if r["manipulation_method"] else ""
            print(f"  [{tick}] {r['filename']}{method}  →  {r['ground_truth']}")

    print()


if __name__ == "__main__":
    main()
