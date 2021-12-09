// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import connectDb from "utils/connectDb";
import { getPossibleCombinations } from "../../../../utils/token";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any[] | any>
) {
  const id = Number(req.query.id);

  if (id < 1 || id > 10000) {
    return res.status(400).send("Token id is out of range: [1, 10000]");
  }

  await connectDb();
  const { token, combinations } = await getPossibleCombinations(id);

  res.status(200).json({ token, combinations });
}
