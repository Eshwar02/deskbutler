"""DeskButler Python backend — entry point."""

import os
import sys

# Ensure python/ is on the path when run from project root
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server import app, register_watcher

if __name__ == "__main__":
    # Start watching any previously saved folders
    register_watcher()

    # Run Flask (blocking)
    app.run(host="127.0.0.1", port=7342, debug=False, use_reloader=False)
