// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
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

  const traits = await TraitModel.find({
    trait_type: "Clothes",
    gender: { $exists: false },
  });

  for (const trait of traits) {
    const [parent_trait_1] = await TraitModel.find({
      value: trait.combos[0].first,
    });

    trait.gender = parent_trait_1.gender;
  }

  await TraitModel.bulkSave(traits);
  // .then((err) => {
  //   console.log("Success");
  // })
  // .catch((e) => {
  //   console.error("ERROR", e);
  // });

  // res.json(links);
}
