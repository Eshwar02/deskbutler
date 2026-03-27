"""Auto-launch functionality for DeskButler across platforms."""

import os
import sys
import platform
import logging
from pathlib import Path

logger = logging.getLogger("deskbutler.autolaunch")

APP_NAME = "DeskButler"


def _get_executable_path():
    """Get the path to the DeskButler executable."""
    if getattr(sys, 'frozen', False):
        # Running as compiled executable
        return sys.executable
    else:
        # Running in development - return the project root
        # In production, this should point to the actual executable
        return os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


def _enable_autolaunch_windows():
    """Enable autolaunch on Windows using registry."""
    try:
        import winreg
        
        exe_path = _get_executable_path()
        key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
        
        # Open registry key
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            key_path,
            0,
            winreg.KEY_SET_VALUE
        )
        
        # Set value (wrap path in quotes to handle spaces)
        winreg.SetValueEx(key, APP_NAME, 0, winreg.REG_SZ, f'"{exe_path}"')
        winreg.CloseKey(key)
        
        logger.info(f"Autolaunch enabled in registry: {exe_path}")
        return {"ok": True, "path": exe_path}
        
    except ImportError:
        error_msg = "winreg module not available (not on Windows?)"
        logger.error(error_msg)
        return {"ok": False, "error": error_msg}
    except PermissionError as e:
        error_msg = f"Permission denied accessing registry: {e}"
        logger.error(error_msg)
        return {"ok": False, "error": error_msg}
    except Exception as e:
        error_msg = f"Failed to enable autolaunch: {e}"
        logger.error(error_msg)
        return {"ok": False, "error": error_msg}


def _disable_autolaunch_windows():
    """Disable autolaunch on Windows by removing registry entry."""
    try:
        import winreg
        
        key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
        
        # Open registry key
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            key_path,
            0,
            winreg.KEY_SET_VALUE
        )
        
        # Delete value
        try:
            winreg.DeleteValue(key, APP_NAME)
            logger.info("Autolaunch disabled (registry entry removed)")
            return {"ok": True}
        except FileNotFoundError:
            # Entry doesn't exist, that's fine
            logger.info("Autolaunch entry not found (already disabled)")
            return {"ok": True}
        finally:
            winreg.CloseKey(key)
            
    except ImportError:
        error_msg = "winreg module not available (not on Windows?)"
        logger.error(error_msg)
        return {"ok": False, "error": error_msg}
    except Exception as e:
        error_msg = f"Failed to disable autolaunch: {e}"
        logger.error(error_msg)
        return {"ok": False, "error": error_msg}


def _is_autolaunch_enabled_windows():
    """Check if autolaunch is enabled on Windows."""
    try:
        import winreg
        
        key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
        
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            key_path,
            0,
            winreg.KEY_READ
        )
        
        try:
            value, _ = winreg.QueryValueEx(key, APP_NAME)
            winreg.CloseKey(key)
            return True
        except FileNotFoundError:
            winreg.CloseKey(key)
            return False
            
    except Exception:
        return False


def _enable_autolaunch_macos():
    """Enable autolaunch on macOS using LaunchAgents."""
    try:
        exe_path = _get_executable_path()
        plist_dir = Path.home() / "Library" / "LaunchAgents"
        plist_file = plist_dir / f"com.deskbutler.{APP_NAME.lower()}.plist"
        
        # Create directory if it doesn't exist
        plist_dir.mkdir(parents=True, exist_ok=True)
        
        # Create plist content
        plist_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.deskbutler.{APP_NAME.lower()}</string>
    <key>ProgramArguments</key>
    <array>
        <string>{exe_path}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>
