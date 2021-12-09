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
import { updateNewlyDecommissionedTokens } from "utils/collection";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  updateNewlyDecommissionedTokens();
}
