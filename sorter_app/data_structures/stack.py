from collections import deque
from typing import Any, Deque, Dict, List, Tuple


def _as_deque(state: List[Any]) -> Deque[Any]:
    return deque(state)


def _to_list(dq: Deque[Any]) -> List[Any]:
    return list(dq)


def push_value(state: List[Any], value: Any) -> Tuple[List[Dict], List[Any]]:
    dq = _as_deque(state)
    steps: List[Dict] = []

    if dq:
        steps.append({"type": "highlight", "index": len(dq) - 1})  # current top

    dq.append(value)
    steps.append({"type": "append", "value": value})
    steps.append({"type": "top", "index": len(dq) - 1})
    return steps, _to_list(dq)


def pop_value(state: List[Any]) -> Tuple[List[Dict], List[Any]]:
    dq = _as_deque(state)
    steps: List[Dict] = []
    if not dq:
        steps.append({"type": "noop", "reason": "empty"})
        return steps, _to_list(dq)
    steps.append({"type": "highlight", "index": len(dq) - 1})
    v = dq.pop()
    steps.append({"type": "pop", "value": v})
    steps.append({"type": "top", "index": (len(dq) - 1) if dq else None})
    return steps, _to_list(dq)
