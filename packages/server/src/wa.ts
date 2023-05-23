import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Client, RemoteAuth } from "whatsapp-web.js";
import { IKrossReservationUser, IUser } from "./models/models";
import { MongoStore } from "wwebjs-mongo";

const sessionName = "umbrianconcierge";

interface ICreateWhatsAppGroup {
  groupName: string;
  adminList: IUser[];
  guestInfo: IKrossReservationUser;
}

export async function createWhatsappSession(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  store: typeof MongoStore
) {
  const waClient = new Client({
    authStrategy: new RemoteAuth({
      store,
      clientId: sessionName,
      backupSyncIntervalMs: 300000,
    }),
  });

  waClient.on("remote_session_saved", () => {
    console.log("remote session exist");
    socket.emit("wa_ready", { status: true });
  });

  waClient.on("qr", (qr) => {
    console.log("generated qr-code");
    socket.emit("wa_qrcode", { qr });
  });

  waClient.on("authenticated", async () => {
    console.log("authenticated on WhatsApp");
    socket.emit("wa_authentication_status", { status: true });
  });

  waClient.on("disconnected", async () => {
    console.log("disconnected from WhatsApp");
    socket.emit("wa_authentication_status", { status: false });
  });

  waClient.on("ready", () => {
    console.log("Client is ready!");
    socket.emit("wa_ready", { status: true });
  });

  socket.on(
    "create-wa-group",
    ({ groupName, adminList, guestInfo }: ICreateWhatsAppGroup) => {
      console.log("create whatsapp group");

      waClient
        .createGroup(groupName, [
          ...adminList.map(({ phoneNumber }: any) => {
            const number = phoneNumber.substring(1);
            return `${number}@c.us`;
          }),
          `${guestInfo.phone.trim().substring(1)}@c.us`,
        ])
        .then((res) => {
          console.log("whatsapp group created!", res);
          return waClient.sendMessage(
            (res.gid as any)._serialized,
            `*${guestInfo.rooms[0].name_room_type}*

        Buongiorno *${guestInfo.label}*,
        noi siamo Marco,
        ${adminList.map((admin) => admin.fullName.split(" ")[0])}
        i Tuoi Concierge a Perugia! 😃

        A questo link potrai trovare tutte le info riguardanti la tua camera https://umbnbsolutions.kross.travel/guest/my-reservation?tag=${
          guestInfo.tag
        }.

        Benvenuta nella Tua
        Smart Reception`
          );
        })
        .then((res) => {
          socket.emit("wa_group", { created: true });
        })
        .catch((err) => {
          console.log("whatsapp group creation error", err);
          socket.emit("wa_group", { created: false });
        });
    }
  );

  waClient.initialize();
}
