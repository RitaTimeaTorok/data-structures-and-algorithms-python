from collections import deque
from typing import Any, Deque, Dict, List

from data_structures.queue import enqueue, dequeue


def apply_queue_trace(initial: List[Any], steps: List[Dict]) -> List[Any]:
    dq: Deque[Any] = deque(initial)
    for step in steps:
        step_type = step.get("type")
        if step_type == "append":
            dq.append(step["value"])
        elif step_type == "popleft":
            if dq:
                dq.popleft()
    return list(dq)


def test_dequeue_empty_queue():
    state: List[Any] = []
    steps, new_state = dequeue(state)
    assert steps == [{"type": "noop", "reason": "empty"}]
    assert apply_queue_trace(state, steps) == new_state


def test_enqueue_empty_queue():
    state: List[Any] = []
    steps, new_state = enqueue(state, 5)
    assert apply_queue_trace(state, steps) == new_state


def test_enqueue_nonempty_queue():
    state = [1, 2]
    steps, new_state = enqueue(state, 3)
    assert apply_queue_trace(state, steps) == new_state


def test_dequeue_one_element():
    state = [9]
    steps, new_state = dequeue(state)
    assert apply_queue_trace(state, steps) == new_state


def test_dequeue_from_nonempty():
    state = [4, 5, 6]
    steps, new_state = dequeue(state)
    assert apply_queue_trace(state, steps) == new_state


def test_sequential_operations_chain():
    # Start with [1,2]; enqueue 3 -> [1,2,3]; then dequeue -> [2,3]
    state0 = [1, 2]

    steps1, state1 = enqueue(state0, 3)
    assert apply_queue_trace(state0, steps1) == state1

    steps2, state2 = dequeue(state1)
    assert apply_queue_trace(state1, steps2) == state2

    assert len(state0) == len(state2)
