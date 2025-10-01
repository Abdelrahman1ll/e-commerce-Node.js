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
