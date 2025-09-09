# Use official Node.js image
FROM node:24-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose the port (default Express/NestJS: 3000)
EXPOSE 3000

# Start the app (لو NestJS غيّر لـ dist/main)
CMD ["node", "index.js"]
