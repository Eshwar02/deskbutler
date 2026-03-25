"""File move/rename executor with duplicate handling."""

import os
import shutil


def _unique_path(dst):
    """If dst already exists, append (2), (3), etc. until unique."""
    if not os.path.exists(dst):
        return dst

    base, ext = os.path.splitext(dst)
    counter = 2
    while True:
        candidate = f"{base} ({counter}){ext}"
        if not os.path.exists(candidate):
            return candidate
        counter += 1


def move_file(src, dst):
    """Move a file from src to dst. Creates destination directory if needed.
    If a file with the same name exists at dst, appends a number."""
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    dst = _unique_path(dst)
    shutil.move(src, dst)
    return dst


def undo_file_move(entry):
    """Undo a previous move by moving the file back."""
    move_file(entry["to_path"], entry["from_path"])
