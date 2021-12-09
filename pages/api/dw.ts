// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import auth from "../../middlewares/auth";
import axios from "axios";
import {
  appendFile,
  fsyncSync,
  mkdir,
  readFileSync,
  rename,
  renameSync,
} from "fs";
import {
  getTokenPath,
  getTokensFromFileStorage,
  formatTokensInitData,
  downloadTokenImage,
} from "../../utils/token";
import cheerio from "cheerio";
import connectDB from "utils/connectDb";
import { TokenModel } from "models/server/tokens";

import { getTokenFromFileStorage } from "../../utils/token";
import { uploadImageToS3 } from "../../utils/s3";
import Jimp from "jimp";

import { compressImage } from "utils/compress";
import { readdir } from "fs/promises";
import { TraitModel } from "models/server/traits";
import traits from "./backup/traits";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await connectDB();

  const traits = await TraitModel.find({
    trait_type: "Clothes",
    gender: { $exists: false },
  });

  for (const trait of traits) {
    const [parent_trait_1] = await TraitModel.find({
      value: trait.combos[0].first,
    });

    trait.gender = parent_trait_1.gender;
  }

  await TraitModel.bulkSave(traits);
  // .then((err) => {
  //   console.log("Success");
  // })
  // .catch((e) => {
  //   console.error("ERROR", e);
  // });

  // res.json(links);
}
