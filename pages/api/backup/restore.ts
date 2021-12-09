// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { BackupTokenModel, TokenModel } from "models/server/tokens";
import { BackupTraitModel, TraitModel } from "models/server/traits";
import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "utils/connectDb";
import auth from "../../../middlewares/auth";

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
  const tokens = (await BackupTokenModel.find({}).exec()).map(
    (token) => new TokenModel(token.toObject())
  );

  const traits = (await BackupTraitModel.find({}).exec()).map(
    (trait) => new TraitModel(trait.toObject())
  );

  console.log(tokens);
  console.log("retrieved");
  await TraitModel.bulkSave(traits);
  console.log("traits saved");

  await TokenModel.bulkSave(tokens);
  console.log("tokens saved");
}
