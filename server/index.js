const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDb = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const app = express();
dotenv.config();
connectDb();
app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
