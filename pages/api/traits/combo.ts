// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import auth from "../../../middlewares/auth";
import axios from "axios";
import { mkdir, readFileSync } from "fs";
import {
  getTokenPath,
  getTokensFromFileStorage,
  formatTokensInitData,
} from "../../../utils/token";
import cheerio from "cheerio";
import { BackupTraitModel, TraitModel } from "models/server/traits";
import { getCombinedTraits, getTraitsAsObject } from "utils/traits";
import connectDB from "utils/connectDb";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await connectDB();

  const result = await getCombinedTraits();

  res.status(200).json(result);
}
