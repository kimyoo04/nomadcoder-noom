import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);
