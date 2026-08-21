"""
dataset_validator.py — TRUSTFUSE Dataset Module
================================================
UNIFIED validator for ALL dataset sources:

  - DFDC   (Deepfake Detection Challenge sample)
  - FF++   (FaceForensics++)

Runs the appropriate sub-validator for each source and prints a
combined report.

Usage (programmatic):
    from dataset_validator import DatasetValidator
    report = DatasetValidator().validate()

Usage (CLI):
    python dataset_validator.py                 # validate ALL sources
    python dataset_validator.py --source DFDC
    python dataset_validator.py --source FF
    python dataset_validator.py --strict        # exit 1 if any files missing
"""

import argparse
import sys
from typing import Optional

from dfdc_validator import DFDCValidator
from ff_validator import FFValidator


# ---------------------------------------------------------------------------
# Unified DatasetValidator
# ---------------------------------------------------------------------------
class DatasetValidator:
    """
    Runs validation for one or both dataset sources and returns a
    combined summary report.

    Parameters
    ----------
    source : str
        "DFDC", "FF", or "ALL" (default).
    """

    VALID_SOURCES = {"DFDC", "FF", "ALL"}

    def __init__(self, source: str = "ALL") -> None:
        source = source.upper()
        if source not in self.VALID_SOURCES:
            print(
                f"\nERROR: Invalid source '{source}'. Choose: DFDC, FF, ALL\n",
                file=sys.stderr,
            )
            sys.exit(1)
        self.source = source

    def validate(self, verbose: bool = True) -> dict:
        """
        Run validation for configured source(s).

        Returns
        -------
        dict
            Combined report with per-source sub-reports and totals.
        """
        reports = {}

        if self.source in ("DFDC", "ALL"):
            reports["DFDC"] = DFDCValidator().validate(verbose=verbose)

        if self.source in ("FF", "ALL"):
            reports["FF"] = FFValidator().validate(verbose=verbose)

        # Build combined summary
        all_valid = all(r["dataset_valid"] for r in reports.values())
        total_records = sum(r.get("total_records", 0) for r in reports.values())
        real_count = sum(r.get("real_count", 0) for r in reports.values())
        deepfake_count = sum(r.get("deepfake_count", 0) for r in reports.values())
        missing_files = sum(r.get("missing_files", 0) for r in reports.values())
        invalid_records = sum(r.get("invalid_records", 0) for r in reports.values())

        combined = {
            "all_sources_valid": all_valid,
            "sources_checked": list(reports.keys()),
            "total_records": total_records,
            "real_count": real_count,
            "deepfake_count": deepfake_count,
            "missing_files": missing_files,
            "invalid_records": invalid_records,
            "per_source": reports,
        }

        if verbose and len(reports) > 1:
            self._print_combined(combined)

        return combined

    def _print_combined(self, combined: dict) -> None:
        status = "✔ ALL VALID" if combined["all_sources_valid"] else "✘ ISSUES FOUND"
        print("\n" + "=" * 60)
        print(f"  COMBINED DATASET SUMMARY  [{status}]")
        print("=" * 60)
        print(f"  Sources checked : {', '.join(combined['sources_checked'])}")
        print(f"  Total records   : {combined['total_records']}")
        print(f"  REAL            : {combined['real_count']}")
        print(f"  DEEPFAKE        : {combined['deepfake_count']}")
        print(f"  Missing files   : {combined['missing_files']}")
        print(f"  Invalid records : {combined['invalid_records']}")
        print("=" * 60 + "\n")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main() -> None:
    p = argparse.ArgumentParser(
        prog="dataset_validator",
        description=(
            "TRUSTFUSE Unified Dataset Validator.\n"
            "Validates DFDC and/or FaceForensics++ dataset structure."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument(
        "--source",
        choices=["DFDC", "FF", "ALL"],
        default="ALL",
        help="Which dataset to validate (default: ALL)",
    )
    p.add_argument(
        "--strict",
        action="store_true",
        help="Exit with code 1 if any video files are missing",
    )
    args = p.parse_args()

    validator = DatasetValidator(source=args.source)
    combined = validator.validate(verbose=True)

    if not combined["all_sources_valid"]:
        sys.exit(1)

    if args.strict and combined["missing_files"] > 0:
        print(
            f"ERROR: --strict mode: {combined['missing_files']} video file(s) missing.",
            file=sys.stderr,
        )
        sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()
