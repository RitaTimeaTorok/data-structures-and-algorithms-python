from typing import List, Union


def insertion_sort(array: List[Union[int, float]]):
    """
    Perform insertion sort conceptually (without modifying the original array)
    and record each comparison, shift, and insertion.

    Returns a list of steps:
      { "type": "compare" | "shift" | "insert",
        "i": index,
        "j": index,
        "value": element_being_moved (for insert steps) }
    """
    array_copy = list(array)
    steps = []
    n = len(array_copy)

    for i in range(1, n):
        key = array_copy[i]
        j = i - 1

        # record which element we are inserting
        steps.append({"type": "key", "i": i, "value": key})

        # move larger elements one position ahead
        while j >= 0 and array_copy[j] > key:
            steps.append({"type": "compare", "i": j, "j": j + 1})
            array_copy[j + 1] = array_copy[j]
            steps.append({"type": "shift", "from": j, "to": j + 1})
            j -= 1

        array_copy[j + 1] = key
        steps.append({"type": "insert", "index": j + 1, "value": key})

    return steps
