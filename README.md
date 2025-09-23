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

📦e-commerce-Node.js
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
 ┣ 📜nginx.conf
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┣ 📜prometheus.yml
 ┣ 📜README.md
 ┗ 📜vercel.json

# =======================
MONGODB_URI=

MONGODB_URI_TEST=

REDIS_URL=
# =======================
PORT=3000
# =======================
NODE_ENV="production" 
# production
# development
# =======================
APP_REPLICAS=5
# =======================
BASE_URL=http://127.0.0.1:3000
# =======================
JWT_SECRET_REFRESH=

JWT_SECRET_ACCESS=

JWT_EXPIRES_IN_REFRESH=

JWT_EXPIRES_IN_ACCESS=
# =======================
EMAIL_USER=

EMAIL_PASS=
# =======================
JWT_SECRET_EMAIL=
# =======================
GOOGLE_CLIENT_ID=
# =======================
FOLDER_ID=
# =======================


# Run containers in development mode with a new build
docker-compose up --build

# ===========================
# Start previously stopped containers (without building or pulling new images)
docker-compose start

# ===========================
# Restart all containers (stop then start)
docker-compose restart

# ===========================
# Stop containers only (containers remain on the system for later start)
docker-compose stop

# ===========================
# Start containers and show logs in terminal (like `npm run dev`)
docker-compose up

# ===========================
# Start containers in the background (without logs)
docker-compose up -d

# ===========================
# Stop all containers and remove networks (images and volumes remain)
docker-compose down

# ===========================
# Stop all containers, remove networks and volumes (delete stored data)
docker-compose down -v

# ===========================
# Run swagger script inside a specific container (replace <container_id> with real container name/id)
docker exec -it <container_id> npm run swagger

# ===========================
# Run project tests inside a specific container (replace <container_id> with real container name/id)
docker exec -it <container_id> npm run test

# First API from here
http://localhost
