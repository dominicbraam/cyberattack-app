from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from model_handler import Model

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def hello():
    return json.dumps({"test": "test"})


@app.route("/get_pred", methods=["POST"])
def make_single_pred():
    data = request.get_json()

    if not data["features_data"]:
        return jsonify({"error": "No data provided."}), 400

    model = Model()
    pred = model.make_prediction(data["features_data"])

    return pred[0]


@app.route("/get_pred_from_file", methods=["POST"])
def make_file_pred():
    return "file prediction"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
