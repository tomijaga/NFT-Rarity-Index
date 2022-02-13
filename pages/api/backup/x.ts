// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { BackupTokenModel, TokenModel } from "models/server/tokens";
import { BackupTraitModel, TraitModel } from "models/server/traits";
import type { NextApiRequest, NextApiResponse } from "next";
import { connectMongoDB } from "utils/connectDb";
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
  connectMongoDB();
  const tokens = await TokenModel.find({
    fusedWith: { $size: 0 },
    fused: true,
  }).exec();

  const token_u = tokens.map((token) => {
    token.fused = false;
    return token;
  });

  console.log(token_u);

  //   await TokenModel.bulkSave(token_u);

  res.send({ success: true, message: "🤞" });
}
