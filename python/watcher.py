"""Folder watcher using watchdog."""

import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


class NewFileHandler(FileSystemEventHandler):
    def __init__(self, on_new_file):
        self.on_new_file = on_new_file

    def on_created(self, event):
        if not event.is_directory:
            self.on_new_file(event.src_path)

    def on_moved(self, event):
        if not event.is_directory:
            self.on_new_file(event.dest_path)


_observer = Observer()


def start_watching(folders=None, on_new_file=None):
    """Start watching folders in a background thread."""
    if folders is None:
        folders = []
    if on_new_file is None:
        on_new_file = lambda path: None

    handler = NewFileHandler(on_new_file)
    for folder in folders:
        _observer.schedule(handler, folder, recursive=False)

    thread = threading.Thread(target=_observer.start, daemon=True)
    thread.start()


def stop_watching():
    _observer.stop()
    _observer.join()


def add_folder(folder, on_new_file):
    handler = NewFileHandler(on_new_file)
    _observer.schedule(handler, folder, recursive=False)
