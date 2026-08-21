"""
dfdc_loader.py — TRUSTFUSE Dataset Module
==========================================
DFDC (Deepfake Detection Challenge) specific dataset loader.

Reads metadata.json in the standard DFDC format:

{
    "video.mp4": {
        "label":    "REAL" | "FAKE",
        "original": "source.mp4" | null,
        "split":    "train" | "val"
    },
    ...
}

Label normalisation:
    REAL  → REAL
    FAKE  → DEEPFAKE

Standard output record:
{
    "filename":             "example.mp4",
    "video_path":           "/abs/path/to/example.mp4",
    "ground_truth":         "REAL" | "DEEPFAKE",
    "original_filename":    "original.mp4" | null,
    "split":                "train" | null,
    "manipulation_method":  null,   (not used by DFDC)
    "mask_path":            null,   (not used by DFDC)
    "file_exists":          true | false,
    "dataset_source":       "DFDC"
}

Usage (programmatic):
    from dfdc_loader import DFDCLoader
    loader = DFDCLoader()
    records = loader.load(filter_label="DEEPFAKE", max_records=20, shuffle=True)

Usage (CLI):
    python dfdc_loader.py
    python dfdc_loader.py --filter REAL --max 10
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
    print(f"\nERROR: {msg}\n", file=sys.stderr)
    sys.exit(1)


def _warn(msg: str) -> None:
    print(f"WARNING: {msg}", file=sys.stderr)


# ---------------------------------------------------------------------------
# DFDCLoader
# ---------------------------------------------------------------------------
class DFDCLoader:
    """
    Loads DFDC-format dataset records from metadata.json.

    Parameters
    ----------
    metadata_path : Path, optional
        Override the metadata.json path from config.
    video_path : Path, optional
        Override the video folder path from config.
    """

    def __init__(
        self,
        metadata_path: Optional[Path] = None,
        video_path: Optional[Path] = None,
    ) -> None:
        self.metadata_path = Path(metadata_path or config.DFDC.METADATA_PATH)
        self.video_path = Path(video_path or config.DFDC.VIDEO_PATH)

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
        Load DFDC records.

        Parameters
        ----------
        filter_label : str
            "ALL", "REAL", or "DEEPFAKE".
        max_records : int, optional
            Cap on number of returned records.
        shuffle : bool
            Randomly shuffle before capping.
        seed : int, optional
            RNG seed for reproducibility.

        Returns
        -------
        list[dict]
        """
        filter_label = filter_label.upper()
        if filter_label not in ("ALL", "REAL", "DEEPFAKE"):
            _err(f'Invalid filter_label "{filter_label}". Choose: ALL, REAL, DEEPFAKE')

        raw = self._read_metadata()
        records = self._parse_records(raw)

        if filter_label != "ALL":
            records = [r for r in records if r["ground_truth"] == filter_label]

        if shuffle:
            rng = random.Random(seed if seed is not None else config.RANDOM_SEED)
            rng.shuffle(records)

        if max_records is not None:
            records = records[:max_records]

        return records

    def load_real(self, max_records: Optional[int] = None, shuffle: bool = False) -> List[dict]:
        return self.load("REAL", max_records=max_records, shuffle=shuffle)

    def load_deepfake(self, max_records: Optional[int] = None, shuffle: bool = False) -> List[dict]:
        return self.load("DEEPFAKE", max_records=max_records, shuffle=shuffle)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _read_metadata(self) -> dict:
        """Read and parse metadata.json. Exits cleanly on any failure."""
        if not self.metadata_path.exists():
            _err(
                f"metadata.json not found.\n"
                f"Expected location:\n  {self.metadata_path}\n\n"
                f"Download the DFDC sample dataset and place metadata.json there.\n"
                f"See dfdc_sample/README.md for step-by-step instructions."
            )

        try:
            with open(self.metadata_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except json.JSONDecodeError as exc:
            _err(
                f"metadata.json is not valid JSON.\n"
                f"File: {self.metadata_path}\nDetail: {exc}"
            )

        if not isinstance(data, dict):
            _err(
                "Unexpected metadata.json format.\n"
                "Expected a JSON object with filenames as keys."
            )

        return data

    def _parse_records(self, raw: dict) -> List[dict]:
        """Convert raw DFDC metadata into standardised record dicts."""
        records: List[dict] = []

        for filename, entry in raw.items():
            if not isinstance(entry, dict):
                _warn(f'Skipping malformed entry for "{filename}".')
                continue

            raw_label = str(entry.get("label", "")).upper()

            if raw_label not in config.SUPPORTED_RAW_LABELS:
                _warn(
                    f'Skipping "{filename}" — unsupported label "{raw_label}". '
                    f"Supported: {config.SUPPORTED_RAW_LABELS}"
                )
                continue

            ground_truth = config.LABEL_MAP[raw_label]
            video_file = self.video_path / filename

            records.append(
                {
                    "filename": filename,
                    "video_path": str(video_file),
                    "ground_truth": ground_truth,
                    "original_filename": entry.get("original") or None,
                    "split": entry.get("split") or None,
                    "manipulation_method": None,   # not provided by DFDC metadata
                    "mask_path": None,             # not provided by DFDC
                    "file_exists": video_file.exists(),
                    "dataset_source": config.DFDC.DATASET_SOURCE,
                }
            )

        return records


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="dfdc_loader",
        description="TRUSTFUSE — DFDC Loader. Inspect DFDC metadata records.",
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
    print("  TRUSTFUSE — DFDC Loader")
    print("=" * 60)
    print(f"  Metadata : {config.DFDC.METADATA_PATH}")
    print(f"  Videos   : {config.DFDC.VIDEO_PATH}")
    print(f"  Filter   : {args.filter}")
    print("=" * 60)

    loader = DFDCLoader()
    records = loader.load(
        filter_label=args.filter,
        max_records=args.max,
        shuffle=args.shuffle,
        seed=args.seed,
    )

    real_count = sum(1 for r in records if r["ground_truth"] == "REAL")
    fake_count = sum(1 for r in records if r["ground_truth"] == "DEEPFAKE")
    missing = sum(1 for r in records if not r["file_exists"])

    print(f"\nLoaded {len(records)} DFDC record(s)")
    print(f"  REAL     : {real_count}")
    print(f"  DEEPFAKE : {fake_count}")
    print(f"  Missing  : {missing}")

    for r in records[:5]:
        tick = "✔" if r["file_exists"] else "✘ MISSING"
        print(f"  [{tick}] {r['filename']}  →  {r['ground_truth']}")
    if len(records) > 5:
        print(f"  ... and {len(records) - 5} more.")
    print()


if __name__ == "__main__":
    main()
