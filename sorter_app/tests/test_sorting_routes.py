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
    with app.test_client() as testing_client:
        yield testing_client


# ---------------------------
# happy-path tests
# ---------------------------


@pytest.mark.parametrize(
    "endpoint, algo_name, apply_fn",
    [
        ("/sort/bubble", "bubble", apply_bubble_trace),
        ("/sort/insertion", "insertion", apply_insertion_trace),
        ("/sort/merge", "merge", apply_merge_trace),
        ("/sort/quick", "quick", apply_quick_trace),
    ],
)
def test_sort_endpoint_happy_path(client, endpoint, algo_name, apply_fn):
    arr = [5, 1, 4, 2]
    resp = client.post(endpoint, json={"array": arr})
    assert resp.status_code == HTTPStatus.OK

    data = resp.get_json()
    assert data["algorithm"] == algo_name

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
