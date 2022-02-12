// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Token, TokenModel } from "models/server/tokens";
import { TraitModel } from "models/server/traits";
import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "utils/connectDb";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await connectDB();
  //trim
  const token = await TokenModel.findOne({ id: 1674 });

  // if (token) {
  //   const newToken = trim(token, token.id, []);

  //   console.log(newToken);
  //   return res.json(newToken);
  // }
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
