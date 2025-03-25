FROM python:3.10-slim

WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt /app

# Install any dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

COPY . /app

ENTRYPOINT [ "python3" ]

# Run app.py when the container launches
CMD [ "app.py" ]
