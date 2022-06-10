import express from "express";
import router from "./routes/routes";
import cors from "cors";
import bodyParser from "body-parser";

import {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} from "./controllers/Users";

const http = require("http");
const { Server } = require("socket.io");
const app = express();
app.use(cors());
app.use(bodyParser.json());
const server = http.createServer(app);

//Socket.io + Node.js Cross-Origin Request
const io = new Server(server, {
  cors: {
    // origin: "http://localhost:3010",
    origins: ["*"],
    handlePreflghtRequest: (req, res) => {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "get,post",
        "Access-Control-Allow-Credentials": "true",
      });
      res.end();
    },
  },
});

//Connection
io.on("connection", (socket) => {
  console.log("lab2 pushAndPull");
  //Room Creation
  socket.on("join", ({ NAME, ROOM }, callback) => {
    const { error, user } = addUser({ ID: socket.id, NAME, ROOM });

    if (error) return callback(error);
    socket.join(user.ROOM);

    //To send Messages
    socket.emit("message", {
      user: "Admin",
      text: `${user.NAME},Welcome to Chat Room ${user.ROOM}.`,
    });
    socket.broadcast
      .to(user.ROOM)
      .emit("message", { user: "Admin", text: `${user.NAME} Has Joined!` });
    io.to(user.ROOM).emit("ROOMData", {
      ROOM: user.ROOM,
      users: getUsersInRoom(user.ROOM),
    });

    callback();
  });

  //To Recieve Messages
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.ROOM).emit("message", { user: user.NAME, text: message });

    callback();
  });

  //Disconnection
  socket.on("diconnection", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.ROOM).emit("message", {
        user: "Admin",
        text: `${user.NAME} Has Left.`,
      });
      io.to(user.ROOM).emit("ROOMData", {
        room: user.ROOM,
        users: getUsersInRoom(user.ROOM),
      });
    }
  });
});

// app.get("/", (req, res) => {
//   res.send("<h1>Hello world</h1>");
// });

app.use(router);
server.listen(3000, () => {
  console.log("listening on *:3000");
});
