// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { connectMongoDB } from "utils/connectDb";
import { IToken, Token, TokenModel } from "../../../models/server/tokens";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | Token[]
    | string
    | {
        rank: number;
      }
  >
) {
  connectMongoDB();

  const { limit, offset, sort } = req.query;

  const tokens = await TokenModel.getOutkasts()
    .sort(sort)
    .limit(Number(limit) || 50)
    .skip(Number(offset) || 0);

  res.status(200).json(tokens);
  //   } else {
  //     res.status(404).json("Out of bounds");
  //   }
}
