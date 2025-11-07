from typing import Any, Dict, List, Tuple

"""
Representation:
- Stack is represented here as a simple Python list, top is the END of the list.
- Example: [1,2,3]  -> top is 3 (index len-1)
"""


def push_value(state: List[Any], value: Any) -> Tuple[List[Dict], List[Any]]:
    steps: List[Dict] = []
    new_state = state.copy()

    # Highlight top (if exists)
    if new_state:
        steps.append({"type": "highlight", "index": len(new_state) - 1})

    # Allocate a new slot (conceptual)
    steps.append({"type": "allocate", "index": len(new_state)})

    # Write the new value at top
    new_state.append(value)
    steps.append({"type": "write", "index": len(new_state) - 1, "value": value})

    # Finalize: mark as new top
    steps.append({"type": "top", "index": len(new_state) - 1})

    return steps, new_state


def pop_value(state: List[Any]) -> Tuple[List[Dict], List[Any]]:
    steps: List[Dict] = []
    if not state:
        # No-op; keep trace to show error gracefully in UI
        steps.append({"type": "noop", "reason": "empty"})
        return steps, state.copy()

    new_state = state.copy()

    # Highlight current top
    top_idx = len(new_state) - 1
    steps.append({"type": "highlight", "index": top_idx})

    # Read the value (optional for UI)
    steps.append({"type": "read", "index": top_idx, "value": new_state[top_idx]})

    # Remove top
    removed = new_state.pop()
    steps.append({"type": "remove", "index": top_idx, "value": removed})

    # New top (if any)
    if new_state:
        steps.append({"type": "top", "index": len(new_state) - 1})
    else:
        steps.append({"type": "top", "index": None})  # stack empty

    return steps, new_state
