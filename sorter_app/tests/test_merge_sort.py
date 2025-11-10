from typing import List, Union
from algorithms.merge_sort import merge_sort
import pytest  # type:ignore
import copy


def apply_merge_trace(
    original: List[Union[int, float]], steps: List[dict]
) -> List[Union[int, float]]:
    """
    Replay merge_sort trace steps on a copy of the original array.
    Handles these step types:
      - 'compare': no effect
      - 'overwrite': arr[index] = value
      - 'split': structural info only, no effect
    """
    arr = list(original)
    for step in steps:
        if step["type"] == "overwrite":
            arr[step["index"]] = step["value"]
    return arr


def test_empty_array():
    arr = []
    trace = arr
    assert trace == []
    assert arr == []


def test_single_element():
    arr = [10]
    trace = merge_sort(arr)
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
    trace = merge_sort(arr)
    result_from_trace = apply_merge_trace(arr_copy, trace)

    # Should match Python's sorted()
    assert result_from_trace == sorted(arr)

    # And bubble_sort must not mutate the original input
    assert arr == arr_copy
