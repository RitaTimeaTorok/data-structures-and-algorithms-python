from typing import Dict
from flask import Blueprint, jsonify, request  # type: ignore

from data_structures.stack import push_value as stack_push, pop_value as stack_pop_
from data_structures.queue import enqueue as queue_enqueue, dequeue as queue_dequeue

ds_blueprint = Blueprint("ds", __name__)


# ---------- STACK ----------
@ds_blueprint.post("/ds/stack")
def stack_endpoint():
    """
    JSON:
      {
        "state": [any, ...],      # current stack as array, top is end
        "action": "push"|"pop",
        "value": any              # required for "push"
      }
    Returns:
      { "structure":"stack", "action":..., "steps":[...], "new_state":[...] }
    """
    data: Dict = request.get_json(silent=True) or {}
    state = data.get("state", [])
    action = data.get("action")

    if not isinstance(state, list):
        return jsonify({"error": "'state' must be a list"}), 400

    if action == "push":
        if "value" not in data:
            return jsonify({"error": "'value' is required for push"}), 400
        steps, new_state = stack_push(state, data["value"])
    elif action == "pop":
        steps, new_state = stack_pop_(state)
    else:
        return jsonify({"error": "Invalid or missing 'action' (push|pop)"}), 400

    return jsonify(
        {"structure": "stack", "action": action, "steps": steps, "new_state": new_state}
    )


# ---------- QUEUE ----------
@ds_blueprint.post("/ds/queue")
def queue_endpoint():
    """
    JSON:
      {
        "state": [any, ...],      # front at index 0
        "action": "enqueue"|"dequeue",
        "value": any              # required for "enqueue"
      }
    """
    data: Dict = request.get_json(silent=True) or {}
    state = data.get("state", [])
    action = data.get("action")

    if not isinstance(state, list):
        return jsonify({"error": "'state' must be a list"}), 400

    if action == "enqueue":
        if "value" not in data:
            return jsonify({"error": "'value' is required for enqueue"}), 400
        steps, new_state = queue_enqueue(state, data["value"])
    elif action == "dequeue":
        steps, new_state = queue_dequeue(state)
    else:
        return jsonify({"error": "Invalid or missing 'action' (enqueue|dequeue)"}), 400

    return jsonify(
        {"structure": "queue", "action": action, "steps": steps, "new_state": new_state}
    )
