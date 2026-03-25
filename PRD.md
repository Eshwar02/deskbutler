# DeskButler — Product Requirements Document

## 1. Overview

**Product Name:** DeskButler
**Version:** 0.1.0
**Type:** Desktop application (Windows, macOS, Linux)

DeskButler is a smart desktop file organizer that watches user-specified folders, analyzes new files, and suggests where to move them. The user must approve every suggestion before any file is moved. The app runs quietly in the system tray and surfaces suggestions through a clean, friendly UI.

### Problem Statement

Desktop and Downloads folders become cluttered over time. Users waste minutes every day manually sorting files into the right places. Existing tools either auto-move files without asking (risky) or require complex manual rule setup (tedious).

### Solution

DeskButler sits in between — it watches, learns, and suggests, but never acts without permission. It combines simple user-defined rules with AI classification to handle both predictable patterns and edge cases.

---

## 2. Target Users

| Persona | Description |
|---------|-------------|
| **Casual user** | Downloads lots of files, Desktop is always messy, wants a "just fix it" button with safety |
| **Knowledge worker** | Deals with PDFs, spreadsheets, reports daily, wants consistent file organization |
| **Developer** | Downloads packages, screenshots, docs — wants rules-based sorting they control |
| **Student** | Homework, lecture slides, research papers scattered across Downloads |

### User Expectations

- Zero learning curve — the UI should explain itself
- No files moved without explicit approval
- Easy undo if something goes wrong
- Lightweight — should not slow down the computer

---

## 3. Goals and Success Metrics

### Goals

1. Reduce time users spend manually organizing files
2. Keep watched folders tidy with minimal user effort
3. Build user trust through a suggestion-first, never-auto-move approach
4. Run efficiently in the background with minimal resource usage

### Success Metrics

| Metric | Target |
|--------|--------|
| Suggestion acceptance rate | > 70% (indicates good classification) |
| Average time from file detected to suggestion shown | < 3 seconds |
| Memory usage while idle | < 50 MB |
| Installer size | < 15 MB |
| Undo usage rate | < 10% (indicates moves are correct) |

---

## 4. Features

### 4.1 Folder Watching

**Priority:** P0 (must-have)

- User adds one or more folders to watch (e.g., Desktop, Downloads)
- Watcher detects new files, renamed files, and moved-in files in real time
- Watcher runs in the background even when the main window is closed
- User can enable/disable watching per folder
- Does NOT watch subfolders by default (configurable later)

### 4.2 File Analysis

**Priority:** P0

- Detect file type via extension and MIME type
- Extract basic metadata: size, creation date, modification date
- For images: dimensions, format
- For PDFs: page count, title if available
- For archives: list contents (future)

### 4.3 File Classification

**Priority:** P0

- Map file extensions to categories (Documents, Images, Videos, Music, Archives, Code, Installers, Other)
- Return a confidence score for each classification
- Provide a human-readable reason for each suggestion (e.g., "This is a PDF — it belongs in Documents")

### 4.4 Rule Engine

**Priority:** P0

- Users create rules with: name, file pattern (glob), destination folder
- Rules are checked before AI classification (user rules take priority)
- Glob matching (e.g., `*.pdf`, `report_*.xlsx`, `screenshot*`)
- Rules can be enabled/disabled individually
- Rules are persisted in SQLite

### 4.5 Suggestion Cards

**Priority:** P0

- Each suggestion shows:
  - File name
  - Current location (from)
  - Suggested destination (to)
  - Reason / category
  - Confidence indicator
- Two actions: "Yes, move it" and "No thanks"
- Suggestions appear on the Dashboard
- Desktop notification when new suggestions arrive (optional)

### 4.6 File Moving

**Priority:** P0

- Files are moved only after user clicks "Yes, move it"
- Destination directory is created automatically if it doesn't exist
- If a file with the same name exists at the destination, append a number (e.g., `report (2).pdf`)
- Move is logged to history with timestamp

### 4.7 History and Undo

**Priority:** P0

- Every move is recorded: file name, from path, to path, timestamp
- History page shows all past moves in reverse chronological order
- One-click undo: moves the file back to its original location
- Undone moves are visually marked

### 4.8 System Tray

**Priority:** P1

- App minimizes to system tray instead of closing
- Tray icon with context menu: Show, Quit
- Double-click tray icon to open main window
- Badge or notification on new suggestions

### 4.9 Settings

**Priority:** P1

- Start on system boot (auto-launch)
- Enable/disable desktop notifications
- Default destination base folder
- Theme (dark only for v0.1, light theme later)

### 4.10 Learned Patterns (Future)

**Priority:** P2

- Track which suggestions users accept and reject
- Over time, improve classification based on user behavior
- Use scikit-learn to build a per-user model
- "DeskButler is learning your preferences" indicator

---

## 5. User Flows

### 5.1 First Launch

```
Open app → Welcome screen → "Add your first folder" prompt
  → User picks Desktop or Downloads
  → Watcher starts
  → Dashboard shows "Watching! Suggestions will appear here."
```

### 5.2 New File Detected

