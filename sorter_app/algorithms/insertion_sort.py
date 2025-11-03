def insertion_sort(array):
    """
    Perform insertion sort conceptually (without modifying the original array)
    and record each comparison, shift, and insertion.

    Returns a list of steps:
      { "type": "compare" | "shift" | "insert",
        "i": index,
        "j": index,
        "value": element_being_moved (for insert steps) }
    """
    a = list(array)
    steps = []
    n = len(a)

    for i in range(1, n):
        key = a[i]
        j = i - 1

        # record which element we are inserting
        steps.append({"type": "key", "i": i, "value": key})

        # move larger elements one position ahead
        while j >= 0 and a[j] > key:
            steps.append({"type": "compare", "i": j, "j": j + 1})
            a[j + 1] = a[j]
            steps.append({"type": "shift", "from": j, "to": j + 1})
            j -= 1

        a[j + 1] = key
        steps.append({"type": "insert", "index": j + 1, "value": key})

    return steps
