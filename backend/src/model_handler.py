import pandas as pd
import sklearn  # needed for the model even though the editor says it is unused
import dill

import logging

logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s %(levelname)s:%(message)s"
)
logger = logging.getLogger(__name__)


class Model:

    def __init__(self):
        with open("../models/model_pl_wrapper.pckl", "rb") as f:
            self.model_wrapper = dill.load(f)

        self.feature_names = [
            "browser",
            "os",
            "pckt_len_pckt_tp",
            "pckt_len_Source",
            "pckt_tp_Protocol",
            "anomaly_scores",
            "month",
        ]

    def make_prediction(self, features_data):
        dfx = pd.DataFrame([features_data])
        logger.info(dfx)
        return self.model_wrapper.predict(dfx)
