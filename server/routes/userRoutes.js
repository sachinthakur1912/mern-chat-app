const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getAllUsers,
} = require("../controllers/userControllers");
const { protect } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/", protect, getAllUsers);
module.exports = router;
