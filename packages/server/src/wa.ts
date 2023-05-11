import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Client, LocalAuth, NoAuth } from "whatsapp-web.js";

export function createWhatsappSession(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  /* const waClient = new Client({
    authStrategy: new LocalAuth({
      clientId: "umbnbsolutions",
    }),
  }); */

  const waClient = new Client({
    authStrategy: new NoAuth(),
  });

  waClient.on("qr", (qr) => {
    console.log("generated qr-code");
    socket.emit("wa_qrcode", { qr });
  });

  waClient.on("authenticated", () => {
    console.log("authenticated");
    socket.emit("wa_authentication_status", { status: true });
  });

  waClient.on("disconnected", () => {
    console.log("disconnected");
    socket.emit("wa_authentication_status", { status: false });
  });

  waClient.on("ready", () => {
    console.log("Client is ready!");
    socket.emit("wa_ready", { status: true });
  });

  socket.on("create-wa-group", ({ groupName, usersList }) => {
    console.log("create whatsapp group");

    waClient
      .createGroup(
        groupName,
        usersList.map(({ phoneNumber }: any) => {
          const number = phoneNumber.substring(1);
          return `${number}@c.us`;
        })
      )
      .then((res) => {
        console.log("whatsapp group created!", res);
        return waClient.sendMessage(
          (res.gid as any)._serialized,
          `Ciao raga, 💪🏻 questo gruppo è una prova ed è stato creato da un bot! I partecipanti sono ${usersList.map(
            (user: any) => user.fullName.split(" ")[0]
          )}`
        );
      })
      .then((res) => {
        console.log("message sent to group", res);
        socket.emit("wa_group", { created: true });
      })
      .catch((err) => {
        console.log("whatsapp group creation error", err);
        socket.emit("wa_group", { created: false });
      });
  });

  waClient.initialize();
}
