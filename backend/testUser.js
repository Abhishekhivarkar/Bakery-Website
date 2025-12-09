require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to DB",mongoose.connection.name))
  .catch(err => console.error(err));

async function test() {
  try {
    const user = await User.create({
      name: "Test User",
      email: "testuser1@example.com",
      username: "testuser1",
      password: "123456"
    });
    console.log("User saved:", user);
    process.exit(0);
  } catch (err) {
    console.error("Error saving user:", err);
    process.exit(1);
  }
}

test();
