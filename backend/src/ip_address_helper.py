import ipaddress
import pandas as pd
import numpy as np


class IPAddressHelper:

    def __init__(self):
        try:
            self.df_geo = pd.read_csv("../data/dbip-country-transformed.csv")
            self.df_asn = pd.read_csv("../data/dbip-asn-transformed.csv")
        except Exception as e:
            raise Exception(e)

    def is_ip_address(self, ip_a):
        try:
            return ipaddress.ip_address(ip_a)
        except ValueError as e:
            raise ValueError(e)

    def is_private(self, ip_a):
        return ipaddress.ip_address(ip_a).is_private

    def add_ip_info(self, option, df, loc):

        if option == "country":
            df_helper = self.df_geo
            df_helper_col = "country_code"
        elif option == "asn_id":
            df_helper = self.df_asn
            df_helper_col = "asn_id"
        else:
            raise Exception("Not an option.")

        df[f"ip_address_{loc}_int"] = df[f"ip_address_{loc}"].apply(
            self._ip_to_int
        )

        start_ips = df_helper["start_ip_int"].values
        end_ips = df_helper["end_ip_int"].values

        cummax_ends = np.maximum.accumulate(end_ips)
        cummax_indices = np.empty_like(cummax_ends, dtype=np.int64)
        cummax_indices[0] = 0

        for i in range(1, len(end_ips)):
            if end_ips[i] > cummax_ends[i - 1]:
                cummax_indices[i] = i
            else:
                cummax_indices[i] = cummax_indices[i - 1]

        # this will match all rows all rows with vals from start_ips.
        # there is no upper limit so all rows will be filled.
        indeces = np.searchsorted(
            cummax_ends,
            df[f"ip_address_{loc}_int"].values,
            side="left",
        )
        indeces[indeces == len(end_ips)] = len(end_ips) - 1
        ai = cummax_indices[indeces]
        # the solution for the above problem is to create a mask where
        # False will be given if it does not fit with the end_ip too.
        mask = (df[f"ip_address_{loc}_int"].values >= start_ips[ai]) & (
            df[f"ip_address_{loc}_int"].values <= end_ips[ai]
        )

        mode_val = df_helper[df_helper_col].mode()[0]
        matched_values = np.where(
            mask, df_helper[df_helper_col].values[ai], mode_val
        )
        df[f"{loc}_{option}"] = matched_values

        df.drop(f"ip_address_{loc}_int", axis=1, inplace=True)

        return df

    def _ip_to_int(self, ip_address):
        ip_cleaned = ".".join(
            str(int(octet)) for octet in ip_address.split(".")
        )
        return int(ipaddress.IPv4Address(ip_cleaned))


def is_popular_port(port):
    try:
        df_ports = pd.read_csv(
            "../data/top-30000-most-popular-tcp-ports-nmap-sorted.csv",
            header=None,
        )
        l_ports = df_ports.to_numpy()
    except Exception as e:
        raise Exception(e)

    return True if port in l_ports else False
