# Cyber Attack Classification - Web App

This web application is built with React for the frontend and Flask for the backend. Docker ensures easy replication. To run the application, use the following command:

```
docker compose up
```

## Dependency

This project is dependent on the [cyberattack-model](https://github.com/dominicbraam/cyberattack-model) project. It exports a model and 2 datasets required by this project:

- Place the model at `./backend/models/model_pl_wrapper.pckl`
- Place the two transformed datasets, `dbip-asn-transformed.csv` and `dbip-country-transformed.csv` , in the `data/` directory.

## External Datasets

- `top-30000-most-popular-tcp-ports-nmap-sorted.csv` from the github repo: [https://github.com/HeckerBirb/top-nmap-ports-csv](https://github.com/HeckerBirb/top-nmap-ports-csv). Expected in the `data/` directory.

## Showcase

![cyberattack-app-showcase](https://github.com/user-attachments/assets/1c1b71c8-2447-4b03-8942-6bf50355c7a1)
