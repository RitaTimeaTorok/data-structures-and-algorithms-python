from collections import deque
from typing import Any, Deque, Dict, List, Tuple


def _as_deque(state: List[Any]) -> Deque[Any]:
    return deque(state)


def _to_list(dq: Deque[Any]) -> List[Any]:
    return list(dq)


def enqueue(state: List[Any], value: Any) -> Tuple[List[Dict], List[Any]]:
    dq = _as_deque(state)
    steps: List[Dict] = []

    if dq:
        steps.append({"type": "front", "index": 0})
        steps.append({"type": "rear", "index": len(dq) - 1})

    dq.append(value)
    steps.append({"type": "append", "value": value})
    steps.append({"type": "front", "index": 0 if dq else 0})
    steps.append({"type": "rear", "index": len(dq) - 1})
    return steps, _to_list(dq)


def dequeue(state: List[Any]) -> Tuple[List[Dict], List[Any]]:
    dq = _as_deque(state)
    steps: List[Dict] = []
    if not dq:
        steps.append({"type": "noop", "reason": "empty"})
        return steps, _to_list(dq)
    steps.append({"type": "front", "index": 0})
    steps.append({"type": "highlight", "index": 0})
    v = dq.popleft()
    steps.append({"type": "popleft", "value": v})
    if dq:
        steps.append({"type": "front", "index": 0})
        steps.append({"type": "rear", "index": len(dq) - 1})
    else:
        steps.append({"type": "front", "index": None})
        steps.append({"type": "rear", "index": None})
    return steps, _to_list(dq)
