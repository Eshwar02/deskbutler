"""HTTP server for Tauri <-> Python communication."""

import uuid
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from history import HistoryDB
from organizer import move_file, undo_file_move
from rules import RuleEngine
from analyzer import analyze_file
from classifier import classify
from watcher import start_watching, add_folder as watch_add_folder

app = Flask(__name__)
CORS(app)

db = HistoryDB()
rule_engine = RuleEngine(db)

# In-memory suggestion queue (populated by watcher/analyzer)
suggestions = []


def _on_new_file(path):
    """Called by the watcher when a new file appears in a watched folder."""
    if not os.path.isfile(path):
        return

    meta = analyze_file(path)

    # Check user rules first
    rule_dest = rule_engine.match(meta)
    if rule_dest:
        dest_path = os.path.join(rule_dest, meta["name"])
        reason = "Matched your rule"
        confidence = 1.0
    else:
        result = classify(meta)
        category = result["category"]
        confidence = result["confidence"]
        if category == "Other":
            return  # Don't suggest if we're not confident

        # Build destination: watched folder / category subfolder / filename
        watched_folder = os.path.dirname(path)
        dest_folder = os.path.join(watched_folder, category)
        dest_path = os.path.join(dest_folder, meta["name"])
        reason = result.get("reason", f"Looks like a {category} file ({meta['ext']})")

    # Don't suggest moving to the same location
    if os.path.normpath(dest_path) == os.path.normpath(path):
        return

    # Don't duplicate suggestions for the same file
    for s in suggestions:
        if os.path.normpath(s["from_path"]) == os.path.normpath(path):
            return

    suggestions.append({
        "id": str(uuid.uuid4()),
        "filename": meta["name"],
        "from_path": path,
        "to_path": dest_path,
        "reason": reason,
        "confidence": confidence,
    })


def register_watcher(database=None):
    """Start watching all saved folders."""
    folders = db.get_watched_folders()
    paths = [f["path"] for f in folders if f.get("enabled", 1)]
    if paths:
        start_watching(folders=paths, on_new_file=_on_new_file)


# --- API Routes ---

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/suggestions", methods=["GET"])
def get_suggestions():
    return jsonify(suggestions)


@app.route("/suggestions/approve", methods=["POST"])
def approve_suggestion():
    sid = request.json.get("id")
    for s in suggestions:
        if s["id"] == sid:
            try:
                actual_dst = move_file(s["from_path"], s["to_path"])
                s["to_path"] = actual_dst
                db.record_move(s)
                suggestions.remove(s)
                return jsonify({"ok": True})
            except Exception as e:
                return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Not found"}), 404


@app.route("/suggestions/reject", methods=["POST"])
def reject_suggestion():
    sid = request.json.get("id")
    suggestions[:] = [s for s in suggestions if s["id"] != sid]
    return jsonify({"ok": True})


@app.route("/folders", methods=["GET"])
def get_folders():
    return jsonify(db.get_watched_folders())


@app.route("/folders", methods=["POST"])
def add_folder():
    path = request.json.get("path")
    if not path or not os.path.isdir(path):
        return jsonify({"error": "Invalid folder path"}), 400
    db.add_watched_folder(path)
    watch_add_folder(path, _on_new_file)
    return jsonify({"ok": True})


@app.route("/folders/remove", methods=["POST"])
def remove_folder():
    path = request.json.get("path")
    db.remove_watched_folder(path)
    return jsonify({"ok": True})


@app.route("/history", methods=["GET"])
def get_history():
    return jsonify(db.get_history())


@app.route("/history/undo", methods=["POST"])
def undo():
    mid = request.json.get("id")
    entry = db.get_move(mid)
    if entry:
        undo_file_move(entry)
        db.mark_undone(mid)
        return jsonify({"ok": True})
    return jsonify({"error": "Not found"}), 404


@app.route("/rules", methods=["GET"])
def get_rules():
    return jsonify(rule_engine.get_rules())


@app.route("/rules", methods=["POST"])
def add_rule_route():
    data = request.json
    rule_engine.add_rule(data["name"], data["condition"], data["destination"])
    return jsonify({"ok": True})


@app.route("/rules/delete", methods=["POST"])
def delete_rule_route():
    rule_engine.delete_rule(request.json.get("id"))
    return jsonify({"ok": True})


@app.route("/settings", methods=["GET"])
def get_settings():
    return jsonify(db.get_settings())


@app.route("/settings", methods=["POST"])
def save_settings():
    data = request.json
    for key, value in data.items():
        db.set_setting(key, value)
    return jsonify({"ok": True})
