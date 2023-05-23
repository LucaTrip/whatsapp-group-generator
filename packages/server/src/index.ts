import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";
import mongoose from "mongoose";

import { kross } from "./kross";
import { createWhatsappSession } from "./wa";
import { MongoStore } from "wwebjs-mongo";

dotenv.config();

const corsOptions: cors.CorsOptions = {
  origin: "http://localhost:3000",
};
const app = express();
const port = 8080;
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(express.json());

app.get("/kross", kross);

// socket connection with client
io.on("connection", (socket) => {
  console.log("socket connection with client", socket.id);

  mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("mongodb connected");
    const store = new MongoStore({ mongoose });

    socket.emit("mongodb_ready", { status: true });

    socket.on("connected", () => {
      console.log("socket connected", socket.id);
      createWhatsappSession(socket, store);
    });
  });
});

httpServer.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
