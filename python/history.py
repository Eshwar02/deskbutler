"""Move history & persistence using SQLite."""

import sqlite3
import uuid
from datetime import datetime

DB_PATH = "deskbutler.db"


class HistoryDB:
    def __init__(self, path=DB_PATH):
        self.conn = sqlite3.connect(path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self._init_tables()

    def _init_tables(self):
        self.conn.executescript("""
            CREATE TABLE IF NOT EXISTS history (
                id TEXT PRIMARY KEY,
                filename TEXT,
                from_path TEXT,
                to_path TEXT,
                moved_at TEXT,
                undone INTEGER DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS watched_folders (
                path TEXT PRIMARY KEY,
                enabled INTEGER DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS rules (
                id TEXT PRIMARY KEY,
                name TEXT,
                condition TEXT,
                destination TEXT,
                enabled INTEGER DEFAULT 1
            );
        """)
        self.conn.commit()

    def record_move(self, suggestion):
        self.conn.execute(
            "INSERT INTO history (id, filename, from_path, to_path, moved_at) VALUES (?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), suggestion["filename"], suggestion["from_path"],
             suggestion["to_path"], datetime.now().isoformat()),
        )
        self.conn.commit()

    def get_history(self):
        rows = self.conn.execute("SELECT * FROM history ORDER BY moved_at DESC").fetchall()
        return [dict(r) for r in rows]

    def get_move(self, move_id):
        row = self.conn.execute("SELECT * FROM history WHERE id = ?", (move_id,)).fetchone()
        return dict(row) if row else None

    def mark_undone(self, move_id):
        self.conn.execute("UPDATE history SET undone = 1 WHERE id = ?", (move_id,))
        self.conn.commit()

    def get_watched_folders(self):
        rows = self.conn.execute("SELECT * FROM watched_folders").fetchall()
        return [dict(r) for r in rows]

    def add_watched_folder(self, path):
        self.conn.execute("INSERT OR IGNORE INTO watched_folders (path) VALUES (?)", (path,))
        self.conn.commit()

    def remove_watched_folder(self, path):
        self.conn.execute("DELETE FROM watched_folders WHERE path = ?", (path,))
        self.conn.commit()

    def get_rules(self):
        rows = self.conn.execute("SELECT * FROM rules").fetchall()
        return [dict(r) for r in rows]

    def save_rule(self, rule):
        self.conn.execute(
            "INSERT INTO rules (id, name, condition, destination, enabled) VALUES (?, ?, ?, ?, ?)",
            (rule["id"], rule["name"], rule["condition"], rule["destination"], int(rule["enabled"])),
        )
        self.conn.commit()

    def delete_rule(self, rule_id):
        self.conn.execute("DELETE FROM rules WHERE id = ?", (rule_id,))
        self.conn.commit()
