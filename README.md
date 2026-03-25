<div align="center">

# 🎩 DeskButler

### *Your AI-Powered File Organization Assistant*

**Smart • Intelligent • Cross-Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.10+-green.svg)](https://www.python.org/)
[![Tauri](https://img.shields.io/badge/Tauri-1.6-orange.svg)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)

---

**DeskButler** is a smart, AI-powered desktop file organizer that watches your folders, suggests where files should go, and moves them only when you approve. 

### ✨ Files are **NEVER** moved without your explicit permission ✨

</div>

---

## 🚀 Features

<table>
<tr>
<td width="50%">

### 🔍 **Intelligent Watching**
Monitors your folders in real-time and detects new files instantly

### 🤖 **AI-Powered Analysis**
Uses machine learning to understand file types, content, and metadata

</td>
<td width="50%">

### 💡 **Smart Suggestions**
Recommends optimal locations based on patterns and learned habits

### ↩️ **One-Click Undo**
Complete history tracking with instant rollback capability

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

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

### 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   React UI  │ ←──→│  Tauri/Rust  │ ←──→│  Flask API      │
│  (Frontend) │     │  (Desktop)   │     │  (Python 3)     │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                                    ┌──────────────┴─────────────┐
                                    │                            │
                              ┌─────▼─────┐            ┌────────▼────────┐
                              │  SQLite   │            │   AI Engine     │
                              │  Database │            │  • watchdog     │
                              └───────────┘            │  • scikit-learn │
                                                       └─────────────────┘
```

**How it connects:** Tauri spawns Python as a sidecar process. Communication flows through local HTTP (port 7342) between Rust commands and the Flask server.

---

## 📁 Project Structure

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

---

## ⚙️ Setup

### 📋 Prerequisites

- **Node.js** 18+
- **Rust** (via [rustup](https://rustup.rs))
- **Python** 3.10+
- **Tauri CLI** prerequisites: [platform-specific guide](https://tauri.app/v1/guides/getting-started/prerequisites)

### 📦 Install

```bash
cd deskbutler

# Frontend dependencies
npm install

# Python dependencies
pip install -r python/requirements.txt
```

### ▶️ Run Development Mode

```bash
# Start the Python backend
python python/main.py

# In another terminal, start the Tauri app
npm run tauri dev
```

### 🏗️ Build for Production

```bash
npm run tauri build
```

📦 **Output:** The installer will be in `src-tauri/target/release/bundle/`

**Installer size:** ~10MB (thanks to Tauri's efficiency!)

---

## 🔄 How It Works

<div align="center">

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   1. WATCH  │  →   │  2. DETECT   │  →   │  3. ANALYZE  │
│   Folders   │      │  New Files   │      │  Metadata    │
└─────────────┘      └──────────────┘      └──────────────┘
                                                    ↓
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   6. UNDO   │  ←   │  5. EXECUTE  │  ←   │  4. SUGGEST  │
│   Anytime   │      │  (If Approved)│      │  Destination │
└─────────────┘      └──────────────┘      └──────────────┘
```

</div>

1. 👀 **Watch** — Add folders for DeskButler to monitor
2. 🔍 **Detect** — New or moved files are picked up instantly by watchdog
3. 🧠 **Analyze** — Files are examined for type, extension, size, content, and metadata
4. 💡 **Suggest** — DeskButler presents a card showing the file and its recommended destination
5. ✅ **You Decide** — Click **"Yes, move it"** or **"No thanks"** – you're always in control
6. ↩️ **Undo** — Every move is logged and can be reversed with one click from the History page

---

## 📱 Application Pages

<table>
<tr>
<td align="center" width="20%">
<h3>🏠 Home</h3>
Shows pending suggestions as approval cards
</td>
<td align="center" width="20%">
<h3>📂 Folders</h3>
Add/remove watched folders for monitoring
</td>
<td align="center" width="20%">
<h3>📋 Rules</h3>
Create custom glob-based rules<br/>
<code>*.pdf → Documents/PDFs</code>
</td>
<td align="center" width="20%">
<h3>🕒 History</h3>
View all past moves with one-click undo
</td>
<td align="center" width="20%">
<h3>⚙️ Settings</h3>
Configure startup behavior and notifications
</td>
</tr>
</table>

---

## 🎯 Use Cases

- 📥 **Download Organization**: Automatically sort downloads into proper folders
- 📸 **Photo Management**: Organize images by date, resolution, or content
- 📄 **Document Filing**: Sort PDFs, Word docs, and spreadsheets intelligently
- 🎵 **Media Library**: Keep music and videos organized by type and metadata
- 🧹 **Desktop Cleanup**: Maintain a clutter-free workspace automatically

---

## 🔒 Privacy & Security

- ✅ **100% Local Processing** – No cloud, no external servers
- ✅ **Your Files Stay Private** – All analysis happens on your machine
- ✅ **No Data Collection** – Zero telemetry or tracking
- ✅ **Full Control** – Files are never moved without your approval

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit pull requests
- 📖 Improve documentation

---

## 📝 License

This project is licensed under the **MIT License** – see the LICENSE file for details.

---

<div align="center">

**Made with ❤️ for organized digital spaces**

⭐ **Star this repo if you find it helpful!** ⭐

</div>


