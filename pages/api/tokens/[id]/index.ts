// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { readFile, statSync } from "fs";
import { Token, TokenModel } from "../../../../models/server/tokens";
import { TraitModel } from "../../../../models/server/traits";

import { getTokenFromFileStorage, getTokenPath } from "../../../../utils/token";
import { getTokenHistory } from "../../../../utils/history";
import { getRankedToken } from "../../../../utils/rarity";

import connectDb from "utils/connectDb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Token | string>
) {
  const id = Number(req.query.id);

  if (id < 1 || id > 10000) {
    return res.status(400).send("Token id is out of range: [1, 10000]");
  }

  await connectDb();
  const token = await TokenModel.findByTokenId(id);

  if (token) {
    res
      .status(200)
      .json({ ...token.toObject() /*rank: 1  await getRank(id)*/ });
  }
}
