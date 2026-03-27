<div align="center">

# 🎩 DeskButler

### *Your AI-Powered File Organization Assistant*

**Smart • Intelligent • Premium UI • Cross-Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.10+-green.svg)](https://www.python.org/)
[![Tauri](https://img.shields.io/badge/Tauri-1.6-orange.svg)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Version](https://img.shields.io/badge/Version-0.2.0-purple.svg)](https://github.com/Eshwar02/deskbutler)

---

**DeskButler** is a smart, AI-powered desktop file organizer with a **premium glassmorphism UI** that watches your folders, suggests where files should go, and moves them only when you approve. 

### ✨ Files are **NEVER** moved without your explicit permission ✨

</div>

---

## 🎨 Premium Design

<table>
<tr>
<td width="50%">

### 🌟 **Glassmorphism UI**
Beautiful backdrop blur effects with layered transparency matching industry-leading apps (Notion, Linear, Figma)

### ⚡ **Smooth Animations**
60fps transitions with GPU-accelerated effects — skeleton loaders, shimmer effects, hover scale, click compression, and glow micro-interactions

</td>
<td width="50%">

### 🎯 **Reusable Component Library**
Premium Button (variants, ripple), Card (hover lift, gradients), Input (floating labels), Toggle, Modal (blur backdrop), Dropdown (keyboard nav), and Toast (auto-dismiss, stacking)

### 🎨 **Dark & Light Themes**
Carefully crafted color system with gradient text, glassmorphism, and proper visual hierarchy — toggle themes with persistence

</td>
</tr>
</table>

---

## 🚀 Features

<table>
<tr>
<td width="50%">

### 🔍 **Intelligent Watching**
Monitors your folders in real-time and detects new files instantly via watchdog

### 🤖 **AI-Powered Analysis**
Uses Ollama (llama3.2) for intelligent file classification with confidence scoring and extension-based fallback

### 🎛️ **One-Click Ollama Control**
Start/stop Ollama server, pull models, select models, and view installed models — all from the app

### 💡 **Smart Suggestions**
Recommends optimal locations based on user rules first, then AI classification as fallback

### 🔎 **Command Palette**
Quick-access command palette (Cmd/Ctrl+K) with fuzzy search, categories, and recent search history

### 🖥️ **System Tray Integration**
Runs in the background with a system tray icon — double-click to show, right-click for Show/Quit

</td>
<td width="50%">

### ↩️ **One-Click Undo**
Complete history tracking with search, filtering, and instant rollback capability

### ⚙️ **Auto-Launch Support**
Cross-platform startup behavior — Windows Registry, macOS LaunchAgents, Linux XDG autostart

### 🎨 **Theme Toggle**
Switch between dark and light modes with smooth CSS transitions and persistence

### ⌨️ **Keyboard Shortcuts**
Cmd/Ctrl+K for command palette, Cmd/Ctrl+B for sidebar toggle, number shortcuts for navigation

### 🔔 **Desktop Notifications**
Get notified when new file suggestions are ready — configurable in Settings

### 📂 **Drag & Drop Folders**
Add watched folders by dragging them into the app or using the native browse dialog

</td>
</tr>
</table>

<table>
<tr>
<td width="50%">

### 🧠 **AI + Manual Rules**
Create rules via natural language (e.g., *"Move all PDFs to Documents"*) or manual glob patterns — AI parses your intent via Ollama

### 📊 **Rich File Metadata**
Extracts EXIF data from images (camera, GPS, dimensions), PDF metadata (pages, author, title), and MIME types

</td>
<td width="50%">

### 📁 **Safe File Handling**
Duplicate filenames are auto-resolved by appending (2), (3), etc. — files are never overwritten

### ⚡ **Smart Polling & Performance**
Real-time polling pauses when the tab is hidden and resumes on focus — skeleton loaders and GPU-accelerated animations keep the UI fluid

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Desktop Shell | **Tauri 1.6** (Rust) | Native app window, system tray, ~82MB installer |
| Frontend | **React 18** + **Vite 5** | Premium UI with glassmorphism design |
| Routing | **React Router v6** | Client-side page navigation with lazy loading |
| Styling | **CSS Modules** + **Design System** | Premium glassmorphism with dark/light themes |
| Icons | **Lucide React** | Modern, consistent icon library |
| Backend | **Python 3** + **Flask** | HTTP API server (port 7342) |
| File Watching | **watchdog** | Real-time folder monitoring |
| Database | **SQLite** | Move history, rules, watched folders, settings |
| File Analysis | **python-magic**, **Pillow**, **pdfplumber** | MIME detection, image/PDF metadata |
| AI Classification | **Ollama** (llama3.2) | Natural language rule parsing + file categorization |
| Auto-Launch | **Platform-specific** | Windows Registry, macOS LaunchAgents, Linux XDG |

### 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   React UI      │ ←──→│  Tauri/Rust  │ ←──→│  Flask API      │
│  (Premium UI)   │     │  (Desktop)   │     │  (Python 3)     │
│  Glassmorphism  │     │  System Tray │     │  Port 7342      │
└─────────────────┘     └──────────────┘     └────────┬────────┘
                                                       │
                                     ┌─────────────────┴──────────────┐
                                     │                                │
                              ┌──────▼─────┐              ┌───────────▼─────────┐
                              │  SQLite    │              │   AI Engine         │
                              │  Database  │              │  • Ollama (llama3.2)│
                              │  Settings  │              │  • watchdog         │
                              └────────────┘              │  • File Analysis    │
                                                          └─────────────────────┘
```

**How it connects:** Tauri spawns Python as a sidecar process. Communication flows through local HTTP (port 7342) via 23 Rust commands bridging to 23 Flask API endpoints. Ollama runs as a separate service for AI features.

---

## 📁 Project Structure

```
deskbutler/
├── src/                    # React frontend
│   ├── components/         # Dashboard, Sidebar, SuggestionCard, etc.
│   │   └── ui/             # Reusable UI library (Button, Card, Input, Toggle, Modal, Dropdown, Toast)
│   ├── hooks/              # Custom hooks (useDebounce, usePageVisibility, useTheme, etc.)
│   ├── styles/global.css   # Design system with dark/light themes
│   └── utils/              # Tauri invoke helpers, performance monitoring
├── src-tauri/              # Tauri / Rust backend
│   ├── src/main.rs         # App entry point with system tray & sidecar management
│   ├── src/commands.rs     # 23 Tauri commands bridging to Python
│   └── src/tray.rs         # System tray menu (Show / Quit)
├── python/                 # Python backend engine
│   ├── server.py           # Flask API (23 endpoints, port 7342)
│   ├── watcher.py          # Folder watcher (watchdog)
│   ├── analyzer.py         # File type, EXIF, PDF metadata analysis
│   ├── classifier.py       # AI classification + extension-based fallback
│   ├── rules.py            # User-defined rule engine (fnmatch)
│   ├── organizer.py        # File move/rename with duplicate resolution
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
Time-based greeting, stat cards (files organized, active rules, pending actions, watched folders), backend & Ollama status indicators, suggestion approval cards
</td>
<td align="center" width="20%">
<h3>📂 Folders</h3>
Add/remove watched folders via drag & drop or native browse dialog, folder status indicators, smooth animations
</td>
<td align="center" width="20%">
<h3>📋 Rules</h3>
Split-panel layout with AI-powered NLP or manual glob creation<br/>
<code>*.pdf → Documents/PDFs</code>
</td>
<td align="center" width="20%">
<h3>🕒 History</h3>
Timeline layout with categorized file icons, search & filter, relative timestamps, one-click undo
</td>
<td align="center" width="20%">
<h3>⚙️ Settings</h3>
Auto-launch toggle, Ollama model management, theme, notifications, and data path display
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


