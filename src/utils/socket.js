const socket = require("socket.io");
const Chat = require("../models/chat ");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ firstName, senderId, targetUserId, text }) => {
      const roomId = [senderId, targetUserId].sort().join("_");
      
      try {
        let chat = await Chat.findOne({
          participants: { $all: [senderId, targetUserId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [senderId, targetUserId],
            messages: [],
          });
        }

        chat.messages.push({
          sender: senderId,
          content: text,
        });

        await chat.save();
        
        // This emits to EVERYONE in the room including the sender
        io.to(roomId).emit("messageReceived", { firstName, text, senderId });
        
      } catch (err) {
        console.error("Error in sendMessage:", err);
      }
    });
  });
};

module.exports = initializeSocket;