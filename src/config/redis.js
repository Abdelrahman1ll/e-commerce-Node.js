const redis = require("redis");

// Connect to Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});
redisClient.on("connect", () => {
  console.log("Connected to Redis...");
});
redisClient.on("error", (err) => {
  console.log(`Error connecting to Redis: ${err.message}`);
});

module.exports = redisClient;
