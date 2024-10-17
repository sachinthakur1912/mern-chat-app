const { default: mongoose } = require("mongoose");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

exports.accessChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { userId: userId } } },
      { users: { $elemMatch: { userId: req.user._id } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });
  if (isChat.length > 0) {
    return res.status(200).json({ chat: isChat[0] });
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [userId, req.user._id],
    };
    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id })
        .populate("users", "-password")
        .populate("latestMessage");
      return res.status(200).json({ chat: fullChat });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    }
  }
};
exports.fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).json({ chats: results });
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
exports.createGroup = async (req, res) => {
  console.log(req.body.user);
  if (!req.body.user || !req.body.name) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  let users = req.body.user;
  console.log("userssss", users);
  if (users.length < 2) {
    return res.status(400).json({ message: "Please add more users" });
  }
  console.log("req.user", req.user);
  users.push(req.user._id);
  console.log("users", users);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      isGroup: true,
      users: users,
      groupAdmin: req.user,
    });
    console.log("groupChat", groupChat);
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    return res.status(200).json({ chat: fullGroupChat });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
exports.renameGroup = async (req, res) => {
  try {
    const { chatId, name } = req.body;
    if (!chatId || !name) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName: name },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!updatedChat) {
      return res.status(400).json({ message: "Chat not found" });
    }
    return res.status(200).json({
      message: "Chat renamed successfully",
      chat: updatedChat,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error occured while renaming the chat" });
  }
};
exports.addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    if (!chatId || !userId) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!added) {
      return res.status(400).json({ message: "Chat not found" });
    }
    return res.status(200).json({
      message: "User added successfully",
      chat: added,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error occured while adding the user" });
  }
};

exports.removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    updatedGroupChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!updatedGroupChat) {
      return res.status(400).json({ message: "Chat not found" });
    }
    return res.status(200).json({
      message: "User removed",
      chat: updatedGroupChat,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error occured while removing the user" });
  }
};
