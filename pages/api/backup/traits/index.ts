// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import auth from "middlewares/auth";
import { BackupTraitModel, TraitModel } from "models/server/traits";
import mongoose from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";
import { connectMongoDB } from "utils/connectDb";
type Data = {
  success: boolean;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  auth(req, res);
  await connectMongoDB();

  await mongoose.connection.db.dropCollection("backuptraits");

  const traits = (await TraitModel.find({}).exec()).map(
    (trait) => new BackupTraitModel(trait.toObject())
  );
  console.log("retrieved");

  await BackupTraitModel.bulkSave(traits);
  console.log("traits saved");
}
