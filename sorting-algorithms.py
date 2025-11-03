from random import randint
from timeit import repeat

def run_sorting_algorithm(algorithm, array):
    """
    Measures how long a sorting algorithm takes to run on a given list of numbers.
    Uses timeit.repeat to run the sorting code several times and record how long it takes.
    The timeit module runs code as a string in temporary environment
    -> if you want to use a function defined in the main program, you have to import it into the environment
    """
    setup_code = f"from __main__ import {algorithm}" \
        if algorithm != "sorted" else ""

    stmt = f"{algorithm}({array})" # execution statement

    # Execute the code ten different times and return the time in seconds that each execution took
    # repeat - run 3 separate timing batches
    # number - in each batch, run the statement 10 times
    times = repeat(setup=setup_code, stmt=stmt, repeat=3, number=10)

    # Finally, display the name of the algorithm and the
    # minimum time it took to run
    print(f"Algorithm: {algorithm}. Minimum execution time: {min(times)}")

def bubble_sort(array):
    n = len(array)

    for i in range(n):
        # this will help with stopping early if there is nothing left to sort
        already_sorted = True

        for j in range(n-i-1):
            if array[j] > array[j+1]:
                array[j], array[j+1] = array[j+1], array[j]
                already_sorted = False

        if already_sorted:
            break
    return array

def insertion_sort(array):
    n = len(array)
    for i in range(1, n):
        # this is the element we want to fit in the correct position
        key_item = array[i]

        # variable for finding the correct position for key_item
        j = i-1

        # run through the left portion of the array
        while j >= 0 and array[j] > key_item:
            # shift the values to the left
            array[j+1] = array[j]
            j = j - 1

        # when the shifting is done, it's time to place the key_item
        array[j+1] = key_item

    return array

def merge(left, right):
    n = len(left)
    m = len(right)

    result = []
    i = 0 # index of the left array
    j = 0 # index of the right array

    # while there are elements in both arrays, merge
    while i < n and j < m:
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    # add any leftover elements from left
    while i < n:
        result.append(left[i])
        i += 1
    # add any leftover elements from right
    while j < m:
        result.append(right[j])
        j += 1

    return result

def merge_sort(array):
    if len(array) < 2:
        return array

    mid = len(array) // 2
    left = merge_sort(array[:mid])
    right = merge_sort(array[mid:])
    return merge(left, right)

def quicksort(array):
    if len(array) < 2:
        return array

    lower = []
    same = []
    higher = []

    pivot = array[randint(0, len(array) - 1)]

    for item in array:
        if item < pivot:
            lower.append(item)
        elif item == pivot:
            same.append(item)
        else:
            higher.append(item)

    left = quicksort(lower)
    right = quicksort(higher)
    return left + same + right

################### Try the sorting algorithms ###################

arr = [1, 6, 8, 9, 10, 3, 3, 5]
print(quicksort(arr))

################### Measure execution time ###################

print()
print("------- Execution time of each sorting algorithm -------")
print()

# Generate an array of random integer values between 0 and 999
ARRAY_LENGTH = 2500
arr = [randint(0, 1000) for i in range(ARRAY_LENGTH)]

# Call the function using the name of the sorting algorithm and the array
arr_copy = list(arr)
run_sorting_algorithm(algorithm="bubble_sort", array=arr_copy)
arr_copy = list(arr)
run_sorting_algorithm(algorithm="insertion_sort", array=arr_copy)
arr_copy = list(arr)
run_sorting_algorithm(algorithm="merge_sort", array=arr_copy)
arr_copy = list(arr)
run_sorting_algorithm(algorithm="quicksort", array=arr_copy)
arr_copy = list(arr)
run_sorting_algorithm(algorithm="sorted", array=arr_copy)