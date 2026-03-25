"""AI-based file classification using Ollama with extension fallback."""

import json
import requests

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
OLLAMA_MODEL = "llama3.2"

# Extension-based fallback mapping
DEFAULT_CATEGORIES = {
    ".pdf": "Documents",
    ".doc": "Documents",
    ".docx": "Documents",
    ".txt": "Documents",
    ".rtf": "Documents",
    ".odt": "Documents",
    ".xlsx": "Spreadsheets",
    ".xls": "Spreadsheets",
    ".csv": "Spreadsheets",
    ".jpg": "Images",
    ".jpeg": "Images",
    ".png": "Images",
    ".gif": "Images",
    ".svg": "Images",
    ".webp": "Images",
    ".bmp": "Images",
    ".mp4": "Videos",
    ".mov": "Videos",
    ".avi": "Videos",
    ".mkv": "Videos",
    ".webm": "Videos",
    ".mp3": "Music",
    ".wav": "Music",
    ".flac": "Music",
    ".aac": "Music",
    ".ogg": "Music",
    ".zip": "Archives",
    ".rar": "Archives",
    ".7z": "Archives",
    ".tar": "Archives",
    ".gz": "Archives",
    ".exe": "Installers",
    ".msi": "Installers",
    ".dmg": "Installers",
    ".deb": "Installers",
    ".py": "Code",
    ".js": "Code",
    ".ts": "Code",
    ".html": "Code",
    ".css": "Code",
    ".java": "Code",
    ".cpp": "Code",
    ".rs": "Code",
    ".go": "Code",
}


def _classify_with_ollama(file_meta):
    """Ask Ollama to classify a file based on its metadata."""
    prompt = (
        f"Classify this file into exactly ONE category. "
        f"Choose from: Documents, Spreadsheets, Images, Videos, Music, Archives, Installers, Code, Other.\n\n"
        f"File: {file_meta['name']}\n"
        f"Extension: {file_meta['ext']}\n"
        f"MIME type: {file_meta['mime']}\n"
        f"Size: {file_meta['size']} bytes\n\n"
        f"Respond with ONLY a JSON object: {{\"category\": \"...\", \"reason\": \"...\"}}"
    )

    try:
        resp = requests.post(
            OLLAMA_URL,
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
            timeout=10,
        )
        resp.raise_for_status()
        text = resp.json().get("response", "")

        # Parse JSON from response
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            result = json.loads(text[start:end])
            category = result.get("category", "Other")
            reason = result.get("reason", f"AI classified as {category}")
            return {"category": category, "confidence": 0.85, "reason": reason}
    except Exception:
        pass

    return None


def _classify_by_extension(file_meta):
    """Fallback: classify by file extension."""
    ext = file_meta.get("ext", "").lower()
    category = DEFAULT_CATEGORIES.get(ext, "Other")
    return {
        "category": category,
        "confidence": 0.9 if ext in DEFAULT_CATEGORIES else 0.3,
        "reason": f"{file_meta['ext']} file -> {category}",
    }


def classify(file_meta):
    """Classify a file. Tries Ollama first, falls back to extension matching."""
    result = _classify_with_ollama(file_meta)
    if result:
        return result
    return _classify_by_extension(file_meta)


def is_ollama_available():
    """Check if Ollama is running and the model is available."""
    try:
        resp = requests.get("http://127.0.0.1:11434/api/tags", timeout=3)
        if resp.ok:
            models = [m["name"] for m in resp.json().get("models", [])]
            return any(OLLAMA_MODEL in m for m in models)
    except Exception:
        pass
    return False
