"""File move/rename executor."""

import os
import shutil


def move_file(src, dst):
    """Move a file from src to dst. Creates destination directory if needed."""
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.move(src, dst)


def undo_file_move(entry):
    """Undo a previous move by moving the file back."""
    move_file(entry["to_path"], entry["from_path"])
