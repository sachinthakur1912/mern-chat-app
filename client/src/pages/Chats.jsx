import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
export default function Chats() {
  const [chats, setChats] = useState([]);
  const fetchData = async () => {
    const response = await axios.get("/api/chat");
    console.log(response);
    setChats(response.data);
  };
  useEffect(() => {
    fetchData();
  }, []);
  console.log(chats);
  return (
    <div>
      {chats.map((chat) => {
        console.log(chat);
        return (
          <div key={chat._id}>
            <h1>{chat.chatName}</h1>
          </div>
        );
      })}
    </div>
  );
}
