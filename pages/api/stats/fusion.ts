// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { compareDesc } from "date-fns";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  getDecommisionTokensAsObject,
  getFusedTokenIdsFromHtml,
  readServerDetails,
} from "utils/collection";
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
  const { lastUpdated } = readServerDetails();
  const decommissionedTokenIds = getDecommisionTokensAsObject();
  const fusedTokenIds = getFusedTokenIdsFromHtml();

  let decommissionedTokensArr = Object.values(decommissionedTokenIds);

  decommissionedTokensArr.sort(compareDesc);

  const totalFusions = decommissionedTokensArr.length;
  const lastFusion = decommissionedTokensArr[0].getTime();

  res.send({
    fusions: { total: totalFusions, lastFusion },
    tokens: { total: 10000 - totalFusions, fused: fusedTokenIds.length },
    lastUpdated,
  });
}
