// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { updateNewlyDecommissionedTokens } from "utils/collection";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await updateNewlyDecommissionedTokens();
  res.send("Update Complete");
}
