# Use a lightweight Node.js image as the base
# This version (18-alpine) is good for production due to its small size
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if you have one) first
# This allows Docker to cache the npm install step if dependencies haven't changed
COPY package*.json ./

# Install application dependencies
# Using --omit=dev to skip dev dependencies in production builds
RUN npm install --omit=dev

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your Express app runs on (default is 3000, from .env)
# Make sure this matches the PORT in your .env file or server.js
EXPOSE 3000

# Command to run the application when the container starts
# 'npm start' executes the script defined in package.json
CMD [ "npm", "start" ]
