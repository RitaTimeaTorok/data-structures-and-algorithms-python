from collections import deque
from typing import Any, Dict, List, Tuple


def insert_at(state: List[Any], index: int, value: Any) -> Tuple[List[Dict], List[Any]]:
    dq = deque(state)
    steps: List[Dict] = []

    # Clamp index to valid range
    index = max(0, min(index, len(dq)))

    dq.insert(index, value)
    steps.append({"type": "insert", "index": index, "value": value})

    return steps, list(dq)


def delete_at(state: List[Any], index: int) -> Tuple[List[Dict], List[Any]]:
    dq = deque(state)
    steps: List[Dict] = []

    if not dq:
        steps.append({"type": "noop", "reason": "empty"})
        return steps, list(dq)

    index = max(0, min(index, len(dq) - 1))
    removed = dq[index]
    del dq[index]
    steps.append({"type": "delete", "index": index, "value": removed})

    return steps, list(dq)