```
File lands in watched folder
  → Watcher picks it up
  → Analyzer extracts metadata
  → Rule engine checks for matching rules
  → If no rule matches, classifier suggests a category
  → Suggestion card appears on Dashboard
  → (Optional) Desktop notification
```

### 5.3 Approving a Suggestion

```
User sees suggestion card on Dashboard
  → Clicks "Yes, move it"
  → File is moved to suggested destination
  → Card disappears
  → Entry added to History
```

### 5.4 Rejecting a Suggestion

```
User sees suggestion card
  → Clicks "No thanks"
  → Card disappears
  → File stays where it is
  → Rejection logged for future learning
```

### 5.5 Undoing a Move

```
User goes to History page
  → Finds a past move
  → Clicks "Undo"
  → File is moved back to original location
  → Entry marked as "Undone"
```

---

## 6. UI Pages

| Page | Purpose | Key Elements |
|------|---------|-------------|
| **Dashboard** | Home screen, shows pending suggestions | Suggestion cards, stats summary |
| **Folders** | Manage watched folders | Folder list, add/remove buttons |
| **Rules** | Create and manage organization rules | Rule form (name, pattern, destination), rule list |
| **History** | View past moves | Chronological list, undo buttons |
| **Settings** | Configure app behavior | Toggle switches for preferences |

### Design Principles

- Dark theme, clean and modern
- Friendly language — no technical jargon in the UI
- "Yes, move it" not "Approve suggestion"
- "No thanks" not "Reject"
- "Undo" not "Revert operation"
- Clear visual hierarchy — the next action should always be obvious

---

## 7. Technical Architecture

### Stack

| Component | Technology |
|-----------|-----------|
| Desktop shell | Tauri 1.6 (Rust) |
| Frontend | React 18, Vite 5, React Router v6 |
| Backend | Python 3.10+, Flask |
| File watching | watchdog |
| Classification | scikit-learn |
| File analysis | python-magic, Pillow, pdfplumber |
| Database | SQLite |
| IPC | Local HTTP (localhost:7342) |

### Communication Flow

```
User action (React)
  → Tauri command (Rust)
    → HTTP request to Python Flask API
      → Business logic (analyze, classify, move)
      → SQLite read/write
    ← JSON response
  ← Result to React
→ UI update
```

### Why Tauri

- ~10 MB installer (vs ~150 MB for Electron)
- ~30 MB RAM idle (vs ~150 MB for Electron)
- Native OS webview, no bundled Chromium
- Rust backend for fast file operations
- Critical for a 24/7 background app

---

## 8. Data Model

### history

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | UUID |
| filename | TEXT | File name |
| from_path | TEXT | Original full path |
| to_path | TEXT | Destination full path |
| moved_at | TEXT | ISO 8601 timestamp |
| undone | INTEGER | 0 = active, 1 = undone |

### watched_folders

| Column | Type | Description |
|--------|------|-------------|
| path | TEXT (PK) | Folder path |
| enabled | INTEGER | 1 = active, 0 = paused |

### rules

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | UUID |
| name | TEXT | Human-readable rule name |
| condition | TEXT | Glob pattern (e.g., `*.pdf`) |
| destination | TEXT | Target folder path |
| enabled | INTEGER | 1 = active, 0 = disabled |

---

## 9. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Startup time | < 2 seconds to main window |
| Idle CPU usage | < 1% |
| Idle memory | < 50 MB |
| File detection latency | < 1 second after file appears |
| Suggestion generation | < 3 seconds after detection |
| Supported OS | Windows 10+, macOS 12+, Ubuntu 22+ |
| Installer size | < 15 MB (excluding Python runtime) |
| Offline operation | Fully functional without internet |

---

## 10. Security and Privacy

- All file analysis happens locally — no data leaves the machine
- No cloud services, no telemetry, no accounts
- SQLite database stored in app data directory
- File moves use OS-level operations (shutil) — no custom file handling
- No elevated permissions required (operates on user-accessible folders only)

---

## 11. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| User accidentally approves wrong move | File in wrong place | One-click undo in History |
| Python sidecar fails to start | Backend unavailable | Show clear error message, retry button |
| Watched folder is on a network drive | Slow/unreliable detection | Warn user, suggest local folders |
| File is in use when move is attempted | Move fails | Catch error, retry later, notify user |
| Duplicate file names at destination | Overwrite risk | Auto-append number to filename |
| Large folders overwhelm suggestion queue | UI floods with cards | Batch processing, limit visible suggestions |

---

## 12. Roadmap

### v0.1 — Foundation (current)

- Folder watching and file detection
- Extension-based classification
- User-defined glob rules
- Suggestion cards with approve/reject
- Move history with undo
- System tray
- Dark theme UI

### v0.2 — Smarter

- Content-aware classification (read PDF titles, image EXIF)
- Learned patterns from user accept/reject history
- Bulk approve/reject
- Search in history
- Folder statistics on dashboard

### v0.3 — Polished

- Light theme option
- First-launch onboarding wizard
- Drag-and-drop folder adding
- Custom notification sounds
- Keyboard shortcuts
- Export/import rules

### v1.0 — Release

- Auto-updater
- Installer for Windows, macOS, Linux
- Performance optimization for 10,000+ file folders
- Localization (i18n)
- Accessibility (a11y) audit
