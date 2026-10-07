import sys
import os
import shutil
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# On Vercel serverless, copy SQLite db to /tmp for write access if needed
if os.getenv("VERCEL"):
    tmp_db = Path("/tmp/smartcart.db")
    orig_db = ROOT_DIR / "backend" / "smartcart.db"
    if not tmp_db.exists() and orig_db.exists():
        try:
            shutil.copyfile(orig_db, tmp_db)
        except Exception as e:
            print("Warning: Could not copy initial smartcart.db to /tmp:", e)

from backend.app import create_app

app = create_app()
