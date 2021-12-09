import { writeFileSync } from "fs";
import { TokenModel } from "models/server/tokens";
import { ITrait, TraitModel } from "models/server/traits";
import { TraitType } from "../models/server/trait-type";
import { getTokensFromFileStorage } from "./token";

export type TraitObject = {
  [P in TraitType]: {
    data: {
      [value: string | number]: {
        total: number;
        rarity_score: number;
      };
    };
    trait_net_total: number;
  };
};
export const populateTraits = async () => {
  const tokens = await getTokensFromFileStorage();
  console.log("Retrieved tokens");

  const traits: TraitObject = {} as TraitObject;

  for (const token of tokens) {
    if (!token.decommissioned) {
      const { attributes } = token;
      if (attributes) {
        let trait_count = 0;
        for (const attribute of attributes) {
          const { trait_type, value } = attribute;
          if (
            trait_type !== "Experience" &&
            trait_type !== "Level" &&
            trait_type !== "Trait Count"
            // && value.toString().toLowerCase() !== "none"
          ) {
            const trait = traits[trait_type];
            if (trait) {
              const traitValue = trait.data[value];
              if (traitValue) {
                traitValue.total += 1;
              } else {
                traits[trait_type].data[value] = { total: 1, rarity_score: 0 };
              }
            } else {
              traits[trait_type] = {
                data: {
                  [value]: { total: 1, rarity_score: 0 },
                },
                trait_net_total: 0,
              };
            }

            if (value.toString().toLowerCase() !== "none") {
              traits[trait_type].trait_net_total += 1;
              trait_count += 1;
            }
          }
        }
        if (trait_count) {
          if (traits["Trait Count"]) {
            if (traits["Trait Count"].data[trait_count]) {
              traits["Trait Count"].data[trait_count].total += 1;
            } else {
              traits["Trait Count"].data[trait_count] = {
                total: 1,
                rarity_score: 0,
              };
            }
          } else {
            traits["Trait Count"] = {
              data: { [trait_count]: { total: 1, rarity_score: 0 } },
              trait_net_total: 0,
            };
          }
          traits["Trait Count"].trait_net_total += 1;
        } else {
          console.log(token);
        }
      } else {
        console.log(token);
      }
    }
  }

  for (const trait of Object.values(traits)) {
    for (const key in trait.data) {
      const value = trait.data[key];
      if (key === "None") {
        value.rarity_score =
          1 / ((trait.trait_net_total + value.total) / value.total);
      } else {
        value.rarity_score = 1 / (value.total / trait.trait_net_total);
      }
    }
  }

  writeFileSync("collection/traits.json", JSON.stringify(traits));
};

export const getCombinedTraits = async () => {
  return await TraitModel.find({ "combos.0": { $exists: true } });
};

export const getTraitsAsObject = async () => {
  const rawTraits = (await TraitModel.find({})) as ITrait[];

  const traits: {
    [x: string]: { [x: string]: ITrait };
  } = {} as any;

  for (const rawTrait of Object.values(rawTraits)) {
    let trait_type = traits[rawTrait.trait_type];

    if (trait_type) {
      trait_type[rawTrait.value] = rawTrait;
    } else {
      traits[rawTrait.trait_type] = { [rawTrait.value]: rawTrait };
    }
  }
  return traits;
};

export const replaceAttrWithTraitRef = async () => {
  let tokens = await getTokensFromFileStorage();
  const traits = await getTraitsAsObject();

  const tokensWithRef = tokens.map((token) => {
    token.decommissioned = false;
    token.fused = false;
    token.fusedWith = [];
    token.lastModified = 1636329128000;

    token.attributes = token.attributes
      ?.filter(({ trait_type, value }) => {
        if (trait_type === "Experience") {
          token.experience = Number(value);
          return false;
        } else if (trait_type === "Level") {
          token.level = Number(value);
          return false;
        } else if (trait_type === "Trait Count") {
          return false;
        }
        return true;
      })
      .map(({ trait_type, value }) => {
        return traits[trait_type][value];
      });

    token.attributes?.push(traits["Trait Count"][token.attributes.length]);

    if (Number.isNaN(Number(token.experience))) {
      console.log(token.id);
    }
    return new TokenModel(token);
  });

  await TokenModel.bulkSave(tokensWithRef);
};

// export const calculateTraitsRarityScore = async () => {
//   let traits: TraitObject;

//   try {
//     traits = getTraitsAsObject();
//   } catch (err) {
//     await populateTraits();

//     calculateTraitsRarityScore();
//     return;
//   }

//   const { traitsTotal, data } = traits;

//   for (const traitType of Object.values(data)) {
//     for (const traitValue of Object.values(traitType)) {
//       const { total } = traitValue;
//       traitValue.rarity_score = 1 / (total / traitsTotal);
//     }
//   }

//   writeFileSync("collection/traits.json", JSON.stringify(traits));
// };
