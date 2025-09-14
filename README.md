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
 ┃ ┗ 📂utils
 ┣ 📜.dockerignore
 ┣ 📜.env
 ┣ 📜.gitignore
 ┣ 📜apiKey.json
 ┣ 📜app.js
 ┣ 📜docker-compose.yml
 ┣ 📜Dockerfile
 ┣ 📜index.html
 ┣ 📜index.js
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┣ 📜README.md
 ┗ 📜vercel.json


# إيقاف وتشغيل مع إعادة build للصور (أول مرة أو بعد تعديل في Dockerfile)
docker-compose -p ecommerce-app-container up --build

# تشغيل الحاويات المتوقفة (من غير build أو download جديد)
docker-compose start

# إعادة تشغيل الحاويات (Stop + Start)
docker-compose restart

# إيقاف الحاويات فقط (من غير مسح أي حاجة)
docker-compose stop

# تشغيل الحاويات وعرض الـ Logs قدامك (زي npm run dev)
docker-compose up

# تشغيل الحاويات في الخلفية (بدون Logs)
docker-compose up -d

# إيقاف ومسح الحاويات والشبكات (لكن مش بيمسح الـ images ولا الـ volumes)
docker-compose down

# إيقاف ومسح الحاويات + الشبكات + الـ volumes
docker-compose down -v


docker exec -it node-app npm run swagger

docker exec -it node-app npm run test