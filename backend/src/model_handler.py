import pandas as pd
import numpy as np
import sklearn  # needed for the model even though the editor says it is unused
import dill
import logging

logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s %(levelname)s:%(message)s"
)
logger = logging.getLogger(__name__)


class Model:

    def __init__(self):
        """Initialize model and load the model wrapper."""

        with open("../models/model_pl_wrapper.pckl", "rb") as f:
            self.model_wrapper = dill.load(f)

        self.features_data = self.model_wrapper.features_data
        self.features_data_base, self.composite_map = (
            self.get_base_features_data()
        )

    def make_prediction(self, user_data):
        """Generate predictions and insert the y var into the data."""

        dfx = pd.DataFrame(user_data)
        logging.info(f"making prediction on df with shape: {dfx.shape}")

        try:
            y = self.model_wrapper.predict(dfx)
            dfx.insert(loc=0, column="attack_type", value=y)
            logging.info("prediction successful")
        except Exception as e:
            logging.error(e)

        return dfx

    def get_base_features_data(self):
        """
        Splits composite features (keys with '|') into base features.
        Uses sets to ensure unique values only.
        Returns
            tuple of (base_features, composite_map)
        """
        base = {}
        composite_map = {}
        for comp_name, cfg in self.features_data.items():
            parts = comp_name.split("|")
            if len(parts) > 1 and cfg["type"] == "categorical":
                composite_map[comp_name] = parts
                for idx, field in enumerate(parts):
                    if field not in base:
                        base[field] = {"type": cfg["type"], "values": set()}
                    for v in cfg["values"]:
                        vals = v.split("|")
                        if idx < len(vals):
                            base[field]["values"].add(vals[idx])
            else:
                base[comp_name] = cfg.copy()
                if cfg["type"] == "categorical":
                    base[comp_name]["values"] = set(cfg["values"])
        for key, data in base.items():
            if data["type"] == "categorical":
                base[key]["values"] = list(data["values"])
        return base, composite_map

    def assemble_features(self, df):
        """
        Assembles composite features from base features using the stored
        composite_map.
        This creates concatenated fields for the model to understand.
        """
        for composite, base_fields in self.composite_map.items():
            df[composite] = df[base_fields].astype(str).agg("|".join, axis=1)
        return df

    def validate_df(self, df):
        """
        Validate the input DataFrame against required feature constraints.

        Args:
            df ():

        Returns:
            dict: {'is_valid': bool, 'msg': str}
        """

        is_valid = True
        msg = ""

        missing_cols = []
        for col_name, col_info in self.features_data_base.items():
            if col_name in df.keys():
                if col_info["type"] == "numerical":
                    val_min = col_info["values"]["min"]
                    val_max = col_info["values"]["max"]
                    col_data = np.atleast_1d(pd.to_numeric(df[col_name]))
                    if not np.all(
                        (col_data >= val_min) & (col_data <= val_max)
                    ):
                        logger.info(
                            f"validation failed for column: {col_name}"
                        )
                        is_valid = False
                        msg = f"""
                        {col_name} value must be within [{val_min},{val_max}]
                        """
            else:
                missing_cols.append(col_name)

        if missing_cols:
            is_valid = False
            msg = f"Columns missing: {missing_cols}"
            logging.info(msg)

        return {"is_valid": is_valid, "msg": msg}
