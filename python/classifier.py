"""AI-based file classification using Ollama with extension fallback."""

import json
import logging
import requests

logger = logging.getLogger("deskbutler.classifier")

OLLAMA_BASE = "http://127.0.0.1:11434"
OLLAMA_URL = f"{OLLAMA_BASE}/api/generate"
DEFAULT_MODEL = "llama3.2"

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


def get_ollama_status(model=None):
    """Check Ollama status and available models."""
    model = model or DEFAULT_MODEL
    result = {"running": False, "models": [], "selected_model_available": False}
    try:
        resp = requests.get(f"{OLLAMA_BASE}/api/tags", timeout=3)
        if resp.ok:
            result["running"] = True
            models = [m["name"] for m in resp.json().get("models", [])]
            result["models"] = models
            result["selected_model_available"] = any(model in m for m in models)
    except Exception:
        pass
    return result


def pull_model(model=None):
    """Pull a model from Ollama. Returns success/error."""
    model = model or DEFAULT_MODEL
    try:
        resp = requests.post(
            f"{OLLAMA_BASE}/api/pull",
            json={"name": model, "stream": False},
            timeout=300,
        )
        resp.raise_for_status()
        return {"ok": True, "model": model}
    except Exception as e:
        logger.error(f"Failed to pull model {model}: {e}")
        return {"ok": False, "error": str(e)}


def _classify_with_ollama(file_meta, model=None):
    """Ask Ollama to classify a file based on its metadata."""
    model = model or DEFAULT_MODEL
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
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=10,
        )
        resp.raise_for_status()
        text = resp.json().get("response", "")

        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            result = json.loads(text[start:end])
            category = result.get("category", "Other")
            reason = result.get("reason", f"AI classified as {category}")
            return {"category": category, "confidence": 0.85, "reason": reason}
    except Exception as e:
        logger.debug(f"Ollama classification failed: {e}")

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


def classify(file_meta, model=None):
    """Classify a file. Tries Ollama first, falls back to extension matching."""
    result = _classify_with_ollama(file_meta, model=model)
    if result:
        return result
    return _classify_by_extension(file_meta)


def is_ollama_available():
    """Check if Ollama is running and the default model is available."""
    status = get_ollama_status()
    return status["running"] and status["selected_model_available"]


def parse_rule_prompt(prompt, model=None):
    """Use Ollama to parse a natural language rule description into structured JSON."""
    model = model or DEFAULT_MODEL
    system_prompt = (
        "Extract a file organization rule from the user's instruction. "
        "Return ONLY a JSON object with these fields:\n"
        '{"name": "short rule name", "condition": "glob pattern like *.pdf", "destination": "target folder path"}\n'
        "If the user mentions a file type, convert it to a glob pattern (e.g. PDFs -> *.pdf, images -> *.jpg;*.png).\n"
        "If the destination is relative (like 'Documents' or 'reports'), use it as-is."
    )

    try:
        resp = requests.post(
            OLLAMA_URL,
            json={
                "model": model,
                "prompt": f"{system_prompt}\n\nUser instruction: {prompt}",
                "stream": False,
            },
            timeout=15,
        )
        resp.raise_for_status()
        text = resp.json().get("response", "")

        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            parsed = json.loads(text[start:end])
            if "name" in parsed and "condition" in parsed and "destination" in parsed:
                return {"ok": True, "rule": parsed}
            return {"ok": False, "error": "Incomplete rule parsed", "raw": text}
        return {"ok": False, "error": "No JSON found in response", "raw": text}
    except Exception as e:
        logger.error(f"Rule parsing failed: {e}")
        return {"ok": False, "error": str(e)}
