"""Folder watcher using watchdog."""

import time
import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


class NewFileHandler(FileSystemEventHandler):
    def __init__(self, on_new_file):
        self.on_new_file = on_new_file

    def on_created(self, event):
        if not event.is_directory:
            # Small delay to let file finish writing
            time.sleep(0.5)
            try:
                self.on_new_file(event.src_path)
            except Exception:
                pass

    def on_moved(self, event):
        if not event.is_directory:
            try:
                self.on_new_file(event.dest_path)
            except Exception:
                pass


_observer = Observer()
_started = False


def _ensure_started():
    """Ensure the observer thread is running."""
    global _started
    if not _started:
        _observer.daemon = True
        _observer.start()
        _started = True


def start_watching(folders=None, on_new_file=None):
    """Start watching folders in a background thread."""
    if folders is None:
        folders = []
    if on_new_file is None:
        on_new_file = lambda path: None

    handler = NewFileHandler(on_new_file)
    for folder in folders:
        _observer.schedule(handler, folder, recursive=False)

    _ensure_started()


def stop_watching():
    _observer.stop()
    _observer.join()


def add_folder(folder, on_new_file):
    """Add a new folder to watch. Starts observer if not running."""
    handler = NewFileHandler(on_new_file)
    _observer.schedule(handler, folder, recursive=False)
    _ensure_started()
