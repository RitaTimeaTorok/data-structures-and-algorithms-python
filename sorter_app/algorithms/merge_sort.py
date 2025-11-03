from typing import List, Union


def merge_sort(array: List[Union[int, float]]):
    """
    Perform merge sort and record steps for visualization.
    Each step is one of:
      - {"type": "compare", "i": left_index, "j": right_index}
      - {"type": "overwrite", "index": dest_index, "value": new_value}
      - {"type": "split", "start": s, "mid": m, "end": e}
    """

    array_copy = list(array)
    steps = []

    def _merge_sort(arr, left, right):
        if right - left <= 1:
            return

        mid = (left + right) // 2
        # record the current split range
        steps.append({"type": "split", "start": left, "mid": mid, "end": right})

        _merge_sort(arr, left, mid)
        _merge_sort(arr, mid, right)

        # merge process
        merged = []
        i, j = left, mid

        while i < mid and j < right:
            steps.append({"type": "compare", "i": i, "j": j})
            if array_copy[i] <= array_copy[j]:
                merged.append(array_copy[i])
                i += 1
            else:
                merged.append(array_copy[j])
                j += 1

        while i < mid:
            merged.append(array_copy[i])
            i += 1
        while j < right:
            merged.append(array_copy[j])
            j += 1

        # copy merged back and record overwrites
        # we copy the merged values back into the original array into the correct positions
        # helps the frontend with the height animation
        for k, val in enumerate(merged):
            array_copy[left + k] = val
            steps.append({"type": "overwrite", "index": left + k, "value": val})

    _merge_sort(array_copy, 0, len(array_copy))
    return steps
