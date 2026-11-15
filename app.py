
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Allow profile photos up to 5 MB
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/generate-profile", methods=["POST"])
def generate_profile():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "Invalid request."
        }), 400

    name = data.get("name", "")
    role = data.get("role", "")
    bio = data.get("bio", "")
    image = data.get("image", "")

    if not all(isinstance(value, str) for value in [name, role, bio, image]):
        return jsonify({
            "success": False,
            "message": "Invalid profile information."
        }), 400

    name = name.strip()
    role = role.strip()
    bio = bio.strip()
    image = image.strip()

    if not name or not role or not bio or not image:
        return jsonify({
            "success": False,
            "message": "Please complete all fields and upload a photo."
        }), 400

    if not image.startswith("data:image/"):
        return jsonify({
            "success": False,
            "message": "Please upload a valid image."
        }), 400

    profile = {
        "name": name,
        "role": role,
        "bio": bio,
        "image": image
    }

    return jsonify({
        "success": True,
        "message": "Profile generated successfully!",
        "profile": profile
    })


@app.errorhandler(413)
def file_too_large(error):
    return jsonify({
        "success": False,
        "message": "Request is too large. Please use a smaller photo."
    }), 413


if __name__ == "__main__":
    app.run(debug=True)
