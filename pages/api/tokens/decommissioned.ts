// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "utils/connectDb";
import { Token, TokenModel } from "../../../models/server/tokens";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Token[] | any>
) {
  connectDB();
  try {
    const decommissionedTokens = await TokenModel.getDecommissionedOutkasts();
    res.status(200).json({
      count: decommissionedTokens.length,
      tokens: decommissionedTokens,
    });
  } catch (err: any) {
    res.status(400).send(err.message);
  }
}
