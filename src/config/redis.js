const redis = require("redis");

let redisClient;

if (process.env.NODE_ENV === "production") {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on("connect", () => {
    console.log("Connected to Redis...");
  });

  redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
  });

  // Connect once
  (async () => {
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
    } catch (err) {
      console.error("Failed to connect to Redis:", err);
    }
  })();
} else {
  // Mock client for development/test
  console.log("Redis is disabled in development/test mode");

  redisClient = {
    connect: async () => {},
    quit: async () => {},
    get: async () => null,
    set: async () => "OK",
    del: async () => 1,
    isOpen: false,
  };
}

module.exports = redisClient;
