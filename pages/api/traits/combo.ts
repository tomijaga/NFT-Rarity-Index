// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { connectMongoDB } from "utils/connectDb";
import { getCombinedTraits } from "utils/traits";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await connectMongoDB();

  const result = await getCombinedTraits();

  res.status(200).json(result);
}
