const mongoose = require("mongoose");

const connectTestDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI_TEST, {});
  console.log("Connected to Test MongoDB...".blue);
};

module.exports = connectTestDB;
