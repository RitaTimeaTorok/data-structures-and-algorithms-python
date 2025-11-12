from http import HTTPStatus
from flask import Flask  # type: ignore
import pytest  # type: ignore

from routes.sorting_routes import sorting_blueprint

from test_bubble_sort import apply_bubble_trace
from test_insertion_sort import apply_insertion_trace
from test_merge_sort import apply_merge_trace
from test_quick_sort import apply_quick_trace

# ---------------------------
# flask test client
# ---------------------------


@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(sorting_blueprint)
    app.config.update(TESTING=True)
    with app.test_client() as c:
        yield c


# ---------------------------
# happy-path tests
# ---------------------------


@pytest.mark.parametrize(
    "endpoint, algo_name, apply_fn, arr",
    [
        ("/sort/bubble", "bubble", apply_bubble_trace, [5, 1, 4, 2]),
        ("/sort/insertion", "insertion", apply_insertion_trace, [5, 1, 4, 2]),
        ("/sort/merge", "merge", apply_merge_trace, [5, 1, 4, 2]),
        ("/sort/quick", "quick", apply_quick_trace, [5, 1, 4, 2]),
    ],
)
def test_sort_endpoint_happy_path(client, endpoint, algo_name, apply_fn, arr):
    resp = client.post(endpoint, json={"array": arr})
    assert resp.status_code == HTTPStatus.OK
    data = resp.get_json()
    assert data["algorithm"] == algo_name
    assert isinstance(data["steps"], list)

    # Replay the trace and compare with Python's sorted()
    result_from_trace = apply_fn(arr, data["steps"])
    assert result_from_trace == sorted(arr)


# ---------------------------
# empty-array returns 200 + no steps
# ---------------------------


@pytest.mark.parametrize(
    "endpoint, algo_name",
    [
        ("/sort/bubble", "bubble"),
        ("/sort/insertion", "insertion"),
        ("/sort/merge", "merge"),
        ("/sort/quick", "quick"),
    ],
)
def test_sort_endpoint_empty_list(client, endpoint, algo_name):
    resp = client.post(endpoint, json={"array": []})
    assert resp.status_code == HTTPStatus.OK
    data = resp.get_json()
    assert data["algorithm"] == algo_name
    assert data["steps"] == []


# ---------------------------
# bad payloads shared across both endpoints
# ---------------------------


@pytest.mark.parametrize(
    "endpoint", ["/sort/bubble", "/sort/insertion", "/sort/merge", "/sort/quick"]
)
@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"array": "not-a-list"},
        {"array": [1, "x", 3]},
    ],
)
def test_sort_endpoint_bad_payloads(client, endpoint, payload):
    resp = client.post(endpoint, json=payload)
    assert resp.status_code == HTTPStatus.BAD_REQUEST
    data = resp.get_json()
    assert "error" in data
