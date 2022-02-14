// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { TokenModel } from "models/server/tokens";
import { TraitModel } from "models/server/traits";
import type { NextApiRequest, NextApiResponse } from "next";
import { callMongoBackupDB, connectMongoDB } from "utils/connectDb";
import auth from "../../../middlewares/auth";

type Data = {
  success: boolean;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // auth(req, res);
  await connectMongoDB();

  const tokens = (await TokenModel.find({}).exec()).map(
    (token) => new TokenModel(token.toObject())
  );

  const traits = (await TraitModel.find({}).exec()).map(
    (trait) => new TraitModel(trait.toObject())
  );

  await callMongoBackupDB(async () => {
    console.log("tokens length", tokens.length);
    console.log("traits length", traits.length);

    await TraitModel.bulkSave(traits);
    console.log("traits saved");

    await TokenModel.bulkSave(tokens);
    console.log("tokens saved");

    res.send({ success: true, message: "Database Backed Up Successfully" });
  });
}
