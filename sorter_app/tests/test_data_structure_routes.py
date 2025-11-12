from http import HTTPStatus
from flask import Flask  # type: ignore
import pytest  # type: ignore

from routes.data_structures_routes import ds_blueprint


from test_stack import apply_stack_trace
from test_queue import apply_queue_trace
from test_linked_list import apply_linked_trace


# ---------------------------
# Flask test client
# ---------------------------


@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(ds_blueprint)
    app.config.update(TESTING=True)
    with app.test_client() as c:
        yield c


# ---------------------------
# STACK: happy paths
# ---------------------------


def test_stack_push_happy_path(client):
    payload = {"state": [1, 2], "action": "push", "value": 3}
    resp = client.post("/ds/stack", json=payload)
    assert resp.status_code == HTTPStatus.CREATED
    data = resp.get_json()

    assert data["structure"] == "stack"
    assert data["action"] == "push"
    assert isinstance(data["steps"], list)
    assert isinstance(data["new_state"], list)

    # Reconstruct stack via steps
    reconstructed = apply_stack_trace(payload["state"], data["steps"])
    assert reconstructed == data["new_state"]


def test_stack_pop_happy_path(client):
    payload = {"state": [7, 8, 9], "action": "pop"}
    resp = client.post("/ds/stack", json=payload)
    assert resp.status_code == HTTPStatus.OK
    data = resp.get_json()

    assert data["structure"] == "stack"
    assert data["action"] == "pop"
    reconstructed = apply_stack_trace(payload["state"], data["steps"])
    assert reconstructed == data["new_state"]


def test_stack_pop_empty_returns_noop(client):
    payload = {"state": [], "action": "pop"}
    resp = client.post("/ds/stack", json=payload)
    assert resp.status_code == HTTPStatus.OK
    data = resp.get_json()

    assert data["steps"] == [{"type": "noop", "reason": "empty"}]
    assert data["new_state"] == []


# ---------------------------
# STACK: bad payloads
# ---------------------------


@pytest.mark.parametrize(
    "payload, status",
    [
        ({"state": "not-a-list", "action": "push", "value": 1}, HTTPStatus.BAD_REQUEST),
        ({"state": [1], "action": "push"}, HTTPStatus.BAD_REQUEST),  # missing value
        ({"state": [1], "action": "peek"}, HTTPStatus.BAD_REQUEST),  # invalid action
        (
            {},
            HTTPStatus.BAD_REQUEST,
        ),  # missing everything
    ],
)
def test_stack_bad_payloads(client, payload, status):
    resp = client.post("/ds/stack", json=payload)
    assert resp.status_code == status
    data = resp.get_json()
    assert "error" in data


# ---------------------------
# QUEUE: happy paths
# ---------------------------


def test_queue_enqueue_happy_path(client):
    payload = {"state": [1, 2], "action": "enqueue", "value": 3}
    resp = client.post("/ds/queue", json=payload)
    assert resp.status_code == HTTPStatus.CREATED
    data = resp.get_json()

    assert data["structure"] == "queue"
    assert data["action"] == "enqueue"
    reconstructed = apply_queue_trace(payload["state"], data["steps"])
    assert reconstructed == data["new_state"]


def test_queue_dequeue_happy_path(client):
    payload = {"state": [4, 5, 6], "action": "dequeue"}
    resp = client.post("/ds/queue", json=payload)
    assert resp.status_code == HTTPStatus.OK
    data = resp.get_json()

    assert data["structure"] == "queue"
    assert data["action"] == "dequeue"
    reconstructed = apply_queue_trace(payload["state"], data["steps"])
    assert reconstructed == data["new_state"]


def test_queue_dequeue_empty_returns_noop(client):
    payload = {"state": [], "action": "dequeue"}
    resp = client.post("/ds/queue", json=payload)
    assert resp.status_code == HTTPStatus.OK
    data = resp.get_json()

    assert data["steps"] == [{"type": "noop", "reason": "empty"}]
    assert data["new_state"] == []


# ---------------------------
# QUEUE: bad payloads
# ---------------------------


@pytest.mark.parametrize(
    "payload, status",
    [
        (
            {"state": "not-a-list", "action": "enqueue", "value": 1},
            HTTPStatus.BAD_REQUEST,
        ),
        ({"state": [1], "action": "enqueue"}, HTTPStatus.BAD_REQUEST),  # missing value
        ({"state": [1], "action": "peek"}, HTTPStatus.BAD_REQUEST),  # invalid action
        ({}, HTTPStatus.BAD_REQUEST),
    ],
)
def test_queue_bad_payloads(client, payload, status):
    resp = client.post("/ds/queue", json=payload)
    assert resp.status_code == status
    data = resp.get_json()
    assert "error" in data


# ---------------------------
# LINKED LIST: happy paths
# ---------------------------


def test_linked_list_insert_happy_path(client):
    payload = {"state": [10, 30], "action": "insert_at", "index": 1, "value": 20}
    resp = client.post("/ds/linked-list", json=payload)
    assert resp.status_code == HTTPStatus.CREATED
    data = resp.get_json()

    assert data["structure"] == "linked-list"
    assert data["action"] == "insert_at"

    reconstructed = apply_linked_trace(payload["state"], data["steps"])
    assert reconstructed == data["new_state"]


def test_linked_list_delete_happy_path(client):
    payload = {"state": [10, 20, 30], "action": "delete_at", "index": 1}
    resp = client.post("/ds/linked-list", json=payload)
    assert resp.status_code == HTTPStatus.OK
    data = resp.get_json()

    assert data["structure"] == "linked-list"
    assert data["action"] == "delete_at"

    reconstructed = apply_linked_trace(payload["state"], data["steps"])
    assert reconstructed == data["new_state"]


def test_linked_list_delete_empty_returns_noop(client):
    payload = {"state": [], "action": "delete_at", "index": 0}
    resp = client.post("/ds/linked-list", json=payload)
    assert resp.status_code == HTTPStatus.OK
    data = resp.get_json()

    assert data["steps"] == [{"type": "noop", "reason": "empty"}]
    assert data["new_state"] == []


# ---------------------------
# LINKED LIST: bad payloads
# ---------------------------


@pytest.mark.parametrize(
    "payload, status",
    [
        # state must be list
        (
            {"state": "nope", "action": "insert_at", "index": 0, "value": 1},
            HTTPStatus.BAD_REQUEST,
        ),
        # index must be int
        (
            {"state": [], "action": "insert_at", "index": "0", "value": 1},
            HTTPStatus.BAD_REQUEST,
        ),
        ({"state": [], "action": "delete_at", "index": "0"}, HTTPStatus.BAD_REQUEST),
        # missing value for insert_at
        ({"state": [], "action": "insert_at", "index": 0}, HTTPStatus.BAD_REQUEST),
        # invalid action
        (
            {"state": [], "action": "replace", "index": 0, "value": 1},
            HTTPStatus.BAD_REQUEST,
        ),
        # fully missing/empty body (index becomes None -> 400)
        ({}, HTTPStatus.BAD_REQUEST),
    ],
)
def test_linked_list_bad_payloads(client, payload, status):
    resp = client.post("/ds/linked-list", json=payload)
    assert resp.status_code == status
    data = resp.get_json()
    assert "error" in data
