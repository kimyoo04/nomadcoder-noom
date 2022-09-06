import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// http server
const server = http.createServer(app);
// wss server on top of http server
const wss = new WebSocket.Server({server});

// 서버와 연결되는 브라우저들 담는 array
const sockets = [];

// after connection ==> 브라우저가 socket을 받는다.
wss.on("connection", (socket) => {
  sockets.push(socket);
  // 아래의 코드들은 브라우저가 서버에 connection 되었을 때만 실행
  console.log("Connected to Browser ✅");

  // 브라우저가 꺼지면 작동
  socket.on("close", () => console.log("Disconnected from the Browser ❌"));

  // 서버에서 프론트로 메시지 전송
  socket.on("message", (message) => {
    sockets.forEach((aSocket) => aSocket.send(message.toString()));
  });
});

server.listen(3000, handleListen);
