from random import randint


def quick_sort(array):
    """
    Perform QuickSort and record steps for visualization.

    Steps recorded:
      - {"type": "pivot", "index": i}
      - {"type": "compare", "i": i, "pivot_index": p}
      - {"type": "swap", "i": i, "j": j}
      - {"type": "done", "index": i}
    """
    a = list(array)
    steps = []

    # sort the subarray between the given indices
    def _quick_sort(left, right):
        if left > right:
            return
        pivot_index = randint(left, right)
        pivot_value = a[pivot_index]
        steps.append({"type": "pivot", "index": pivot_index})

        # Move pivot to end - Lomuto partition trick
        a[pivot_index], a[right] = a[right], a[pivot_index]
        steps.append({"type": "swap", "i": pivot_index, "j": right})

        # Partition process
        store_index = left
        for i in range(left, right):
            steps.append({"type": "compare", "i": i, "pivot_index": right})
            if a[i] < pivot_value:
                steps.append({"type": "swap", "i": i, "j": store_index})
                a[i], a[store_index] = a[store_index], a[i]
                store_index += 1

        # Move pivot to final place
        steps.append({"type": "swap", "i": store_index, "j": right})
        a[store_index], a[right] = a[right], a[store_index]

        # Mark pivot as placed
        steps.append({"type": "done", "index": store_index})

        # Recurse left and right
        _quick_sort(left, store_index - 1)
        _quick_sort(store_index + 1, right)

    _quick_sort(0, len(a) - 1)
    return steps
