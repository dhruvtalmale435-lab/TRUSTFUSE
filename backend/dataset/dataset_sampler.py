"""
dataset_sampler.py — TRUSTFUSE Dataset Module
=============================================
Creates a balanced hackathon-ready subset from DFDC, FF++, or both.

Features:
    - Configurable max_real_videos, max_fake_videos, random_seed
    - Works with DFDC, FF++, or a merged pool from both
    - Balanced REAL/DEEPFAKE sampling
    - Saves a lightweight sample_manifest.json
    - Does NOT copy or move video files

Usage (programmatic):
    from dataset_sampler import DatasetSampler
    sampler = DatasetSampler(source="ALL", max_real=20, max_fake=20)
    sample = sampler.sample()
    sampler.save_manifest(sample)

Usage (CLI):
    python dataset_sampler.py
    python dataset_sampler.py --source DFDC --max-real 20 --max-fake 20
    python dataset_sampler.py --source FF   --max-real 10 --max-fake 10
    python dataset_sampler.py --source ALL  --no-save
"""

import json
import random
import argparse
import sys
from pathlib import Path
from typing import List, Optional

from config import config
from dfdc_loader import DFDCLoader
from ff_loader import FFLoader


# ---------------------------------------------------------------------------
# DatasetSampler
# ---------------------------------------------------------------------------
class DatasetSampler:
    """
    Draws a balanced hackathon-friendly subset.

    Parameters
    ----------
    source : str
        "DFDC", "FF", or "ALL".
    max_real : int
        Max REAL records (default: config.DFDC.MAX_REAL_VIDEOS or FF equivalent).
    max_fake : int
        Max DEEPFAKE records.
    seed : int
        Random seed.
    manifest_path : Path, optional
        Where to write sample_manifest.json.
    """

    VALID_SOURCES = {"DFDC", "FF", "ALL"}

    def __init__(
        self,
        source: str = "ALL",
        max_real: Optional[int] = None,
        max_fake: Optional[int] = None,
        seed: Optional[int] = None,
        manifest_path: Optional[Path] = None,
    ) -> None:
        source = source.upper()
        if source not in self.VALID_SOURCES:
            print(f"\nERROR: Invalid source '{source}'. Choose: DFDC, FF, ALL\n",
                  file=sys.stderr)
            sys.exit(1)

        self.source = source
        # Use the most generous limit when mixing sources
        self.max_real: int = max_real if max_real is not None else max(
            config.DFDC.MAX_REAL_VIDEOS, config.FF.MAX_REAL_VIDEOS
        )
        self.max_fake: int = max_fake if max_fake is not None else max(
            config.DFDC.MAX_FAKE_VIDEOS, config.FF.MAX_FAKE_VIDEOS
        )
        self.seed: int = seed if seed is not None else config.RANDOM_SEED
        self.manifest_path: Path = Path(manifest_path or config.SAMPLE_MANIFEST_PATH)
        self._rng = random.Random(self.seed)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def sample(self, only_existing: bool = False) -> List[dict]:
        """
        Draw a balanced random sample.

        Parameters
        ----------
        only_existing : bool
            If True, only include records whose video file is on disk.

        Returns
        -------
        list[dict]
        """
        all_records = self._collect_all()

        if not all_records:
            print(
                "ERROR: No records found. Ensure dataset folders are populated.\n"
                "See README.md for setup instructions.",
                file=sys.stderr,
            )
            return []

        if only_existing:
            before = len(all_records)
            all_records = [r for r in all_records if r.get("file_exists", False)]
            dropped = before - len(all_records)
            if dropped:
                print(f"INFO: Excluded {dropped} record(s) with missing video files.")

        # Split by ground truth
        real_pool = [r for r in all_records if r["ground_truth"] == "REAL"]
        fake_pool = [r for r in all_records if r["ground_truth"] == "DEEPFAKE"]

        # Shuffle each pool separately (same seed → deterministic)
        self._rng.shuffle(real_pool)
        self._rng.shuffle(fake_pool)

        # Trim
        selected_real = real_pool[: self.max_real]
        selected_fake = fake_pool[: self.max_fake]

        # Warn if not enough data
        if len(selected_real) < self.max_real:
            print(f"WARNING: Requested {self.max_real} REAL but only "
                  f"{len(selected_real)} available.")
        if len(selected_fake) < self.max_fake:
            print(f"WARNING: Requested {self.max_fake} DEEPFAKE but only "
                  f"{len(selected_fake)} available.")

        # Merge and final shuffle
        sample = selected_real + selected_fake
        self._rng.shuffle(sample)
        return sample

    def save_manifest(self, sample: List[dict]) -> Path:
        """
        Save a lightweight manifest JSON for the selected sample.

        Parameters
        ----------
        sample : list[dict]
            Records from :meth:`sample`.

        Returns
        -------
        Path  path to the written manifest
        """
        entries = [
            {
                "filename": r["filename"],
                "ground_truth": r["ground_truth"],
                "video_path": r["video_path"],
                "original_filename": r.get("original_filename"),
                "split": r.get("split"),
                "manipulation_method": r.get("manipulation_method"),
                "mask_path": r.get("mask_path"),
                "file_exists": r.get("file_exists", False),
                "dataset_source": r.get("dataset_source", "UNKNOWN"),
            }
            for r in sample
        ]

        try:
            with open(self.manifest_path, "w", encoding="utf-8") as f:
                json.dump(entries, f, indent=2)
            return self.manifest_path
        except OSError as exc:
            print(f"ERROR: Could not write manifest: {exc}", file=sys.stderr)
            raise

    def print_summary(self, sample: List[dict]) -> None:
        """Print a readable sample summary."""
        real_count = sum(1 for r in sample if r["ground_truth"] == "REAL")
        fake_count = sum(1 for r in sample if r["ground_truth"] == "DEEPFAKE")
        missing = sum(1 for r in sample if not r.get("file_exists", False))
        dfdc_count = sum(1 for r in sample if r.get("dataset_source") == "DFDC")
        ff_count = sum(1 for r in sample if r.get("dataset_source") == "FaceForensics++")

        print("\n" + "=" * 60)
        print("  TRUSTFUSE — Dataset Sample Summary")
        print("=" * 60)
        print(f"  Source         : {self.source}")
        print(f"  Total selected : {len(sample)}")
        print(f"  REAL           : {real_count}")
        print(f"  DEEPFAKE       : {fake_count}")
        print(f"  From DFDC      : {dfdc_count}")
        print(f"  From FF++      : {ff_count}")
        print(f"  Missing files  : {missing}")
        print(f"  Random seed    : {self.seed}")
        print("=" * 60)

        if sample:
            preview = min(5, len(sample))
            print(f"\n  Preview (first {preview}):")
            for r in sample[:preview]:
                tick = "✔" if r.get("file_exists") else "✘"
                src = r.get("dataset_source", "?")
                print(f"    [{tick}] [{src}] {r['filename']}  →  {r['ground_truth']}")
            if len(sample) > preview:
                print(f"    ... and {len(sample) - preview} more.")
        print()

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    def _collect_all(self) -> List[dict]:
        """Collect all records from configured source(s)."""
        records: List[dict] = []

        if self.source in ("DFDC", "ALL"):
            records.extend(DFDCLoader().load())

        if self.source in ("FF", "ALL"):
            records.extend(FFLoader().load())

        return records


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="dataset_sampler",
        description=(
            "TRUSTFUSE Dataset Sampler — create a balanced hackathon subset.\n"
            "Supports DFDC, FaceForensics++, or both combined."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument("--source", choices=["DFDC", "FF", "ALL"], default="ALL",
                   help="Dataset source (default: ALL)")
    p.add_argument("--max-real", type=int, default=None, metavar="N",
                   help="Max REAL videos")
    p.add_argument("--max-fake", type=int, default=None, metavar="N",
                   help="Max DEEPFAKE videos")
    p.add_argument("--seed", type=int, default=config.RANDOM_SEED,
                   help=f"Random seed (default: {config.RANDOM_SEED})")
    p.add_argument("--only-existing", action="store_true",
                   help="Only include records whose video files exist on disk")
    p.add_argument("--no-save", action="store_true",
                   help="Do not write manifest to disk")
    p.add_argument("--manifest-path", type=str,
                   default=str(config.SAMPLE_MANIFEST_PATH),
                   help="Path to write manifest JSON")
    return p


def main() -> None:
    args = _build_parser().parse_args()

    sampler = DatasetSampler(
        source=args.source,
        max_real=args.max_real,
        max_fake=args.max_fake,
        seed=args.seed,
        manifest_path=Path(args.manifest_path),
    )

    print(f"\nSampling from source={args.source} "
          f"(max_real={sampler.max_real}, max_fake={sampler.max_fake}, "
          f"seed={sampler.seed}) ...")

    sample = sampler.sample(only_existing=args.only_existing)
    sampler.print_summary(sample)

    if not args.no_save and sample:
        path = sampler.save_manifest(sample)
        print(f"  Manifest saved → {path}\n")
    elif not sample:
        print("  No records sampled — manifest not saved.\n")
    else:
        print("  --no-save specified — manifest not written.\n")


if __name__ == "__main__":
    main()
