const express = require("express");
const router = express.Router();

const {
  accessChat,
  fetchChats,
  createGroup,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatControllers");
const { protect } = require("../middlewares/authMiddleware");

router.post("/accessChat", protect, accessChat);
router.get("/fetchChats", protect, fetchChats);
router.post("/createGroup", protect, createGroup);
router.put("/renameGroup", protect, renameGroup);
router.put("/addToGroup", protect, addToGroup);
router.put("/removeFromGroup", protect, removeFromGroup);
module.exports = router;
