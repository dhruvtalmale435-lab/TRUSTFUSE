"""
ff_validator.py — TRUSTFUSE Dataset Module
==========================================
Validates the FaceForensics++ dataset folder structure and data integrity.

Checks performed:
    1.  Dataset root (faceforensics_sample/) exists
    2.  videos/ folder exists
    3.  videos/original/ folder exists
    4.  videos/manipulated/ folder exists
    5.  masks/ folder exists (non-fatal warning if absent)
    6.  metadata/ folder exists
    7.  metadata.json exists (non-fatal — folder-scan mode used if absent)
    8.  metadata.json is valid JSON (if it exists)
    9.  Records have supported labels
    10. Referenced video files exist on disk
    11. Summary counts

Usage (programmatic):
    from ff_validator import FFValidator
    v = FFValidator()
    report = v.validate()

Usage (CLI):
    python ff_validator.py
    python ff_validator.py --strict
"""

import json
import argparse
import sys
from pathlib import Path
from typing import Optional

from config import config

_VIDEO_EXTS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}


# ---------------------------------------------------------------------------
# FFValidator
# ---------------------------------------------------------------------------
class FFValidator:
    """
    Validates the FaceForensics++ dataset folder and records.

    Parameters
    ----------
    dataset_path : Path, optional
        Override dataset root.
    """

    def __init__(self, dataset_path: Optional[Path] = None) -> None:
        self.dataset_path = Path(dataset_path or config.FF.DATASET_PATH)
        self.video_path = config.FF.VIDEO_PATH
        self.original_path = config.FF.ORIGINAL_VIDEO_PATH
        self.manipulated_path = config.FF.MANIPULATED_VIDEO_PATH
        self.masks_path = config.FF.MASKS_PATH
        self.metadata_path = config.FF.METADATA_PATH

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def validate(self, verbose: bool = True) -> dict:
        """
        Run all validation checks.

        Returns
        -------
        dict  validation report
        """
        report = {
            "dataset_source": "FaceForensics++",
            "dataset_valid": False,
            "dataset_path_exists": False,
            "videos_path_exists": False,
            "original_path_exists": False,
            "manipulated_path_exists": False,
            "masks_path_exists": False,
            "metadata_exists": False,
            "metadata_valid_json": False,
            "total_records": 0,
            "valid_records": 0,
            "real_count": 0,
            "deepfake_count": 0,
            "missing_files": 0,
            "invalid_records": 0,
            "errors": [],
            "warnings": [],
        }

        # 1. Dataset root
        report["dataset_path_exists"] = self.dataset_path.is_dir()
        if not report["dataset_path_exists"]:
            report["errors"].append(f"Dataset root not found: {self.dataset_path}")

        # 2. videos/
        report["videos_path_exists"] = self.video_path.is_dir()
        if not report["videos_path_exists"]:
            report["errors"].append(f"videos/ folder not found: {self.video_path}")

        # 3. videos/original/
        report["original_path_exists"] = self.original_path.is_dir()
        if not report["original_path_exists"]:
            report["errors"].append(
                f"videos/original/ not found: {self.original_path}"
            )

        # 4. videos/manipulated/
        report["manipulated_path_exists"] = self.manipulated_path.is_dir()
        if not report["manipulated_path_exists"]:
            report["errors"].append(
                f"videos/manipulated/ not found: {self.manipulated_path}"
            )

        # 5. masks/ (optional — only a warning)
        report["masks_path_exists"] = self.masks_path.is_dir()
        if not report["masks_path_exists"]:
            report["warnings"].append(
                f"masks/ folder not found (optional): {self.masks_path}"
            )

        # 6-8. metadata.json (optional — folder-scan works without it)
        if self.metadata_path.exists():
            report["metadata_exists"] = True
            try:
                with open(self.metadata_path, "r", encoding="utf-8") as f:
                    raw = json.load(f)
                report["metadata_valid_json"] = True
                # 9-10. Validate records from metadata
                self._validate_metadata_records(raw, report)
            except json.JSONDecodeError as exc:
                report["errors"].append(
                    f"metadata.json is not valid JSON: {exc}"
                )
        else:
            report["warnings"].append(
                f"metadata.json not found (OK — will use folder-scan): {self.metadata_path}"
            )
            # Count files directly from folders as a proxy
            self._count_from_folders(report)

        # Overall validity
        if not report["errors"] and (
            report["real_count"] > 0 or report["deepfake_count"] > 0
        ):
            report["dataset_valid"] = True
        elif not report["errors"] and report["total_records"] == 0:
            report["warnings"].append(
                "No video files found in dataset folders. "
                "Place .mp4 files in original/ and manipulated/."
            )
            # Still valid structure — just empty
            report["dataset_valid"] = not bool(report["errors"])

        if verbose:
            self._print_report(report)

        return report

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _validate_metadata_records(self, raw, report: dict) -> None:
        """Iterate metadata and count/validate every record."""
        items = raw.items() if isinstance(raw, dict) else enumerate(raw)

        for key, entry in items:
            filename = key if isinstance(raw, dict) else entry.get("filename", "")
            if not isinstance(entry, dict):
                report["invalid_records"] += 1
                report["warnings"].append(f'Malformed entry for "{filename}".')
                continue

            report["total_records"] += 1

            raw_label = str(entry.get("label", "")).upper()
            if raw_label not in config.SUPPORTED_RAW_LABELS:
                report["invalid_records"] += 1
                report["warnings"].append(
                    f'"{filename}" has unsupported label "{raw_label}".'
                )
                continue

            ground_truth = config.LABEL_MAP[raw_label]

            if ground_truth == "REAL":
                report["real_count"] += 1
                video_file = self.original_path / str(filename)
            else:
                report["deepfake_count"] += 1
                video_file = self.manipulated_path / str(filename)

            if not video_file.exists():
                report["missing_files"] += 1
                report["warnings"].append(f'Video not found: "{filename}"')
            else:
                report["valid_records"] += 1

    def _count_from_folders(self, report: dict) -> None:
        """Count videos by scanning original/ and manipulated/ folders."""
        if self.original_path.exists():
            real_files = [
                f for f in self.original_path.rglob("*")
                if f.suffix.lower() in _VIDEO_EXTS
            ]
            report["real_count"] = len(real_files)
            report["total_records"] += len(real_files)
            report["valid_records"] += len(real_files)

        if self.manipulated_path.exists():
            fake_files = [
                f for f in self.manipulated_path.rglob("*")
                if f.suffix.lower() in _VIDEO_EXTS
            ]
            report["deepfake_count"] = len(fake_files)
            report["total_records"] += len(fake_files)
            report["valid_records"] += len(fake_files)

    def _print_report(self, report: dict) -> None:
        valid_str = "✔ VALID" if report["dataset_valid"] else "✘ INVALID"

        def tick(v):
            return "✔" if v else "✘"

        print("\n" + "=" * 60)
        print(f"  FaceForensics++ Validation Report  [{valid_str}]")
        print("=" * 60)
        print(f"\n  Paths:")
        print(f"    {tick(report['dataset_path_exists'])} Dataset root      : {self.dataset_path}")
        print(f"    {tick(report['videos_path_exists'])} videos/           : {self.video_path}")
        print(f"    {tick(report['original_path_exists'])} videos/original/  : {self.original_path}")
        print(f"    {tick(report['manipulated_path_exists'])} videos/manipulated/: {self.manipulated_path}")
        print(f"    {tick(report['masks_path_exists'])} masks/            : {self.masks_path}  (optional)")
        print(f"    {tick(report['metadata_exists'])} metadata.json     : {self.metadata_path}  (optional)")

        print(f"\n  Record Counts:")
        print(f"    Total records  : {report['total_records']}")
        print(f"    Valid records  : {report['valid_records']}")
        print(f"    REAL           : {report['real_count']}")
        print(f"    DEEPFAKE       : {report['deepfake_count']}")
        print(f"    Missing files  : {report['missing_files']}")
        print(f"    Invalid records: {report['invalid_records']}")

        if report["errors"]:
            print(f"\n  Errors ({len(report['errors'])}):")
            for e in report["errors"]:
                print(f"    ✘ {e}")

        if report["warnings"]:
            shown = report["warnings"][:10]
            print(f"\n  Warnings ({len(report['warnings'])}):")
            for w in shown:
                print(f"    ⚠ {w}")
            if len(report["warnings"]) > 10:
                print(f"    ... and {len(report['warnings']) - 10} more.")

        print("\n" + "=" * 60 + "\n")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main() -> None:
    p = argparse.ArgumentParser(
        prog="ff_validator",
        description="TRUSTFUSE — FaceForensics++ Dataset Validator",
    )
    p.add_argument("--strict", action="store_true",
                   help="Exit 1 if any video files are missing")
    args = p.parse_args()

    v = FFValidator()
    report = v.validate(verbose=True)

    if not report["dataset_valid"]:
        sys.exit(1)
    if args.strict and report["missing_files"] > 0:
        print(f"ERROR: --strict mode: {report['missing_files']} file(s) missing.", file=sys.stderr)
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
