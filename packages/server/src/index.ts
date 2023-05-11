import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";

import { kross } from "./kross";
import { createWhatsappSession } from "./wa";

dotenv.config();

const corsOptions: cors.CorsOptions = {
  origin: "*",
};
const app = express();
const port = 8080;
const server = http.createServer(app);
const io = new Server(server, { cors: corsOptions });

app.use(cors(corsOptions));
app.use(express.json());

app.get("/kross", kross);

io.on("connection", (socket) => {
  console.log("socket connection...", socket.id);

  socket.on("connected", () => {
    console.log("socket connected", socket.id);
    createWhatsappSession(socket);
  });
});

server.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
