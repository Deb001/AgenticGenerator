"""subtask_generator.py

Utility to transform a free‑form description into a JSON‑compatible list of subtask dictionaries.
The function is deliberately simple: it returns a single subtask object containing the original description.
If the description contains a semicolon, it is split into two sub‑tasks.
"""

import json
import uuid
from typing import List, Dict

def generate_subtasks(description: str) -> List[Dict[str, str]]:
    """Generate 1‑2 subtask dictionaries from a description.

    The function looks for a semicolon (`;`) to decide whether to create two sub‑tasks.
    Each sub‑task receives a unique identifier and the trimmed description fragment.

    Args:
        description: Human‑readable description of the overall task.

    Returns:
        A list containing one or two dictionaries with keys ``id`` and ``description``.
    """
    if not isinstance(description, str) or not description.strip():
        raise ValueError("Description must be a non‑empty string")

    fragments = [frag.strip() for frag in description.split(';') if frag.strip()]
    # Limit to at most two fragments as per specification.
    fragments = fragments[:2] if len(fragments) > 2 else fragments
    subtasks: List[Dict[str, str]] = []
    for frag in fragments:
        subtask_id = f"subtask-{uuid.uuid4().hex[:8]}"
        subtasks.append({"id": subtask_id, "description": frag})
    # Ensure at least one subtask is returned.
    if not subtasks:
        subtasks.append({"id": f"subtask-{uuid.uuid4().hex[:8]}", "description": description.strip()})
    return subtasks

# Helper for downstream usage – returns a JSON string directly.
def generate_subtasks_json(description: str) -> str:
    """Convenience wrapper that returns a JSON‑encoded string of subtasks.

    Args:
        description: Task description.

    Returns:
        JSON string representing the list of subtask objects.
    """
    subtasks = generate_subtasks(description)
    return json.dumps(subtasks)
