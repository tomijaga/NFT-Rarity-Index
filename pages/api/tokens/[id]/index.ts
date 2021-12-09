// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import connectDb from "utils/connectDb";
import { Token, TokenModel } from "../../../../models/server/tokens";

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
