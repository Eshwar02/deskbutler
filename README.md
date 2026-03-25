# DeskButler

Smart, AI-powered desktop file organizer. Watches your folders, suggests where files should go, and moves them only when you say yes. Files are **never** moved without your approval.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Desktop Shell | **Tauri 1.6** (Rust) | Native app window, system tray, ~10MB installer |
| Frontend | **React 18** + **Vite 5** | UI components and user interaction |
| Routing | **React Router v6** | Client-side page navigation |
| Backend | **Python 3** + **Flask** | HTTP API server (port 7342) |
| File Watching | **watchdog** | Real-time folder monitoring |
| Database | **SQLite** | Move history, rules, watched folders |
| File Analysis | **python-magic**, **Pillow**, **pdfplumber** | MIME detection, image/PDF metadata |
| Classification | **scikit-learn** | AI-based file categorization |

### Architecture

```
React (UI)  ←→  Tauri (Rust)  ←→  Python (Flask API)
                                       ↓
                                   SQLite DB
                                   watchdog (folder monitoring)
                                   scikit-learn (classification)
```

Tauri spawns Python as a sidecar process. Communication flows through local HTTP between Rust commands and the Flask server.

## Project Structure

```
deskbutler/
├── src/                    # React frontend
│   ├── components/         # Dashboard, Sidebar, SuggestionCard, etc.
│   ├── styles/global.css   # Dark theme UI
│   └── utils/tauri.js      # Tauri invoke helpers
├── src-tauri/              # Tauri / Rust backend
│   ├── src/main.rs         # App entry point with system tray
│   ├── src/commands.rs     # 12 Tauri commands bridging to Python
│   └── src/tray.rs         # System tray menu (Show / Quit)
├── python/                 # Python backend engine
│   ├── server.py           # Flask API endpoints
│   ├── watcher.py          # Folder watcher (watchdog)
│   ├── analyzer.py         # File type & metadata analysis
│   ├── classifier.py       # AI file classification
│   ├── rules.py            # User-defined rule engine (fnmatch)
│   ├── organizer.py        # File move/rename executor
│   └── history.py          # SQLite persistence layer
├── package.json
└── vite.config.js
```

## Setup

### Prerequisites

- **Node.js** 18+
- **Rust** (via [rustup](https://rustup.rs))
- **Python** 3.10+
- **Tauri CLI** prerequisites: [platform-specific guide](https://tauri.app/v1/guides/getting-started/prerequisites)

### Install

```bash
cd deskbutler

# Frontend dependencies
npm install

# Python dependencies
pip install -r python/requirements.txt
```

### Run

```bash
# Start the Python backend
python python/main.py

# In another terminal, start the Tauri app
npm run tauri dev
```

### Build for Production

```bash
npm run tauri build
```

The installer will be in `src-tauri/target/release/bundle/`.

## How It Works

1. **Watch** — You add folders for DeskButler to monitor
2. **Detect** — New or moved files are picked up instantly by watchdog
3. **Analyze** — Files are checked for type, extension, size, and metadata
4. **Suggest** — DeskButler shows a card: the file, where it is, and where it should go
5. **You decide** — Click "Yes, move it" or "No thanks"
6. **Undo** — Every move is logged and can be reversed from the History page

## Pages

| Page | What it does |
|------|-------------|
| **Home** | Shows pending suggestions as approval cards |
| **Folders** | Add/remove watched folders |
| **Rules** | Create glob-based rules (e.g. `*.pdf` → `C:\Documents\PDFs`) |
| **History** | See all past moves with one-click undo |
| **Settings** | Start on boot, notification preferences |

## License

MIT
