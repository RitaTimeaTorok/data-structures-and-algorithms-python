from collections import deque
from typing import Any, Deque, Dict, List
from data_structures.stack import push_value, pop_value
import pytest  # type: ignore

from collections import deque
from typing import Any, Deque, Dict, List


def apply_stack_trace(initial: List[Any], steps: List[Dict]) -> List[Any]:
    dq: Deque[Any] = deque(initial)
    for step in steps:
        step_type = step.get("type")
        if step_type == "append":
            dq.append(step["value"])
        elif step_type == "pop":
            if dq:
                dq.pop()
    return list(dq)


def test_pop_empty_stack():
    stack = []
    steps, new_state = pop_value(stack)
    assert steps == [{"type": "noop", "reason": "empty"}]
    assert apply_stack_trace(stack, steps) == new_state


def test_push_into_empty_stack():
    state = []
    steps, new_state = push_value(state, 42)
    assert apply_stack_trace(state, steps) == new_state


def test_push_into_nonempty_stack():
    state = [1, 2]
    steps, new_state = push_value(state, 3)
    assert apply_stack_trace(state, steps) == new_state


def test_push_pop_sequence():
    # Start empty → push 10 → push 20 → pop
    state: List[int] = []

    step1, state1 = push_value(state, 10)
    step2, state2 = push_value(state1, 20)
    step3, state3 = pop_value(state2)

    # final state should be just [10]
    assert state3 == [10]

    # combine traces and replay on the initial empty state
    combined = step1 + step2 + step3
    assert apply_stack_trace(state, combined) == state3


@pytest.mark.parametrize(
    "initial, push_val",
    [
        ([], "x"),
        ([1], 2),
        ([5, 6, 7], 8),
    ],
)
def test_top_index_consistency_after_push(initial, push_val):
    steps, new_state = push_value(initial, push_val)
    # must end with a 'top' step pointing at the last element or index 0 for empty→one
    assert steps[-1]["type"] == "top"
    assert steps[-1]["index"] == len(new_state) - 1
    assert apply_stack_trace(initial, steps) == new_state
