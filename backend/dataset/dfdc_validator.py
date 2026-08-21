"""
dfdc_validator.py — TRUSTFUSE Dataset Module
=============================================
Validates the DFDC (Deepfake Detection Challenge) dataset folder structure
and metadata integrity.

Checks:
    1. Dataset root exists
    2. dfdc_sample/ exists
    3. videos/ folder exists
    4. metadata/ folder exists
    5. metadata.json exists
    6. metadata.json is valid JSON
    7. Labels are from the supported set
    8. Referenced video files exist on disk

Usage (programmatic):
    from dfdc_validator import DFDCValidator
    report = DFDCValidator().validate()

Usage (CLI):
    python dfdc_validator.py
    python dfdc_validator.py --strict
"""

import json
import argparse
import sys
from pathlib import Path
from typing import Optional

from config import config


# ---------------------------------------------------------------------------
# DFDCValidator
# ---------------------------------------------------------------------------
class DFDCValidator:
    """
    Validates the DFDC dataset folder structure and record integrity.

    Parameters
    ----------
    dataset_path, video_path, metadata_path : Path, optional
        Override paths from config.
    """

    def __init__(
        self,
        dataset_path: Optional[Path] = None,
        video_path: Optional[Path] = None,
        metadata_path: Optional[Path] = None,
    ) -> None:
        self.dataset_path = Path(dataset_path or config.DFDC.DATASET_PATH)
        self.video_path = Path(video_path or config.DFDC.VIDEO_PATH)
        self.metadata_path = Path(metadata_path or config.DFDC.METADATA_PATH)
        # metadata/ folder (parent of metadata.json)
        self.metadata_folder = self.metadata_path.parent

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def validate(self, verbose: bool = True) -> dict:
        """
        Run all validation checks.

        Returns
        -------
        dict  structured report
        """
        report = {
            "dataset_source": "DFDC",
            "dataset_valid": False,
            "dataset_path_exists": False,
            "videos_path_exists": False,
            "metadata_folder_exists": False,
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

        # 2. Videos folder
        report["videos_path_exists"] = self.video_path.is_dir()
        if not report["videos_path_exists"]:
            report["errors"].append(f"videos/ folder not found: {self.video_path}")

        # 3. Metadata folder
        report["metadata_folder_exists"] = self.metadata_folder.is_dir()
        if not report["metadata_folder_exists"]:
            report["errors"].append(f"metadata/ folder not found: {self.metadata_folder}")

        # 4. metadata.json existence
        if not self.metadata_path.exists():
            report["errors"].append(
                f"metadata.json not found: {self.metadata_path}\n"
                "  → Download DFDC sample and place metadata.json there."
            )
            report["dataset_valid"] = False
            if verbose:
                self._print_report(report)
            return report

        report["metadata_exists"] = True

        # 5. Valid JSON
        try:
            with open(self.metadata_path, "r", encoding="utf-8") as f:
                raw = json.load(f)
            report["metadata_valid_json"] = True
        except json.JSONDecodeError as exc:
            report["errors"].append(f"metadata.json is not valid JSON: {exc}")
            if verbose:
                self._print_report(report)
            return report

        if not isinstance(raw, dict):
            report["errors"].append(
                "metadata.json must be a JSON object with filenames as keys."
            )
            if verbose:
                self._print_report(report)
            return report

        # 6-8. Records
        for filename, entry in raw.items():
            report["total_records"] += 1

            if not isinstance(entry, dict):
                report["invalid_records"] += 1
                report["warnings"].append(f'Malformed entry for "{filename}".')
                continue

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
            else:
                report["deepfake_count"] += 1

            video_file = self.video_path / filename
            if not video_file.exists():
                report["missing_files"] += 1
                report["warnings"].append(f'Video not found on disk: "{filename}"')
            else:
                report["valid_records"] += 1

        # Overall result
        if not report["errors"] and report["total_records"] > 0:
            report["dataset_valid"] = True
        elif not report["errors"] and report["total_records"] == 0:
            report["errors"].append("No records found in metadata.json.")

        if verbose:
            self._print_report(report)

        return report

    # ------------------------------------------------------------------
    # Pretty printer
    # ------------------------------------------------------------------

    def _print_report(self, report: dict) -> None:
        valid_str = "✔ VALID" if report["dataset_valid"] else "✘ INVALID"

        def tick(v):
            return "✔" if v else "✘"

        print("\n" + "=" * 60)
        print(f"  DFDC Validation Report  [{valid_str}]")
        print("=" * 60)
        print(f"\n  Paths:")
        print(f"    {tick(report['dataset_path_exists'])} Dataset root    : {self.dataset_path}")
        print(f"    {tick(report['videos_path_exists'])} videos/         : {self.video_path}")
        print(f"    {tick(report['metadata_folder_exists'])} metadata/       : {self.metadata_folder}")
        print(f"    {tick(report['metadata_exists'])} metadata.json   : {self.metadata_path}")
        print(f"    {tick(report['metadata_valid_json'])} JSON syntax     : valid")
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
        prog="dfdc_validator",
        description="TRUSTFUSE — DFDC Dataset Validator",
    )
    p.add_argument("--strict", action="store_true",
                   help="Exit 1 if any video files are missing")
    args = p.parse_args()

    v = DFDCValidator()
    report = v.validate(verbose=True)

    if not report["dataset_valid"]:
        sys.exit(1)
    if args.strict and report["missing_files"] > 0:
        print(
            f"ERROR: --strict mode: {report['missing_files']} file(s) missing.",
            file=sys.stderr,
        )
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
