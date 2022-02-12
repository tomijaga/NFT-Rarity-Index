// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "utils/connectDb";
import { Token, TokenModel } from "../../../models/server/tokens";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Token[] | string>
) {
  connectDB();

  try {
    const { limit, offset, sort } = req.query;

    const fusedOutkasts = await TokenModel.getFusedOutkasts()
      .where("decommissioned")
      .equals(false)
      .sort(sort)
      .limit(Number(limit) || 50)
      .skip(Number(offset) || 0);

    res.status(200).json(fusedOutkasts);
  } catch (e: any) {
    res.status(400).send(e.message);
  }
}
