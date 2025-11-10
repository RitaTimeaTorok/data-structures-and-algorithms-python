from algorithms.insertion_sort import insertion_sort
import copy
from typing import List, Union
import pytest  # type: ignore


def apply_insertion_trace(
    original: List[Union[int, float]],
    steps: List[dict],
) -> List[Union[int, float]]:
    """
    Replay the insertion_sort trace over a copy of the original.
    Expected step types:
      - {"type": "key", "i": int, "value": Any}              # informative
      - {"type": "compare", "i": int, "j": int}              # informative
      - {"type": "shift", "from": int, "to": int}            # arr[to] = arr[from]
      - {"type": "insert", "index": int, "value": Any}       # place key at index
    """
    arr = list(original)
    for step in steps:
        step_type = step.get("type")
        if step_type == "shift":
            arr[step["to"]] = arr[step["from"]]
        elif step_type == "insert":
            arr[step["index"]] = step["value"]
    return arr


def test_empty_array():
    arr = []
    trace = insertion_sort(arr)
    assert trace == []
    assert arr == []


def test_single_element():
    arr = [10]
    trace = insertion_sort(arr)
    assert trace == []
    assert arr == [10]


@pytest.mark.parametrize(
    "arr",
    [
        [1, 2, 3, 4, 5],  # already sorted
        [5, 4, 3, 2, 1],  # reverse sorted
        [7, 7, 7, 7],  # all equal
        [3, 1, 2, 3, 2, 1],  # mixed duplicates
    ],
)
def test_trace_matches_builtin_sort(arr):
    arr_copy = copy.copy(arr)
    trace = insertion_sort(arr)
    result_from_trace = apply_insertion_trace(arr_copy, trace)

    # Should match Python's sorted()
    assert result_from_trace == sorted(arr)

    # And bubble_sort must not mutate the original input
    assert arr == arr_copy
