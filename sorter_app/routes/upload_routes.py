import re
from flask import Blueprint, request, jsonify  # type: ignore

upload_blueprint = Blueprint("upload", __name__)


@upload_blueprint.post("/array/upload")
def upload_array():
    """
    Accepts multipart/form-data with a 'file' field.
    Parses comma- or space-separated numbers from CSV/TXT.
    Returns JSON: { "array": [numbers...] } on success
    """
    if "file" not in request.files:
        return jsonify({"error": "No file field named 'file'."}), 400

    request_file = request.files["file"]
    if request_file.filename == "":
        return jsonify({"error": "No selected file."}), 400

    try:
        content = request_file.read().decode("utf-8", errors="ignore")
        tokens = [
            token.strip() for token in re.split(r"[,\s]+", content) if token.strip()
        ]
        if not tokens:
            return jsonify({"error": "No numbers found in file."}), 400

        numbers = []
        for token in tokens:
            val = float(token)
            if val.is_integer():
                val = int(val)
            numbers.append(val)

        return jsonify(
            {
                "message": f"Upload successful. {len(numbers)} numbers loaded.",
                "array": numbers,
            }
        )

    except ValueError:
        return jsonify({"error": "Invalid number in file."}), 400
    except Exception:
        return jsonify({"error": "Failed to read or process file."}), 400
