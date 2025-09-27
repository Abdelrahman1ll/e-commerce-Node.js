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
 ┣ 📂.github
 ┃ ┗ 📂workflows
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
 ┃ ┣ 📂validations
 ┃ ┣ 📜app.js
 ┃ ┗ 📜index.js
 ┣ 📜.dockerignore
 ┣ 📜.env
 ┣ 📜.gitignore
 ┣ 📜CONTRIBUTING.md
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

MONGODB_URI=
MONGODB_URI_TEST=
MONGO_INITDB_ROOT_PASSWORD=
# =======================
ME_CONFIG_BASICAUTH_PASSWORD=
# =======================
REDIS_URL=
REDIS_PASSWORD=
# =======================
PORT=3000
NODE_ENV="production" 
# =======================
APP_REPLICAS=
# =======================
BASE_URL=http://127.0.0.1
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
TYPE=
PROJECT_ID=
PRIVATE_KEY_ID=
PRIVATE_KEY=
CLIENT_EMAIL=
CLIENT_ID=
AUTH_URI=
TOKEN_URI=
AUTH_PROVIDER_x509_CERT_URI=
CLIENT_x509_CERT_URI=
UNIVERSE_DOMAIN=
# =======================
PAYMOB_API_KEY=
INTEGRATION_ID=
HMAC_SECRET=
# =======================
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
# =======================
SIGNUP_GOOGLE_TEST=
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
docker compose exec e-commerce npm run swagger

# ===========================
# Run project tests inside a specific container (replace <container_id> with real container name/id)
docker compose exec e-commerce npm run test

# First API from here
http://localhost
