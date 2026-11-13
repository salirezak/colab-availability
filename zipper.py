#!/usr/bin/env python3
from pathlib import Path
import json
import zipfile
import subprocess

PROJECT_DIR = Path(__file__).resolve().parent
OUTPUT_ZIP = PROJECT_DIR / (PROJECT_DIR.parts[-1] + ".shell-extension.zip")
UUID = "colab-availability@salirezak.github.io"
FILES = [
    "metadata.json",
    "extension.js",
    "prefs.js",
    "schemas/org.gnome.shell.extensions.colab-availability.gschema.xml",
    "lib/network.js",
    "lib/scheduler.js",
    "lib/settings.js",
    "lib/indicator.js",
    "icons/failure.svg",
    "icons/pending.svg",
    "icons/success.svg",
]


def validate_extension() -> None:
    command = ["shexli", str(OUTPUT_ZIP), "--format", "text"]
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=False)
        print(result.stdout, result.stderr, sep="", end="")
    except FileNotFoundError:
        print("Note: 'shexli' command not found. Skipping automated validation.")


def build_zip() -> None:
    if OUTPUT_ZIP.exists():
        OUTPUT_ZIP.unlink()

    paths = [PROJECT_DIR / file for file in FILES]
    with zipfile.ZipFile(OUTPUT_ZIP, "w", compression=zipfile.ZIP_DEFLATED) as zip_file:
        for path in paths:
            zip_file.write(path, arcname=path.relative_to(PROJECT_DIR))

    print(f"Extension UUID: {UUID}")
    print(f"Output ZIP: {OUTPUT_ZIP}")
    print(f"Files included in the ZIP: {len(paths)}")
    for path in paths:
        print(f" - {path.relative_to(PROJECT_DIR)}")


if __name__ == "__main__":
    build_zip()
    print()
    validate_extension()