// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { BackupTokenModel, TokenModel } from "models/server/tokens";
import { BackupTraitModel, TraitModel } from "models/server/traits";
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
  const tokens = (await TokenModel.find({}).exec()).map(
    (token) => new BackupTokenModel(token.toObject())
  );

  const traits = (await TraitModel.find({}).exec()).map(
    (trait) => new BackupTraitModel(trait.toObject())
  );
  console.log(tokens);
  console.log("retrieved");
  await BackupTraitModel.bulkSave(traits);
  console.log("traits saved");

  await BackupTokenModel.bulkSave(tokens);
  console.log("tokens saved");
}