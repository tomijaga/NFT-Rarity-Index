// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { TokenModel } from "models/server/tokens";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const token = await TokenModel.findByTokenId(1);

  const trait = token?.attributes?.[1];

  if (trait) {
    console.log(trait);

    trait.total -= 1;
    trait.trait_net_total -= 1;

    const result = await trait.save();
    console.log({ result });
  }
}
