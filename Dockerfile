# Use official Node.js image
FROM node:24-alpine

WORKDIR /app

# نسخ package.json & package-lock.json
COPY package*.json ./

# تثبيت dependecies
RUN npm install

# نسخ بقية الملفات
COPY . .

# تشغيل السيرفر
CMD ["npm", "run", "dev"]