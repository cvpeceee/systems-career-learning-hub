# Copied into each lab's tests/conftest.py: picks starter/ or solution/ via LAB_TARGET (default: starter).
import os, sys, pathlib
LAB = pathlib.Path(__file__).resolve().parent.parent
TARGET = os.environ.get("LAB_TARGET", "starter")
sys.path.insert(0, str(LAB.parent / "common"))
sys.path.insert(0, str(LAB / TARGET))
