from collections import deque
from typing import Any, Dict, List

from data_structures.linked_list import insert_at, delete_at


def apply_linked_trace(initial: List[Any], steps: List[Dict]) -> List[Any]:
    dq = deque(initial)
    for step in steps:
        step_type = step.get("type")
        if step_type == "insert":
            idx = step["index"]
            val = step["value"]
            idx = max(0, min(idx, len(dq)))
            dq.insert(idx, val)
        elif step_type == "delete":
            idx = step["index"]
            idx = max(0, min(idx, len(dq) - 1))
            if dq:
                del dq[idx]
    return list(dq)


# --- delete edge cases ---


def test_delete_empty_list():
    state: List[Any] = []
    steps, new_state = delete_at(state, 0)
    assert steps == [{"type": "noop", "reason": "empty"}]
    assert new_state == []


def test_delete_one_element():
    state = [99]
    steps, new_state = delete_at(state, 0)
    assert steps == [{"type": "delete", "index": 0, "value": 99}]
    assert new_state == []


def test_delete_middle():
    state = [10, 20, 30, 40]
    steps, new_state = delete_at(state, 2)  # remove 30
    assert steps == [{"type": "delete", "index": 2, "value": 30}]
    assert apply_linked_trace(state, steps) == new_state


def test_delete_tail_with_out_of_ranged():
    state = [1, 2, 3]
    steps, new_state = delete_at(state, 999)  # clamp to tail (index 2)
    assert steps == [{"type": "delete", "index": 2, "value": 3}]
    assert apply_linked_trace(state, steps) == new_state


# --- insert edge cases ---


def test_insert_into_empty():
    state: List[Any] = []
    steps, new_state = insert_at(state, 0, "A")
    assert steps == [{"type": "insert", "index": 0, "value": "A"}]
    assert apply_linked_trace(state, steps) == new_state


def test_insert_negative_index():
    state = [1, 2, 3]
    steps, new_state = insert_at(state, -5, 0)  # clamp to 0
    assert steps == [{"type": "insert", "index": 0, "value": 0}]
    assert apply_linked_trace(state, steps) == new_state


def test_insert_out_of_range():
    state = [1, 2, 3]
    steps, new_state = insert_at(state, 999, 4)  # clamp to len -> append
    assert steps == [{"type": "insert", "index": 3, "value": 4}]
    assert apply_linked_trace(state, steps) == new_state


def test_insert_middle():
    state = [10, 20, 40]
    steps, new_state = insert_at(state, 2, 30)
    assert steps == [{"type": "insert", "index": 2, "value": 30}]
    assert apply_linked_trace(state, steps) == new_state


# --- sequential scenario ---


def test_sequential_insert_and_delete():
    state0 = [1, 3]
    # insert 2 at index 1 -> [1,2,3]
    steps1, state1 = insert_at(state0, 1, 2)
    assert apply_linked_trace(state0, steps1) == state1

    # delete at index 0 -> remove 1 => [2,3]
    steps2, state2 = delete_at(state1, 0)
    assert apply_linked_trace(state1, steps2) == state2

    assert len(state0) == len(state2)
