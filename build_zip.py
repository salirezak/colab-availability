from pathlib import Path
import pathspec
import json
import zipfile
import subprocess



PROJECT_DIR = Path(__file__).resolve().parent
OUTPUT_ZIP = PROJECT_DIR / (PROJECT_DIR.parts[-1] + ".shell-extension.zip")
GITIGNORE_PATH = PROJECT_DIR / ".gitignore"


def get_files_path() -> list[Path]:
    patterns = [".git/", ".venv/", ".gitignore", "README.md", "*.py", "requirements.txt"]
    if GITIGNORE_PATH.exists():
        with GITIGNORE_PATH.open("r", encoding="utf-8") as file:
            patterns.extend(file.readlines())
    spec = pathspec.PathSpec.from_lines("gitwildmatch", patterns)
    files = PROJECT_DIR.rglob("*")
    files = filter(lambda path: path.is_file() and path != OUTPUT_ZIP, files)
    files = filter(lambda path: not spec.match_file(path.relative_to(PROJECT_DIR).as_posix()), files)
    return list(files)

def get_extension_uuid() -> str:
    metadata_path = PROJECT_DIR / "metadata.json"
    with metadata_path.open("r", encoding="utf-8") as file:
        uuid = json.load(file).get("uuid")
    return uuid

def validate_extension() -> None:
    command = ["shexli", str(OUTPUT_ZIP), "--format", "text"]
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    print(result.stdout)
    if result.stderr:
        print(result.stderr)

def build_zip() -> None:
    uuid = get_extension_uuid()
    paths = get_files_path()

    with zipfile.ZipFile(OUTPUT_ZIP, "w", compression=zipfile.ZIP_DEFLATED) as zip_file:
        for path in paths:
            zip_file.write(path, arcname=path.relative_to(PROJECT_DIR))

    print(f"Extension UUID: {uuid}")
    print(f"Output ZIP: {OUTPUT_ZIP}")
    print(f"Files included in the ZIP: {len(paths)}")
    for path in paths:
        print(f" - {path.relative_to(PROJECT_DIR)}")


if __name__ == "__main__":
    build_zip()
    print()
    validate_extension()