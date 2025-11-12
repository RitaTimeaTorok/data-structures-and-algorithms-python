import re
from flask import Blueprint, request, jsonify  # type: ignore
from http import HTTPStatus

# A Blueprint is like a mini app we can plug into the main Flask app
# a way to organize flask routes into reusable modules
upload_blueprint = Blueprint("upload", __name__)


@upload_blueprint.post("/array/upload")
def upload_array():
    """
    Accepts multipart/form-data with a 'file' field.
    Parses comma- or space-separated numbers from CSV/TXT.
    Returns JSON: { "array": [numbers...] } on success
    """

    # Incoming form data must contain a file field
    if "file" not in request.files:
        return (
            jsonify({"error": "No file field named 'file'."}),
            HTTPStatus.BAD_REQUEST,
        )

    # Checks if a file was actually selected by a user
    request_file = request.files["file"]
    if request_file.filename == "":
        return jsonify({"error": "No selected file."}), HTTPStatus.BAD_REQUEST

    try:
        # Reading and parsing the file, skips characters that cant be decoded
        content = request_file.read().decode("utf-8", errors="ignore")

        # Regular expressions to split the text
        tokens = [
            token.strip() for token in re.split(r"[,\s]+", content) if token.strip()
        ]
        if not tokens:
            return (
                jsonify({"error": "No numbers found in file."}),
                HTTPStatus.BAD_REQUEST,
            )

        # Converting the data from the file into numbers
        numbers = []
        for token in tokens:
            val = float(token)
            if val.is_integer():
                val = int(val)
            numbers.append(val)

        return (
            jsonify(
                {
                    "message": f"Upload successful. {len(numbers)} numbers loaded.",
                    "array": numbers,
                }
            ),
            HTTPStatus.OK,
        )

    except ValueError:
        return (
            jsonify({"error": "Invalid number in file."}),
            HTTPStatus.BAD_REQUEST,
        )
