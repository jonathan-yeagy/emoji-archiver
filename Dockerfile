# Use official Node.js image
FROM node:20

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Expose no ports (this is a bot)
CMD ["npm", "start"]