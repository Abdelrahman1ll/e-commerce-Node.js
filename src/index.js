// index.js
const connectDB = require("./config/db");
const app = require("./app");
require("./config/redis");
async function startServer() {
  try {
    await connectDB();
    
    const PORT = process.env.PORT || 8000;

    const server = app.listen(PORT,"0.0.0.0", () => {
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
  } catch (error) {
    console.log(`Error connecting to database: ${error.message}`.red);
    process.exit(1);
  }
}

startServer();
