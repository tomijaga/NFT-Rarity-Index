// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { updateNewlyDecommissionedTokens } from "utils/collection";
import { connectMongoDB } from "utils/connectDb";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await connectMongoDB()
  await updateNewlyDecommissionedTokens();
  res.send("Update Complete");
}
