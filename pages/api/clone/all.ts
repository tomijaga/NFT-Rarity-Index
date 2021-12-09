// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { TokenModel } from "models/server/tokens";
import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "utils/connectDb";
import auth from "../../../middlewares/auth";
import {
  cloneCollection,
  getTokensFromFileStorage,
  updateToken,
} from "../../../utils/token";

type Data = {
  success: boolean;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  auth(req, res);
  connectDB();
  const rawId = req.query.id;

  if (rawId) {
  }
}
