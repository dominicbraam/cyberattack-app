# ml-proj-web-app

This web application is built on React (frontend) and Flask (backend). Docker is used to make it replicatable. Use the following command to run it:

```
docker compose up
```

## Dependent Notice

This project is dependent on another project that trains the model and requires data generated from it:

- The model. It is expected in the following location with name: `./backend/models/model_pl_wrapper.pckl`
- 2 transformed datasets called `dbip-asn-transformed.csv` and `dbip-country-transformed.csv`. It is expected in the `data/` directory.

## External Datasets

- `top-30000-most-popular-tcp-ports-nmap-sorted.csv` from the github repo: [https://github.com/HeckerBirb/top-nmap-ports-csv](https://github.com/HeckerBirb/top-nmap-ports-csv). Expected in the `data/` directory.
