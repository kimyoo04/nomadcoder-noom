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

// 서버의 socket은 연결된 브라우저를 뜻함
function handleConnection(socket) {
  console.log(socket);
}
// after connection ==> 브라우저가 socket을 받는다.
wss.on("connection", handleConnection);

server.listen(3000, handleListen);
