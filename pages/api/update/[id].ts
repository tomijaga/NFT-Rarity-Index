// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "utils/connectDb";
import { updateTokensRarity } from "utils/rarity";
import {
  updateToken
} from "../../../utils/token";

type Data = {
  success: boolean;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  connectDB();
  const rawId = req.query.id;

  if (rawId) {
    const id = Number(rawId);

    if (!(id >= 1 && id <= 10000)) {
      return res.status(400).json({
        success: false,
        message: `Token id of '${id}' is out of range: [1, 10000]`,
      });
    }
    res.status(200).json({
      success: false,
      message: `Token ${id} added to the updae Queue`,
    });

    const result = await updateToken(id);

    await updateTokensRarity();

    //   .then(() => {
    //     const message = `Outkast ${id} successfully cloned`;
    //     console.log(message);

    //     res.status(200).json({
    //       success: true,
    //       message: message,
    //     });
    //   })
    //   .catch((err) => {
    //     console.error(err);

    //     res.status(400).json({ success: false, message: err.message });
    //   });
  }
}
