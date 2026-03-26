"""DeskButler Python backend — entry point."""

import os
import sys
import logging

# Ensure python/ is on the path when run from project root
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from history import APP_DATA_DIR, DB_PATH, LOG_PATH

# Configure file + console logging
os.makedirs(APP_DATA_DIR, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger("deskbutler")
logger.info(f"App data dir: {APP_DATA_DIR}")
logger.info(f"Database: {DB_PATH}")
logger.info(f"Log file: {LOG_PATH}")

from server import app, register_watcher

if __name__ == "__main__":
    # Start watching any previously saved folders
    register_watcher()

    # Run Flask (blocking)
    logger.info("Starting Flask server on http://127.0.0.1:7342")
    app.run(host="127.0.0.1", port=7342, debug=False, use_reloader=False)
