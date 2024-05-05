import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { messageModel } from "./DataBase/message.schema.js";

export const app = express();
app.use(cors());

export const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let users = {};
io.on("connect", (socket) => {
  socket.on("new-user-joined", (name) => {
    users[socket.id] = name;
    socket.broadcast.emit("user-joined", name);
    socket.emit("joineduserList", users);
    socket.broadcast.emit("usersListUpdated", users);
    messageModel
      .find()
      .sort({ timeStamp: 1 })
      .limit(50)
      .then((message) => {
        socket.emit("previousMessages", message);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  socket.on("send", (message) => {
    new messageModel({
      username: users[socket.id],
      text: message,
    }).save();
    socket.broadcast.emit("receive", {
      message: message,
      name: users[socket.id],
    });
  });

  socket.on("userTyping", (userName) => {
    socket.broadcast.emit("userTypingBroadcast", users[socket.id]);
  });
  socket.on("userTypingCompleted", (userName) => {
    socket.broadcast.emit("userTypingCompletedBroadcast", users[socket.id]);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    socket.emit("joineduserList", users);
    socket.broadcast.emit("usersListUpdated", users);
  });
});
