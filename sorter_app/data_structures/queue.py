from typing import Any, Dict, List, Tuple

"""
Representation:
- Queue is represented here as a Python list: FRONT at index 0, REAR at end.
- Enqueue appends to end
- Dequeue removes index 0 (with conceptual shifts)
"""


def enqueue(state: List[Any], value: Any) -> Tuple[List[Dict], List[Any]]:
    steps: List[Dict] = []
    new_state = state.copy()

    # Highlight rear (if exists)
    if new_state:
        steps.append({"type": "highlight", "index": len(new_state) - 1})

    # Allocate at new rear
    steps.append({"type": "allocate", "index": len(new_state)})

    new_state.append(value)
    steps.append({"type": "write", "index": len(new_state) - 1, "value": value})
    steps.append({"type": "rear", "index": len(new_state) - 1})
    steps.append({"type": "front", "index": 0 if new_state else None})

    return steps, new_state


def dequeue(state: List[Any]) -> Tuple[List[Dict], List[Any]]:
    steps: List[Dict] = []
    if not state:
        steps.append({"type": "noop", "reason": "empty"})
        return steps, state.copy()

    new_state = state.copy()

    # Highlight front
    steps.append({"type": "highlight", "index": 0})
    steps.append({"type": "read", "index": 0, "value": new_state[0]})

    # Conceptual shift left (animate if you want)
    for i in range(1, len(new_state)):
        steps.append({"type": "shift_left", "from": i, "to": i - 1})

    # Remove old rear slot
    removed = new_state.pop(0)
    steps.append({"type": "remove", "index": len(new_state), "value": removed})

    # Update markers
    if new_state:
        steps.append({"type": "front", "index": 0})
        steps.append({"type": "rear", "index": len(new_state) - 1})
    else:
        steps.append({"type": "front", "index": None})
        steps.append({"type": "rear", "index": None})

    return steps, new_state
