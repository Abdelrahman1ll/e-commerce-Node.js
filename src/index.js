// index.js
const connectDB = require("./config/dbConn");
const app = require("./app");
const redisClient = require("./config/redis");
async function startServer() {
  try {
    await connectDB();
    await redisClient.connect();
    
    const PORT = process.env.PORT || 8000;

    const server = app.listen(PORT, () => {
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
