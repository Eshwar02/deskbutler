"""File analysis — type detection, metadata extraction."""

import os
import mimetypes
import logging
from datetime import datetime

try:
    from PIL import Image
    from PIL.ExifTags import TAGS
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False

try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False

logger = logging.getLogger("deskbutler.analyzer")


def _extract_exif(path):
    """Extract EXIF data from image files."""
    if not PILLOW_AVAILABLE:
        return None
    
    try:
        with Image.open(path) as img:
            exif_data = {}
            
            # Get basic image info
            exif_data["format"] = img.format
            exif_data["width"] = img.width
            exif_data["height"] = img.height
            exif_data["mode"] = img.mode
            
            # Try to get EXIF tags
            exif = img.getexif()
            if exif:
                for tag_id, value in exif.items():
                    tag = TAGS.get(tag_id, tag_id)
                    # Convert bytes to string for serialization
                    if isinstance(value, bytes):
                        try:
                            value = value.decode('utf-8', errors='ignore')
                        except:
                            value = str(value)
                    exif_data[tag] = value
            
            return exif_data
    except Exception as e:
        logger.debug(f"Could not extract EXIF from {path}: {e}")
        return None


def _extract_pdf_metadata(path):
    """Extract metadata from PDF files."""
    if not PDFPLUMBER_AVAILABLE:
        return None
    
    try:
        with pdfplumber.open(path) as pdf:
            metadata = {}
            metadata["pages"] = len(pdf.pages)
            
            # Extract PDF metadata
            if pdf.metadata:
                metadata["pdf_title"] = pdf.metadata.get("Title", "")
                metadata["pdf_author"] = pdf.metadata.get("Author", "")
                metadata["pdf_subject"] = pdf.metadata.get("Subject", "")
                metadata["pdf_creator"] = pdf.metadata.get("Creator", "")
                metadata["pdf_producer"] = pdf.metadata.get("Producer", "")
                metadata["pdf_creation_date"] = pdf.metadata.get("CreationDate", "")
            
            return metadata
    except Exception as e:
        logger.debug(f"Could not extract PDF metadata from {path}: {e}")
        return None


def _detect_mimetype(path):
    """Detect mimetype using python-magic if available, fallback to mimetypes."""
    if MAGIC_AVAILABLE:
        try:
            mime = magic.from_file(path, mime=True)
            if mime:
                return mime
        except Exception as e:
            logger.debug(f"python-magic failed for {path}: {e}")
    
    # Fallback to mimetypes
    mime, _ = mimetypes.guess_type(path)
    return mime or "unknown"


def analyze_file(path):
    """Return metadata about a file including rich EXIF and PDF data."""
    stat = os.stat(path)
    ext = os.path.splitext(path)[1].lower()
    mime = _detect_mimetype(path)

    metadata = {
        "path": path,
        "name": os.path.basename(path),
        "ext": ext,
        "mime": mime,
        "size": stat.st_size,
        "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
    }

    # Extract EXIF data for images
    if ext in [".jpg", ".jpeg", ".png", ".tiff", ".tif", ".webp", ".bmp"]:
        exif = _extract_exif(path)
        if exif:
            metadata["exif"] = exif
            # Extract commonly useful fields to top level
            if "DateTime" in exif:
                metadata["photo_datetime"] = exif["DateTime"]
            if "Make" in exif:
                metadata["camera_make"] = exif["Make"]
            if "Model" in exif:
                metadata["camera_model"] = exif["Model"]
            if "GPSInfo" in exif:
                metadata["has_gps"] = True

    # Extract PDF metadata
    elif ext == ".pdf":
        pdf_meta = _extract_pdf_metadata(path)
        if pdf_meta:
            metadata.update(pdf_meta)

    return metadata
