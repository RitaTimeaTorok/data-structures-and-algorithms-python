from flask import Blueprint, request, jsonify  # type: ignore
from algorithms.bubble_sort import bubble_sort
from algorithms.insertion_sort import insertion_sort
from algorithms.merge_sort import merge_sort
from algorithms.quick_sort import quick_sort

# A Blueprint is like a mini app we can plug into the main Flask app
sorting_blueprint = Blueprint("sorting", __name__)


@sorting_blueprint.post("/sort/bubble")
def sort_bubble():
    """
    Expect JSON: { "array": [numbers...] }
    Return: { "algorithm": "bubble", "steps": [...] }
    """
    data = request.get_json(silent=True) or {}
    arr = data.get("array")

    # Input validation
    if not isinstance(arr, list):
        return jsonify({"error": "Body must include 'array' as a JSON list."}), 400
    if not all(isinstance(x, (int, float)) for x in arr):
        return jsonify({"error": "All elements in 'array' must be numbers."}), 400

    # Perform sorting and return trace
    steps = bubble_sort(arr)
    return jsonify({"algorithm": "bubble", "steps": steps})


@sorting_blueprint.post("/sort/insertion")
def sort_insertion():
    data = request.get_json(silent=True) or {}
    arr = data.get("array")

    if not isinstance(arr, list):
        return jsonify({"error": "Body must include 'array' as a JSON list."}), 400

    steps = insertion_sort(arr)
    return jsonify({"algorithm": "insertion", "steps": steps})


@sorting_blueprint.post("/sort/merge")
def sort_merge():
    data = request.get_json(silent=True) or {}
    arr = data.get("array", [])

    if not isinstance(arr, list):
        return jsonify({"error": "Body must include 'array' as a JSON list."}), 400

    steps = merge_sort(arr)
    return jsonify({"algorithm": "merge", "steps": steps})


@sorting_blueprint.post("/sort/quick")
def sort_quick():
    data = request.get_json(silent=True) or {}
    arr = data.get("array", [])

    if not isinstance(arr, list):
        return jsonify({"error": "Body must include 'array' as a JSON list."}), 400

    steps = quick_sort(arr)
    return jsonify({"algorithm": "quick", "steps": steps})
