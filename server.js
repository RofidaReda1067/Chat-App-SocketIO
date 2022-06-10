const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
/////////////////////////////////////////////////
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
///////////////////////////////////////////
const users = [];
//ADD uSER
const addUser = ({ ID, NAME, ROOM }) => {
  NAME = NAME.trim().toLowerCase();
  ROOM = ROOM.trim().toLowerCase();
  const currUser = users.find(
    (users) => users.ROOM === ROOM && users.NAME === Name
  );

  //validation
  if (currUser) {
    return { error: "User is Already here!" };
  }
  const user = { ID, NAME, ROOM };
  users.push(user);
  return { user };
};
////////////////////////////////////////////
// REMOVE USER
const removeUser = (ID) => {
  const index = users.findIndex((user) => user.ID === ID);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//GET USER
const getUser = (ID) => users.find((user) => user.ID === ID);
//GET USERS IN ROOM
const getUsersInRoom = (room) => users.filter((user) => user.ROOM === ROOM);
//test validation
const Valid = (req, res) => {
  res.send("Server is running now !!");
};
////////////////////////////////////////////////
const router = express.Router();

//Get
router.get("/", Valid);
app.use(router);
server.listen(3000, () => {
  console.log("listening on:3000");
});
