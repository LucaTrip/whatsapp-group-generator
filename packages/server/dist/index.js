"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var http_1 = __importDefault(require("http"));
var socket_io_1 = require("socket.io");
var dotenv = __importStar(require("dotenv"));
var kross_1 = require("./kross");
var wa_1 = require("./wa");
dotenv.config();
var corsOptions = {
    origin: "*",
};
var app = (0, express_1.default)();
var port = 8080;
var server = http_1.default.createServer(app);
var io = new socket_io_1.Server(server, { cors: corsOptions });
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.get("/kross", kross_1.kross);
io.on("connection", function (socket) {
    console.log("socket connection...", socket.id);
    socket.on("connected", function () {
        console.log("socket connected", socket.id);
        (0, wa_1.createWhatsappSession)(socket);
    });
});
server.listen(port, function () {
    return console.log("Express is listening at http://localhost:".concat(port));
});
