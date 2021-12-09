// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "utils/connectDb";
import { Token, TokenModel, IToken } from "../../../models/server/tokens";
import { getTokensSortedByRarity } from "../../../utils/rarity";

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
  connectDB();

  const { limit: limit_as_str, offset: offset_as_str } = req.query;

  const limit_num = Number(limit_as_str);
  const offset_num = Number(offset_as_str);

  const limit = Number.isNaN(limit_num) ? 100 : limit_num;
  const offset = Number.isNaN(offset_num) ? 0 : offset_num;

  if (limit > 100) res.status(400).json("The max limit is 100");

  const tokens = (
    await TokenModel.getOutkasts().sort("rank").skip(offset).limit(limit)
  ).map((token: IToken, i: number) => {
    return { ...token.toObject(), rank: offset + i + 1 };
  });

  res.status(200).json(tokens);
  //   } else {
  //     res.status(404).json("Out of bounds");
  //   }
}
