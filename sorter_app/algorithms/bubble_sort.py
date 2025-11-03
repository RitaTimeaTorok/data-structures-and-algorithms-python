from typing import List, Union


def bubble_sort(array: List[Union[int, float]]):
    """
    Perform bubble sort conceptually (without modifying the original array)
    and record each comparison and swap decision.

    Returns a list of steps. Each step is a dict:
        {
          "i": index of first element,
          "j": index of second element,
          "swap": True if a swap occurs, False otherwise
        }
    """
    array_copy = list(array)
    n = len(array_copy)
    trace = []

    for i in range(n):
        already_sorted = True

        for j in range(n - i - 1):
            step = {"i": j, "j": j + 1, "swap": False}

            if array_copy[j] > array_copy[j + 1]:
                array_copy[j], array_copy[j + 1] = array_copy[j + 1], array_copy[j]
                step["swap"] = True
                already_sorted = False

            trace.append(step)

        if already_sorted:
            break

    return trace
