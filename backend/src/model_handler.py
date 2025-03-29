import pandas as pd
import numpy as np
import sklearn  # needed for the model even though the editor says it is unused
import dill
import logging
from ip_address_helper import IPAddressHelper, is_popular_port


class Model:

    def __init__(self):
        """Initialize model and load the model wrapper."""

        with open("../models/model_pl_wrapper.pckl", "rb") as f:
            self.model_wrapper = dill.load(f)

        self.features_data = self.model_wrapper.features_data
        self.features_data_base, self.composite_map = (
            self.get_base_features_data()
        )
        self.features_additional = {
            "timestamp": {"type": "datetime"},
            "ip_address_source": {"type": "text"},
            "ip_address_destination": {"type": "text"},
            "port_source": {
                "type": "numerical",
                "values": {"min": 1024, "max": 65535},
            },
            "port_destination": {
                "type": "numerical",
                "values": {"min": 1024, "max": 65535},
            },
            "packet_length": {
                "type": "numerical",
                "values": {"min": 64, "max": 1500},
            },
        }
        self.features_derived = {
            # dates
            "hour": {"from": "timestamp"},
            "day_of_week": {"from": "timestamp"},
            "month": {"from": "timestamp"},
            "quarter": {"from": "timestamp"},
            "year": {"from": "timestamp"},
            # ip address
            "source_country": {"from": "ip_address_source"},
            "source_asn_id": {"from": "ip_address_source"},
            "source_ip_address_is_private": {"from": "ip_address_source"},
            "destination_country": {"from": "ip_address_destination"},
            "destination_asn_id": {"from": "ip_address_destination"},
            "destination_ip_address_is_private": {
                "from": "ip_address_destination"
            },
            # port
            "source_port_bin": {"from": "port_source"},
            "is_popular_source_port": {"from": "port_source"},
            "destination_port_bin": {"from": "port_destination"},
            "is_popular_destination_port": {"from": "port_destination"},
            # other_network
            "protocol_uses_ports": {"from": "protocol"},
            "packet_length_bin": {"from": "packet_length"},
            # alerts
            "alert_count": {
                "from": [
                    "has_malware_indicator",
                    "has_alerts_and_warnings",
                    "has_firewall_log",
                    "has_ids_ips_alert",
                ]
            },
            "has_system_alert": {
                "from": [
                    "has_malware_indicator",
                    "has_alerts_and_warnings",
                    "has_firewall_log",
                    "has_ids_ips_alert",
                ]
            },
        }

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
        df = self.compute_derived_features(df)
        for composite, base_fields in self.composite_map.items():
            df[composite] = df[base_fields].astype(str).agg("|".join, axis=1)
        return df

    def compute_derived_features(self, df):
        """Compute all derived features."""

        ip_helper = IPAddressHelper()

        if "timestamp" in df.columns:
            df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
            df["hour"] = df["timestamp"].dt.hour
            df["day_of_week"] = df["timestamp"].dt.dayofweek
            df["month"] = df["timestamp"].dt.month
            df["year"] = df["timestamp"].dt.year
            df["quarter"] = df["timestamp"].dt.quarter

        alert_fields = self.features_derived["alert_count"]["from"]
        if all(field in df.columns for field in alert_fields):
            df["alert_count"] = df[alert_fields].sum(axis=1)

        existing_fields = [
            field for field in alert_fields if field in df.columns
        ]
        if existing_fields:
            df["has_system_alert"] = df[existing_fields].any(axis=1)

        df["protocol_uses_ports"] = df["protocol"].apply(
            lambda x: False if x == "ICMP" else True
        )

        df["packet_length_bin"] = df["packet_length"].apply(
            lambda x: (
                "Small"
                if int(x) <= 256
                else (
                    "Medium"
                    if int(x) <= 512
                    else "Large" if int(x) <= 1024 else "Very Large"
                )
            )
        )

        for loc in ["source", "destination"]:
            df[f"{loc}_port_bin"] = df[f"port_{loc}"].apply(
                lambda value: (
                    "registered" if 1024 <= int(value) <= 49151 else "dynamic"
                )
            )

            df[f"{loc}_ip_address_is_private"] = df[f"ip_address_{loc}"].apply(
                lambda x: ip_helper.is_private(x)
            )

            df[f"is_popular_{loc}_port"] = df[f"port_{loc}"].apply(
                is_popular_port
            )

            df = ip_helper.add_ip_info("country", df, loc)
            df = ip_helper.add_ip_info("asn_id", df, loc)

        return df

    def validate_df(self, df, with_derived=False):
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
        features_form_lists = [
            self.features_data_base,
            self.features_additional,
        ]
        for li in features_form_lists:
            for col_name, col_info in li.items():
                if (
                    col_name not in self.features_derived.keys()
                    or with_derived
                ):
                    if col_name in df.keys():
                        if col_info["type"] == "numerical":
                            val_min = col_info["values"]["min"]
                            val_max = col_info["values"]["max"]
                            col_data = np.atleast_1d(
                                pd.to_numeric(df[col_name])
                            )
                            if not np.all(
                                (col_data >= val_min) & (col_data <= val_max)
                            ):
                                logging.error(
                                    f"validation failed for column: {col_name}"
                                )
                                is_valid = False
                                msg = f"""
                                {col_name} value must be within [{val_min},{val_max}]
                                """
                        if "ip_address" in col_name:
                            try:
                                ip_helper = IPAddressHelper()
                                df[col_name].apply(ip_helper.is_ip_address)
                            except ValueError as e:
                                is_valid = False
                                msg = str(e)
                    else:
                        missing_cols.append(col_name)

        if missing_cols:
            is_valid = False
            details = f"Fields missing: {missing_cols}"
            if not with_derived:
                msg = details
                logging.info(details)
            else:
                msg = "Interal Server Error: Error with feature derivation."
                logging.error(details)

        return {"is_valid": is_valid, "msg": msg}
