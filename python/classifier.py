"""AI-based file classification — suggests where a file should go."""

# File type → suggested folder category mapping
DEFAULT_CATEGORIES = {
    ".pdf": "Documents",
    ".doc": "Documents",
    ".docx": "Documents",
    ".txt": "Documents",
    ".xlsx": "Spreadsheets",
    ".csv": "Spreadsheets",
    ".jpg": "Images",
    ".jpeg": "Images",
    ".png": "Images",
    ".gif": "Images",
    ".svg": "Images",
    ".mp4": "Videos",
    ".mov": "Videos",
    ".avi": "Videos",
    ".mp3": "Music",
    ".wav": "Music",
    ".flac": "Music",
    ".zip": "Archives",
    ".rar": "Archives",
    ".7z": "Archives",
    ".exe": "Installers",
    ".msi": "Installers",
    ".py": "Code",
    ".js": "Code",
    ".ts": "Code",
    ".html": "Code",
    ".css": "Code",
}


def classify(file_meta):
    """Return a suggested category for the file based on its extension."""
    ext = file_meta.get("ext", "").lower()
    category = DEFAULT_CATEGORIES.get(ext, "Other")
    return {
        "category": category,
        "confidence": 0.9 if ext in DEFAULT_CATEGORIES else 0.3,
    }
