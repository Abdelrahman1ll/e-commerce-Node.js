const fs = require("fs");
const swaggerAutogen = require("swagger-autogen")();
const path = require('path');
const doc = {
  info: {
    title: "E-commerce API",
    version: "1.0.0",
    description: "API documentation for E-commerce project",
    contact: {
      name: "Abdelrahman Mohamed",
      email: "abdoabdoyytt5678@gmail.com",
      url: "https://github.com/Abdelrahman1ll",
    },
  },
  host: "localhost:5000",
  schemes: ["http"],
  securityDefinitions: {
    BearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description:
        "Type Bearer at the beginning of the token and a space after it. Example: Bearer <token>",
    },
  },
  security: [{ BearerAuth: [] }],
};

const outputFile = path.join(__dirname, 'swagger.json');
const endpointsFiles = ["../routes/index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger doc generated!");

  // بعد التوليد نعدل الملف ونضيف Tags
  const swagger = JSON.parse(fs.readFileSync(outputFile));

  // ناخد كل المسارات
  const paths = swagger.paths;

  // object لتجميع التاجات
  const tagsSet = new Set();

  Object.keys(paths).forEach((path) => {
    const methods = paths[path];
    Object.keys(methods).forEach((method) => {
      // نحدد اسم التاج من أول جزء في الـ path
      // مثال: /api/users → Users
      let tag = path.split("/")[2]; // [0]=empty , [1]=api , [2]=users
      if (tag) {
        tag = tag.charAt(0).toUpperCase() + tag.slice(1); // أول حرف كابيتال
        methods[method]["tags"] = [tag];
        tagsSet.add(tag);
      }
    });
  });

  // ضيف التاجات كلها في doc
  swagger.tags = [...tagsSet].map((t) => ({
    name: t,
    description: `Operations about ${t}`,
  }));

  fs.writeFileSync(outputFile, JSON.stringify(swagger, null, 2));
  console.log("Tags added based on route names!");
});
