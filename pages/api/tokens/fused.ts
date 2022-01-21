// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "utils/connectDb";
import { Token, TokenModel } from "../../../models/server/tokens";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ count: number; tokens: Token[] } | string>
) {
  connectDB();
  try {
    const fusedOutkasts = await TokenModel.getFusedOutkasts()
      .where("decommissioned")
      .equals(false)
      .sort("-lastModified");

    res.status(200).json({
      count: fusedOutkasts.length,
      tokens: fusedOutkasts,
    });
  } catch (e: any) {
    res.status(400).send(e.message);
  }
}
