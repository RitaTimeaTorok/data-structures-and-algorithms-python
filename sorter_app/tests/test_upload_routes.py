from http import HTTPStatus
from io import BytesIO
from flask import Flask  # type: ignore
import pytest  # type: ignore

from routes.upload_routes import upload_blueprint


# ---------------------------
# Flask test client
# ---------------------------


@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(upload_blueprint)
    app.config.update(TESTING=True)
    with app.test_client() as c:
        yield c


# ---------------------------
# Error cases
# ---------------------------


def test_missing_file_field(client):
    resp = client.post("/array/upload", data={}, content_type="multipart/form-data")
    assert resp.status_code == HTTPStatus.BAD_REQUEST
    assert "No file field" in resp.get_json()["error"]


def test_empty_filename(client):
    data = {"file": (BytesIO(b"1,2,3"), "")}
    resp = client.post("/array/upload", data=data, content_type="multipart/form-data")
    assert resp.status_code == HTTPStatus.BAD_REQUEST
    assert "No selected file" in resp.get_json()["error"]


def test_empty_content(client):
    data = {"file": (BytesIO(b"   , \n\t"), "numbers.txt")}
    resp = client.post("/array/upload", data=data, content_type="multipart/form-data")
    assert resp.status_code == HTTPStatus.BAD_REQUEST
    assert "No numbers found" in resp.get_json()["error"]


def test_invalid_number_in_file(client):
    data = {"file": (BytesIO(b"1, 2, nope, 4"), "numbers.csv")}
    resp = client.post("/array/upload", data=data, content_type="multipart/form-data")
    assert resp.status_code == HTTPStatus.BAD_REQUEST
    assert "Invalid number" in resp.get_json()["error"]


# ---------------------------
# Happy paths
# ---------------------------


def test_csv_and_whitespace_mixture(client):
    # commas, spaces, newlines, tabs — all valid separators
    content = b"1, 2,3\n4 5\t6"
    data = {"file": (BytesIO(content), "numbers.txt")}
    resp = client.post("/array/upload", data=data, content_type="multipart/form-data")
    assert resp.status_code == HTTPStatus.OK
    payload = resp.get_json()
    assert payload["array"] == [1, 2, 3, 4, 5, 6]
    assert "Upload successful" in payload["message"]


def test_float_to_int_coercion(client):
    # 2.0 and 4.00 should be coerced to ints, 3.50 should stay float
    content = b"1, 2.0, 3.50, 4.00"
    data = {"file": (BytesIO(content), "nums.csv")}
    resp = client.post("/array/upload", data=data, content_type="multipart/form-data")
    assert resp.status_code == HTTPStatus.OK
    assert resp.get_json()["array"] == [1, 2, 3.5, 4]
