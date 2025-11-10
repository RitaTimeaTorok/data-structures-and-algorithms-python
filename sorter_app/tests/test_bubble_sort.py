from algorithms.bubble_sort import bubble_sort
import copy
from typing import List, Union
import pytest  # type: ignore


def apply_bubble_trace(
    original: List[Union[int, float]],
    steps: List[dict],
) -> List[Union[int, float]]:
    """
    Replays the bubble_sort trace on a *copy* of the original array.
    For each step, if 'swap' is True, swap items at i and j in the working array.
    """
    arr = list(original)
    for step in steps:
        i = step["i"]
        j = step["j"]
        if step["swap"]:
            arr[i], arr[j] = arr[j], arr[i]
    return arr


def test_empty_array():
    arr = []
    trace = bubble_sort(arr)
    assert trace == []
    assert arr == []


def test_single_element():
    arr = [10]
    trace = bubble_sort(arr)
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
    trace = bubble_sort(arr)
    result_from_trace = apply_bubble_trace(arr_copy, trace)

    # Should match Python's sorted()
    assert result_from_trace == sorted(arr)

    # And bubble_sort must not mutate the original input
    assert arr == arr_copy
