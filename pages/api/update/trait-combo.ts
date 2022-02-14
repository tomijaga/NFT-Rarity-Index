// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import { ITrait, TraitModel } from "models/server/traits";
import type { NextApiRequest, NextApiResponse } from "next";
import { connectMongoDB } from "utils/connectDb";
import { writeFileSync } from "fs";
import { getTraitsAsObject } from "utils/traits";
import { sleep } from "utils/token";
const https = require("https");

// const httpsAgent = (require("https").globalAgent.options.ca =
//   require("ssl-root-cas").create());

type Data = {
  name: string;
};

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await connectMongoDB();

  // get previous traits
  const traitsObject = await getTraitsAsObject();
  const newCombos: ITrait[] = [];

  // for (const trait_type of Object.keys(traitsObject)) {
  //   const trait_values_obj = traitsObject[trait_type];
  //   const traitKeys = Object.keys(trait_values_obj).sort();

  //   const trait_net_total = trait_values_obj[traitKeys[0]].trait_net_total;

  //   for (const index_as_str in traitKeys) {
  //     const first_trait = traitKeys[index_as_str];

  //     const trait_1 = trait_values_obj[first_trait];
  //     for (let i = Number(index_as_str); i < traitKeys.length; i += 1) {
  //       const second_trait = traitKeys[i];

  //       console.log(trait_type, first_trait, second_trait);

  //       const { data } = await axios.get(
  //         `https://www.outkast.world:1337/combo/${first_trait}/${second_trait}`,
  //         { httpsAgent }
  //       );
  //       if (data.status === "Success") {
  //         const { name: combo_name, levelRequirment: levelRequirement } =
  //           data.result;

  //         // if trait exists
  //         if (!trait_values_obj[combo_name]) {
  //           const newCombo = new TraitModel({
  //             trait_type,
  //             value: combo_name,
  //             total: 0,
  //             trait_net_total,
  //             combos: [{ first: first_trait, second: second_trait }],
  //             levelRequirement: levelRequirement,
  //           });

  //           newCombos.push(newCombo);

  //           // add new combo trait to traits object
  //           trait_values_obj[newCombo.value] = newCombo;
  //         } else {
  //           const trait_data = trait_values_obj[combo_name];

  //           const is_combo_registered = trait_data.combos.find(
  //             ({ first, second }) => {
  //               return first_trait === first && second_trait === second;
  //             }
  //           );

  //           console.log(
  //             "trait exists ",
  //             levelRequirement,
  //             trait_data.levelRequirement
  //           );

  //           let add_to_updates = false;
  //           if (!is_combo_registered) {
  //             trait_data.combos.push({
  //               first: first_trait,
  //               second: second_trait,
  //             });

  //             if (
  //               !newCombos.find(
  //                 ({ trait_type, value }) =>
  //                   trait_type === trait_data.trait_type &&
  //                   value === trait_data.value
  //               )
  //             ) {
  //               add_to_updates = true;
  //             }
  //           }

  //           if (levelRequirement && !trait_data.levelRequirement) {
  //             console.log("level added", levelRequirement);
  //             trait_data.levelRequirement = levelRequirement;
  //             add_to_updates = true;
  //           }

  //           if (add_to_updates) {
  //             newCombos.push(trait_data);
  //             break;
  //           }
  //         }
  //         console.log(`/${first_trait}/${second_trait}`, data);
  //       }

  //       await sleep(10);
  //     }
  //   }
  // }

  // writeFileSync("collection/combo.json", JSON.stringify(newCombos));
  // await TraitModel.bulkSave(newCombos);
  // res.send("Traits Update Complete");
}
