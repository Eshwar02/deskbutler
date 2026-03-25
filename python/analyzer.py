"""File analysis — type detection, metadata extraction."""

import os
import mimetypes
from datetime import datetime


def analyze_file(path):
    """Return metadata about a file."""
    stat = os.stat(path)
    mime, _ = mimetypes.guess_type(path)
    ext = os.path.splitext(path)[1].lower()

    return {
        "path": path,
        "name": os.path.basename(path),
        "ext": ext,
        "mime": mime or "unknown",
        "size": stat.st_size,
        "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
    }
