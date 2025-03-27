FROM node:23-alpine

WORKDIR /app

# Copy the package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies directly from the lockfile
RUN npm ci

# Copy the remaining application files to the working directory
COPY . .

CMD [ "npm", "run", "start" ]
