from flask import Blueprint, jsonify, request  # type: ignore
from typing import Any, Dict
from http import HTTPStatus
from data_structures.stack import push_value, pop_value
from data_structures.queue import enqueue, dequeue
from data_structures.linked_list import insert_at, delete_at

ds_blueprint = Blueprint("ds", __name__)


@ds_blueprint.post("/ds/stack")
def ds_stack():
    data: Dict[str, Any] = request.get_json(silent=True) or {}
    state = data.get("state", [])
    action = data.get("action")

    if not isinstance(state, list):
        return jsonify({"error": "'state' must be a list"}), HTTPStatus.BAD_REQUEST

    if action == "push":
        value = data.get("value")
        if value is None:
            return (
                jsonify({"error": "'value' required for push"}),
                HTTPStatus.BAD_REQUEST,
            )
        steps, new_state = push_value(state, value)
        return (
            jsonify(
                {
                    "structure": "stack",
                    "action": action,
                    "steps": steps,
                    "new_state": new_state,
                }
            ),
            HTTPStatus.CREATED,
        )
    elif action == "pop":
        steps, new_state = pop_value(state)
        return (
            jsonify(
                {
                    "structure": "stack",
                    "action": action,
                    "steps": steps,
                    "new_state": new_state,
                }
            ),
            HTTPStatus.OK,
        )
    else:
        return jsonify({"error": "Invalid action"}), HTTPStatus.BAD_REQUEST


@ds_blueprint.post("/ds/queue")
def ds_queue():
    data: Dict[str, Any] = request.get_json(silent=True) or {}
    state = data.get("state", [])
    action = data.get("action")

    if not isinstance(state, list):
        return jsonify({"error": "'state' must be a list"}), HTTPStatus.BAD_REQUEST

    if action == "enqueue":
        value = data.get("value")
        if value is None:
            return (
                jsonify({"error": "'value' required for enqueue"}),
                HTTPStatus.BAD_REQUEST,
            )
        steps, new_state = enqueue(state, value)
        return (
            jsonify(
                {
                    "structure": "queue",
                    "action": action,
                    "steps": steps,
                    "new_state": new_state,
                }
            ),
            HTTPStatus.CREATED,
        )
    elif action == "dequeue":
        steps, new_state = dequeue(state)
        return (
            jsonify(
                {
                    "structure": "queue",
                    "action": action,
                    "steps": steps,
                    "new_state": new_state,
                }
            ),
            HTTPStatus.OK,
        )
    else:
        return jsonify({"error": "Invalid action"}), HTTPStatus.BAD_REQUEST


@ds_blueprint.post("/ds/linked-list")
def ds_linked_list():
    data: Dict[str, Any] = request.get_json(silent=True) or {}
    state = data.get("state", [])
    action = data.get("action")
    index = data.get("index")

    if not isinstance(state, list):
        return jsonify({"error": "'state' must be a list"}), HTTPStatus.BAD_REQUEST
    if not isinstance(index, int):
        return jsonify({"error": "'index' must be int"}), HTTPStatus.BAD_REQUEST

    if action == "insert_at":
        value = data.get("value")
        if value is None:
            return (
                jsonify({"error": "'value' required for insert_at"}),
                HTTPStatus.BAD_REQUEST,
            )
        steps, new_state = insert_at(state, index, value)
        return (
            jsonify(
                {
                    "structure": "linked-list",
                    "action": action,
                    "steps": steps,
                    "new_state": new_state,
                }
            ),
            HTTPStatus.CREATED,
        )
    elif action == "delete_at":
        steps, new_state = delete_at(state, index)
        return (
            jsonify(
                {
                    "structure": "linked-list",
                    "action": action,
                    "steps": steps,
                    "new_state": new_state,
                }
            ),
            HTTPStatus.OK,
        )
    else:
        return jsonify({"error": "Invalid action"}), HTTPStatus.BAD_REQUEST
