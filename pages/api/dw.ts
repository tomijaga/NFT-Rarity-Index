// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Token, TokenModel } from "models/server/tokens";
import { TraitModel } from "models/server/traits";
import type { NextApiRequest, NextApiResponse } from "next";
import { connectMongoDB } from "utils/connectDb";
import { getTraitsAsObject, updateTraitsTotal } from "utils/traits";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await connectMongoDB();

  // const tokens = await TokenModel.getOutkasts();

  // const traits = await getTraitsAsObject();

  // tokens.map((token) => {
  //   token.attributes.push(traits["Level"][token.level]);
  // });

  // await TokenModel.bulkSave(tokens);

  res.send("done");
}

// function trim(token: Token, id: number, fusions: Array<number>) {
//   if (token.history) {
//     const { previous, fusion } = token.history;
//     if (fusion) {
//       if (fusion.id === id) {
//         token.history = null;
//         return token;
//       } else if (fusions.includes(fusion.id)) {
//         if (token.history.previous) {
//           return trim(token.history.previous, id, fusions);
//         }
//         return token.history.previous;
//       }
//       fusions.push(fusion.id);

//       token.history.fusion = trim(fusion, id, fusions);
//     }

//     if (previous) {
//       token.history.previous = trim(previous, id, fusions);
//     }
//   }

//   return token;
// }
