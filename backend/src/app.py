from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from model_handler import Model
import logging

logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s %(levelname)s:%(message)s"
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)


@app.route("/get_features_data", methods=["GET"])
def get_features_data():
    """Return the model's feature data."""
    model = Model()
    resonse_data = {
        "features_base": model.features_data_base,
        "features_additional": model.features_additional,
        "features_derived": model.features_derived,
    }
    return jsonify(resonse_data)


@app.route("/get_pred", methods=["POST"])
def make_single_pred():
    """Gets form data, responds with prediction."""

    data = request.get_json()
    features_data = data.get("features_data")
    df = pd.DataFrame([features_data])

    return get_pred_result(df)


@app.route("/get_pred_file", methods=["POST"])
def make_file_pred():
    """Endpoint. Reads file, does file validation, responds with prediction."""

    file = request.files["file"]
    filename = file.filename

    is_csv = "." in filename and filename.rsplit(".", 1)[1].lower() == "csv"
    if not is_csv:
        return jsonify({"error": "Only CSV files allowed."}), 400

    try:
        df = pd.read_csv(file)
    except Exception as e:
        logging.exception(e)
        return jsonify({"error": "Internal Server Error"}), 500

    return get_pred_result(df)


def get_pred_result(df):

    model = Model()

    validation_input = model.validate_df(df)
    if not validation_input.get("is_valid", False):
        return jsonify({"error": validation_input.get("msg")}), 400

    df_assembled_features = model.assemble_features(df)
    validation_derived = model.validate_df(df_assembled_features, True)
    if not validation_derived.get("is_valid", False):
        return jsonify({"error": validation_derived.get("msg")}), 400

    pred = model.make_prediction(df_assembled_features)

    base_columns = [col for col in pred.columns if "|" not in col]
    return jsonify(pred[base_columns].to_dict(orient="records"))


if __name__ == "__main__":
    app.run(
        debug=True,  # enable auto-reload in development
        host="0.0.0.0",
        port=5000,
    )
