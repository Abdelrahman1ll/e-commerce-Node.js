# 🛒 E-Commerce Backend (Node.js + Express + MongoDB)

## 📌 Overview
This is the **backend** for an E-Commerce application built with:
- **Node.js + Express** for API handling.
- **MongoDB + Mongoose** for database.
- **Docker** for containerization.
- **Swagger** for API documentation.
- **Jest + Supertest** for testing.

---

## 🚀 Running the Project

### 1️⃣ Start the containers
```bash
docker-compose up --build


📦back end
 ┣ 📂src
 ┃ ┣ 📂config
 ┃ ┣ 📂controllers
 ┃ ┣ 📂middleware
 ┃ ┣ 📂models
 ┃ ┣ 📂routes
 ┃ ┣ 📂swagger
 ┃ ┣ 📂tests
 ┃ ┃ ┣ 📂fixtures
 ┃ ┃ ┣ 📂integration
 ┃ ┃ ┗ 📂utils
 ┃ ┣ 📂utils
 ┃ ┣ 📜app.js
 ┃ ┗ 📜index.js
 ┣ 📜.dockerignore
 ┣ 📜.env
 ┣ 📜.gitignore
 ┣ 📜apiKey.json
 ┣ 📜docker-compose.yml
 ┣ 📜Dockerfile
 ┣ 📜index.html
 ┣ 📜index.js
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┣ 📜README.md
 ┗ 📜vercel.json

# ===========================
# Build and run containers (important the first time or after modifying the Dockerfile)
# - NODE_ENV=development => run in development mode
# - NODE_ENV=production  => run in production mode
# This command builds a new image for each container and starts them immediately
NODE_ENV=development docker-compose up --build   # Run containers in development mode with a new build
NODE_ENV=production docker-compose up --build    # Run containers in production mode with a new build

# ===========================
# Start previously stopped containers (without building or pulling new images)
NODE_ENV=production docker-compose start         # Start containers in production mode

# ===========================
# Restart all containers (stop then start)
NODE_ENV=production docker-compose restart       # Restart all containers in production mode

# ===========================
# Stop containers only (containers remain on the system for later start)
NODE_ENV=production docker-compose stop          # Stop containers in production mode

# ===========================
# Start containers and show logs in terminal (like `npm run dev`)
NODE_ENV=production docker-compose up            # Run containers in production mode with logs

# ===========================
# Start containers in the background (without logs)
NODE_ENV=production docker-compose up -d         # Run containers in detached mode (background)

# ===========================
# Stop all containers and remove networks (images and volumes remain)
NODE_ENV=production docker-compose down          # Stop and remove networks in production mode

# ===========================
# Stop all containers, remove networks and volumes (delete stored data)
NODE_ENV=production docker-compose down -v      # Stop and remove networks + volumes in production mode

# ===========================
# Run swagger script inside a specific container (here container name is node-app)
NODE_ENV=production docker exec -it node-app npm run swagger  # Run swagger inside container

# ===========================
# Run project tests inside a specific container
NODE_ENV=production docker exec -it node-app npm run test     # Run tests inside container
