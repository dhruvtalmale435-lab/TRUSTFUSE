"""
dataset_loader.py — TRUSTFUSE Dataset Module
=============================================
UNIFIED loader that works with BOTH dataset sources:

  - DFDC   (Deepfake Detection Challenge sample)
  - FF++   (FaceForensics++)

Label normalisation:
    REAL / ORIGINAL              → REAL
    FAKE / DEEPFAKE / MANIPULATED → DEEPFAKE

Standard record format (ready for backend/ml/):
{
    "filename":             "example.mp4",
    "video_path":           "/absolute/path/to/example.mp4",
    "ground_truth":         "REAL" | "DEEPFAKE",
    "original_filename":    "source.mp4" | null,
    "split":                "train" | null,
    "manipulation_method":  "Deepfakes" | null,   # FF++ only
    "mask_path":            "/path/to/mask.mp4" | null,  # FF++ only
    "file_exists":          true | false,
    "dataset_source":       "DFDC" | "FaceForensics++"
}

Usage (programmatic):
    from dataset_loader import DatasetLoader
    loader = DatasetLoader(source="DFDC")
    records = loader.load(filter_label="ALL", max_records=20, shuffle=True)

    # Or load from both at once
    loader = DatasetLoader(source="ALL")
    records = loader.load()

Usage (CLI):
    python dataset_loader.py --source DFDC
    python dataset_loader.py --source FF
    python dataset_loader.py --source ALL --filter DEEPFAKE --max 20 --shuffle
"""

import json
import random
import argparse
import sys
from pathlib import Path
from typing import List, Optional

from config import config

# Import the individual source loaders
from dfdc_loader import DFDCLoader
from ff_loader import FFLoader


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _err(msg: str) -> None:
    print(f"\nERROR: {msg}\n", file=sys.stderr)
    sys.exit(1)


# ---------------------------------------------------------------------------
# Unified DatasetLoader
# ---------------------------------------------------------------------------
class DatasetLoader:
    """
    Unified dataset loader supporting DFDC and / or FaceForensics++.

    Parameters
    ----------
    source : str
        "DFDC"  — load from DFDC only
        "FF"    — load from FaceForensics++ only
        "ALL"   — load from both and merge (default)
    """

    VALID_SOURCES = {"DFDC", "FF", "ALL"}

    def __init__(self, source: str = "ALL") -> None:
        source = source.upper()
        if source not in self.VALID_SOURCES:
            _err(f'Invalid source "{source}". Choose from: DFDC, FF, ALL')
        self.source = source

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
        Load dataset records from the configured source(s).

        Parameters
        ----------
        filter_label : str
            One of "ALL", "REAL", "DEEPFAKE".
        max_records : int, optional
            Maximum records to return (applied after merge + filter).
        shuffle : bool
            Randomly shuffle before slicing.
        seed : int, optional
            RNG seed.

        Returns
        -------
        list[dict]
        """
        filter_label = filter_label.upper()
        if filter_label not in ("ALL", "REAL", "DEEPFAKE"):
            _err(f'Invalid filter_label "{filter_label}". Choose: ALL, REAL, DEEPFAKE')

        records: List[dict] = []

        if self.source in ("DFDC", "ALL"):
            dfdc_loader = DFDCLoader()
            records.extend(dfdc_loader.load(filter_label=filter_label))

        if self.source in ("FF", "ALL"):
            ff_loader = FFLoader()
            records.extend(ff_loader.load(filter_label=filter_label))

        # Shuffle merged list
        if shuffle:
            rng = random.Random(seed if seed is not None else config.RANDOM_SEED)
            rng.shuffle(records)

        # Limit
        if max_records is not None:
            records = records[:max_records]

        return records

    def load_real(self, max_records: Optional[int] = None, shuffle: bool = False) -> List[dict]:
        """Convenience: load only REAL records."""
        return self.load("REAL", max_records=max_records, shuffle=shuffle)

    def load_deepfake(self, max_records: Optional[int] = None, shuffle: bool = False) -> List[dict]:
        """Convenience: load only DEEPFAKE records."""
        return self.load("DEEPFAKE", max_records=max_records, shuffle=shuffle)

    def summary(self, records: List[dict]) -> dict:
        """Return a count summary dict for a list of records."""
        return {
            "total": len(records),
            "real": sum(1 for r in records if r["ground_truth"] == "REAL"),
            "deepfake": sum(1 for r in records if r["ground_truth"] == "DEEPFAKE"),
            "missing": sum(1 for r in records if not r.get("file_exists", False)),
            "dfdc": sum(1 for r in records if r.get("dataset_source") == "DFDC"),
            "ff": sum(1 for r in records if r.get("dataset_source") == "FaceForensics++"),
        }


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="dataset_loader",
        description=(
            "TRUSTFUSE Unified Dataset Loader.\n"
            "Loads records from DFDC, FaceForensics++, or both."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument(
        "--source",
        choices=["DFDC", "FF", "ALL"],
        default="ALL",
        help="Dataset source to load (default: ALL)",
    )
    p.add_argument(
        "--filter",
        choices=["ALL", "REAL", "DEEPFAKE"],
        default="ALL",
        help="Label filter (default: ALL)",
    )
    p.add_argument("--max", type=int, default=None, metavar="N",
                   help="Maximum records to return")
    p.add_argument("--shuffle", action="store_true", help="Shuffle records")
    p.add_argument("--seed", type=int, default=config.RANDOM_SEED)
    return p


def main() -> None:
    args = _build_parser().parse_args()

    print("=" * 60)
    print("  TRUSTFUSE — Unified Dataset Loader")
    print("=" * 60)
    print(f"  Source : {args.source}")
    print(f"  Filter : {args.filter}")
    if args.max:
        print(f"  Max    : {args.max}")
    print("=" * 60)

    loader = DatasetLoader(source=args.source)
    records = loader.load(
        filter_label=args.filter,
        max_records=args.max,
        shuffle=args.shuffle,
        seed=args.seed,
    )

    s = loader.summary(records)
    print(f"\nLoaded {s['total']} record(s)")
    print(f"  REAL        : {s['real']}")
    print(f"  DEEPFAKE    : {s['deepfake']}")
    print(f"  From DFDC   : {s['dfdc']}")
    print(f"  From FF++   : {s['ff']}")
    print(f"  Missing     : {s['missing']}")

    preview = min(5, len(records))
    if preview:
        print(f"\n--- First {preview} record(s) ---")
        for r in records[:preview]:
            tick = "✔" if r.get("file_exists") else "✘"
            src = r.get("dataset_source", "?")
            print(f"  [{tick}] [{src}] {r['filename']}  →  {r['ground_truth']}")
    print()


if __name__ == "__main__":
    main()
