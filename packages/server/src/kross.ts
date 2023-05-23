import axios from "axios";
import { Request, Response } from "express";

export async function kross(req: Request, res: Response) {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() < 10 ? `0${now.getMonth()}` : now.getMonth();
    const day = now.getDate() < 10 ? `0${now.getDate()}` : now.getDate();

    const baseUrl = process.env.KROSS_API_URL;

    const getTokenResponse = await axios.post(`${baseUrl}/auth/get-token`, {
      api_key: process.env.KROSS_API_KEY,
      hotel_id: process.env.KROSS_HOTEL_ID,
      username: process.env.KROSS_USERNAME,
      password: process.env.KROSS_PASSWORD,
    });

    const getListResponse = await axios.post(
      `${baseUrl}/reservations/get-list`,
      {
        auth_token: getTokenResponse.data.data.auth_token,
        data: {
          date_reservation_from: `${year}-${month}-${day} 00:00`,
          date_reservation_to: `${year}-${month}-${day} 23:59`,
          cod_reservation_status: "CONF",
          with_rooms: true,
        },
      }
    );

    res.status(200).json(getListResponse.data);
  } catch (error) {
    res.status(500).json(error);
  }
}
