import json
from pathlib import Path

from soroban_wrapped.api import app
from soroban_wrapped.config import ROOT

SCHEMA_FILE = ROOT / "web" / "openapi.json"


def render() -> str:
    return json.dumps(app.openapi(), indent=2, sort_keys=True) + "\n"


def write(path: Path = SCHEMA_FILE) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(render())
