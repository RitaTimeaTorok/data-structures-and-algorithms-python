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

    f = request.files["file"]
    if f.filename == "":
        return jsonify({"error": "No selected file."}), 400

    try:
        content = f.read().decode("utf-8", errors="ignore")
        tokens = [s.strip() for s in re.split(r"[,\s]+", content) if s.strip()]
        if not tokens:
            return jsonify({"error": "No numbers found in file."}), 400

        nums = []
        for s in tokens:
            val = float(s)
            if val.is_integer():
                val = int(val)
            nums.append(val)

        return jsonify(
            {
                "message": f"Upload successful. {len(nums)} numbers loaded.",
                "array": nums,
            }
        )

    except ValueError:
        return jsonify({"error": "Invalid number in file."}), 400
    except Exception:
        return jsonify({"error": "Failed to read or process file."}), 400
