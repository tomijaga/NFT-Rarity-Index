// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getDecommisionTokensAsObject } from "utils/collection";
import connectDB from "utils/connectDb";
import auth from "../../../middlewares/auth";

type Data = {
  success: boolean;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | any>
) {
  connectDB();
  const decommissionedTokenIds = getDecommisionTokensAsObject();

  const totalFusions = Object.keys(decommissionedTokenIds).length;
  res.send({
    fusions: { total: totalFusions },
    tokens: { total: 10000 - totalFusions },
  });
}
