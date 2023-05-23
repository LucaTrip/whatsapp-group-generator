"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWhatsappSession = void 0;
var whatsapp_web_js_1 = require("whatsapp-web.js");
function createWhatsappSession(socket) {
  /* const waClient = new Client({
      authStrategy: new LocalAuth({
        clientId: "umbnbsolutions",
      }),
    }); */
  var waClient = new whatsapp_web_js_1.Client({
    authStrategy: new whatsapp_web_js_1.NoAuth(),
  });
  waClient.on("qr", function (qr) {
    console.log("generated qr-code");
    socket.emit("wa_qrcode", { qr: qr });
  });
  waClient.on("authenticated", function () {
    console.log("authenticated");
    socket.emit("wa_authentication_status", { status: true });
  });
  waClient.on("disconnected", function () {
    console.log("disconnected");
    socket.emit("wa_authentication_status", { status: false });
  });
  waClient.on("ready", function () {
    console.log("Client is ready!");
    socket.emit("wa_ready", { status: true });
  });
  socket.on("create-wa-group", function (_a) {
    var groupName = _a.groupName,
      usersList = _a.usersList;
    console.log("create whatsapp group");
    waClient
      .createGroup(
        groupName,
        usersList.map(function (_a) {
          var phoneNumber = _a.phoneNumber;
          var number = phoneNumber.substring(1);
          return "".concat(number, "@c.us");
        })
      )
      .then(function (res) {
        console.log("whatsapp group created!", res);
        return waClient.sendMessage(
          res.gid._serialized,
          "Ciao raga, \uD83D\uDCAA\uD83C\uDFFB questo gruppo \u00E8 una prova ed \u00E8 stato creato da un bot! I partecipanti sono ".concat(
            usersList.map(function (user) {
              return user.fullName.split(" ")[0];
            })
          )
        );
      })
      .then(function (res) {
        console.log("message sent to group", res);
        socket.emit("wa_group", { created: true });
      })
      .catch(function (err) {
        console.log("whatsapp group creation error", err);
        socket.emit("wa_group", { created: false });
      });
  });
  waClient.initialize();
}
exports.createWhatsappSession = createWhatsappSession;
