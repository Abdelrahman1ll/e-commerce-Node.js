// const mongoose = require("mongoose");

// const connectTestDB = async () => {
//   await mongoose.connect(process.env.MONGODB_URI_TEST, {});
//   console.log("Connected to Test MongoDB...".blue);
// };

// module.exports = connectTestDB;



// test-setup.js
const mongoose = require("mongoose");

beforeAll(async () => {
  // Connect مرة واحدة قبل أي Test
  await mongoose.connect(process.env.MONGODB_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // بعد ما يخلص كل الـ tests
  await mongoose.connection.close();
});
