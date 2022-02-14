// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { IToken, TokenModel } from "models/server/tokens";
import { TraitModel } from "models/server/traits";
import type { NextApiRequest, NextApiResponse } from "next";
import { connectMongoDB, callMongoBackupDB } from "utils/connectDb";
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

  let tokens: IToken[] = [],
    traits: IToken[] = [];

  await callMongoBackupDB(async () => {
    tokens = await TokenModel.find({}).exec();

    traits = await TraitModel.find({}).exec();
  });

  await connectMongoDB();
  console.log("retrieved backup data");

  await TraitModel.bulkSave(traits);
  console.log("traits saved");

  await TokenModel.bulkSave(tokens);
  console.log("tokens saved");
}
