# Use the official Node.js image from Docker Hub
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Expose port 3000 (or your app's port)
EXPOSE 3000

# Command to run your app
CMD ["npm", "start"]