"""
        
        # Write plist file
        plist_file.write_text(plist_content)
        logger.info(f"Autolaunch enabled via LaunchAgent: {plist_file}")
        
        return {"ok": True, "path": str(plist_file)}
        
    except PermissionError as e:
        error_msg = f"Permission denied creating LaunchAgent: {e}"
        logger.error(error_msg)
        return {"ok": False, "error": error_msg}
    except Exception as e:
        error_msg = f"Failed to enable autolaunch: {e}"
        logger.error(error_msg)
        return {"ok": False, "error": error_msg}


def _disable_autolaunch_macos():
    """Disable autolaunch on macOS by removing LaunchAgent plist."""
    try:
        plist_file = Path.home() / "Library" / "LaunchAgents" / f"com.deskbutler.{APP_NAME.lower()}.plist"
        
        if plist_file.exists():
            plist_file.unlink()
            logger.info(f"Autolaunch disabled (removed {plist_file})")
        else:
            logger.info("Autolaunch entry not found (already disabled)")
        
        return {"ok": True}
        
    except PermissionError as e:
        error_msg = f"Permission denied removing LaunchAgent: {e}"
        logger.error(error_msg)
        return {"ok": False, "error": error_msg}
    except Exception as e:
        error_msg = f"Failed to disable autolaunch: {e}"
        logger.error(error_msg)
        return {"ok": False, "error": error_msg}


def _is_autolaunch_enabled_macos():
    """Check if autolaunch is enabled on macOS."""
    plist_file = Path.home() / "Library" / "LaunchAgents" / f"com.deskbutler.{APP_NAME.lower()}.plist"
    return plist_file.exists()


def _enable_autolaunch_linux():
    """Enable autolaunch on Linux using autostart desktop entry."""
    try:
        exe_path = _get_executable_path()
        autostart_dir = Path.home() / ".config" / "autostart"
        desktop_file = autostart_dir / f"{APP_NAME.lower()}.desktop"
        
        # Create directory if it doesn't exist
        autostart_dir.mkdir(parents=True, exist_ok=True)
        
        # Create desktop entry content
        desktop_content = f"""[Desktop Entry]
Type=Application
Name={APP_NAME}
Exec={exe_path}
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Comment=DeskButler automatic file organizer
"""
        
        # Write desktop file
        desktop_file.write_text(desktop_content)
        desktop_file.chmod(0o755)  # Make executable
        
        logger.info(f"Autolaunch enabled via autostart entry: {desktop_file}")
        return {"ok": True, "path": str(desktop_file)}
        
    except PermissionError as e:
        error_msg = f"Permission denied creating autostart entry: {e}"
        logger.error(error_msg)
        return {"ok": False, "error": error_msg}
    except Exception as e:
        error_msg = f"Failed to enable autolaunch: {e}"
        logger.error(error_msg)
        return {"ok": False, "error": error_msg}


def _disable_autolaunch_linux():
    """Disable autolaunch on Linux by removing autostart entry."""
    try:
        desktop_file = Path.home() / ".config" / "autostart" / f"{APP_NAME.lower()}.desktop"
        
        if desktop_file.exists():
            desktop_file.unlink()
            logger.info(f"Autolaunch disabled (removed {desktop_file})")
        else:
            logger.info("Autolaunch entry not found (already disabled)")
        
        return {"ok": True}
        
    except PermissionError as e:
        error_msg = f"Permission denied removing autostart entry: {e}"
        logger.error(error_msg)
        return {"ok": False, "error": error_msg}
    except Exception as e:
        error_msg = f"Failed to disable autolaunch: {e}"
        logger.error(error_msg)
        return {"ok": False, "error": error_msg}


def _is_autolaunch_enabled_linux():
    """Check if autolaunch is enabled on Linux."""
    desktop_file = Path.home() / ".config" / "autostart" / f"{APP_NAME.lower()}.desktop"
    return desktop_file.exists()


def enable_autolaunch():
    """Enable autolaunch on the current platform."""
    system = platform.system()
    
    if system == "Windows":
        return _enable_autolaunch_windows()
    elif system == "Darwin":
        return _enable_autolaunch_macos()
    elif system == "Linux":
        return _enable_autolaunch_linux()
    else:
        error_msg = f"Unsupported platform: {system}"
        logger.error(error_msg)
        return {"ok": False, "error": error_msg}


def disable_autolaunch():
    """Disable autolaunch on the current platform."""
    system = platform.system()
    
    if system == "Windows":
        return _disable_autolaunch_windows()
    elif system == "Darwin":
        return _disable_autolaunch_macos()
    elif system == "Linux":
        return _disable_autolaunch_linux()
    else:
        error_msg = f"Unsupported platform: {system}"
        logger.error(error_msg)
        return {"ok": False, "error": error_msg}


def is_autolaunch_enabled():
    """Check if autolaunch is enabled on the current platform."""
    system = platform.system()
    
    if system == "Windows":
        return _is_autolaunch_enabled_windows()
    elif system == "Darwin":
        return _is_autolaunch_enabled_macos()
    elif system == "Linux":
        return _is_autolaunch_enabled_linux()
    else:
        return False
