"""DeskButler Python backend — entry point."""

from server import app
from watcher import start_watching

if __name__ == "__main__":
    start_watching()
    app.run(host="127.0.0.1", port=7342, debug=False)
