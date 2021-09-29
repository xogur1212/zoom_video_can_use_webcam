import http from "http";
import {
  Server
} from "socket.io";
import {
  instrument
} from "@socket.io/admin-ui";
import express from "express";

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));
const handleListen = () => console.log(`Listening on http://localhost:3000`);
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
 
});
instrument(wsServer,{
  auth:false
});

function publicRooms() {
  const {
    sockets: {
      adapter: {
        sids,
        rooms
      }
    }
  } = wsServer;
  //위랑 아래랑 같음
  // const sids=wsServer.sockets.adapter.sids;
  //const rooms= wsServer.sockets.adapter.rooms;

  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {

  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  socket.onAny((event) => {
    console.log(wsServer.sockets.adapter)
    console.log(`Socket Event:${event}`);

  })
  socket.on("enter_room", (roomName, done) => {

    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());

  });
  socket.on("disconnecting", () => {
    console.log("qwe", socket.rooms);
    socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1));
    //discoonecting은 아직 연결이 끊기기전이라 -1 해줘야된다.



  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  })
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}:${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname;
  });
});

httpServer.listen(3000, handleListen);