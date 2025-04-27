const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI,{
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // connectTimeoutMS: 60000,
    });
    // const db = mongoose.connection.db;
    // const collection = db.collection("users");

    // // Check if the index exists
    // const indexes = await collection.indexes();
    // const indexExists = indexes.some(
    //   (index) => index.name === "name_1" && index.lastName === "lastName_1"
    // );

    // if (indexExists) {
    //   // Drop the index if it exists
    //   await collection.dropIndex("name_1");
    //   await collection.dropIndex("lastName_1");
    // } else {
    //   // Create the index if it doesn't exist
    //   await collection.createIndex({ name: 1 }, { unique: false });
    //   await collection.createIndex({ lastName: 1 }, { unique: false });
    // }
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // أغلق التطبيق في حالة فشل الاتصال
  }
};

module.exports = connectDB;
