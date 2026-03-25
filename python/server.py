"""HTTP server for Tauri ↔ Python communication."""

from flask import Flask, jsonify, request
from history import HistoryDB
from organizer import move_file, undo_file_move
from rules import RuleEngine

app = Flask(__name__)
db = HistoryDB()
rule_engine = RuleEngine(db)

# In-memory suggestion queue (populated by watcher/analyzer)
suggestions = []


@app.route("/suggestions", methods=["GET"])
def get_suggestions():
    return jsonify(suggestions)


@app.route("/suggestions/approve", methods=["POST"])
def approve_suggestion():
    sid = request.json.get("id")
    for s in suggestions:
        if s["id"] == sid:
            move_file(s["from_path"], s["to_path"])
            db.record_move(s)
            suggestions.remove(s)
            return jsonify({"ok": True})
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
    db.add_watched_folder(path)
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
