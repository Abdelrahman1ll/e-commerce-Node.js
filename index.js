// index.js
const connectDB = require("./src/config/dbConn");
const app = require("./app");

connectDB();

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server is running on port ${PORT}`.green);
});

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.log(`unhandledRejection Error: ${err.name} | ${err.message}`.red);
  server.close(() => {
    console.log("Server is shutting down...".red);
    process.exit(1);
  });
});
