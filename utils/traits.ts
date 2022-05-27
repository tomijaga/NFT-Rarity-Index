import { readFileSync, writeFileSync } from "fs";
import { TokenModel } from "models/server/tokens";
import {
  ITraitCollecton,
  TraitCollectionModel,
  TraitCollecton,
  TraitType,
} from "models/server/trait-collection";
import { ITrait, TraitModel } from "models/server/traits";

export type TraitObjectForRarity = {
  [P in TraitType]: {
    data: {
      [value: string | number]: {
        total: number;
      };
    };
    trait_net_total: number;
  };
};

export const populateTraits = async () => {
  const tokens = await TokenModel.getOutkasts();

  console.log("Retrieved tokens");

  const traits: TraitObjectForRarity = {} as TraitObjectForRarity;

  for (const token of tokens) {
    if (!token.decommissioned) {
      const { attributes } = token;
      if (attributes) {
        attributes.push({
          trait_type: "Level",
          value: token.level.toString(),
          total: 0,
        } as any);
        let trait_count = 0;
        for (const attribute of attributes) {
          const { trait_type, value } = attribute;
          if (
            trait_type !== "Experience" &&
            trait_type !== "Trait Count"
            // && value.toString().toLowerCase() !== "none"
          ) {
            const trait = traits[trait_type];
            if (trait) {
              const traitValue = trait.data[value];
              if (traitValue) {
                traitValue.total += 1;
              } else {
                traits[trait_type].data[value] = { total: 1 };
              }
            } else {
              traits[trait_type] = {
                data: {
                  [value]: { total: 1 },
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
              };
            }
          } else {
            traits["Trait Count"] = {
              data: { [trait_count]: { total: 1 } },
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

  writeFileSync("collection/traits.json", JSON.stringify(traits));
};

export const getCombinedTraits = async () => {
  const traits = await TraitModel.find({ "combos.0": { $exists: true } }).sort(
    "-date"
  );

  const combosAsIndependentTraits: any[] = [];

  traits.map((trait) => {
    if (trait.combos.length > 1) {
      const variants = trait.combos.map((combo: any) => {
        return { ...trait.toObject(), combos: [combo] };
      });
      combosAsIndependentTraits.push(...variants);
    } else {
      combosAsIndependentTraits.push(trait);
    }
  });

  return combosAsIndependentTraits;
};

export interface TraitObjectFromDB {
  [x: string]: { [x: string]: ITrait };
}

export const getTraitsAsObject = async () => {
  const rawTraits = (await TraitModel.find({})) as ITrait[];

  const traits: TraitObjectFromDB = {} as any;

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

export const getTraitCollectionAsObject = async () => {
  const traitCollections = (await TraitCollectionModel.find(
    {}
  )) as TraitCollecton[];

  let obj: NodeJS.Dict<TraitCollecton> = {};

  for (const collection of traitCollections) {
    obj[collection.trait_type] = collection;
  }
  return obj;
};

export const replaceAttrWithTraitRef = async () => {
  let tokens = await TokenModel.getOutkasts();
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

export const updateTraitsTotal = async () => {
  await populateTraits();
  const traits = JSON.parse(
    readFileSync("collection/traits.json", "utf8")
  ) as TraitObjectForRarity;

  const traitCollections = await TraitCollectionModel.find({});
  const traitsCollectionObj: { [x: string]: ITraitCollecton } = {} as any;

  traitCollections.map((collection) => {
    traitsCollectionObj[collection.trait_type] = collection;
  });

  const individualTraitObj = await getTraitsAsObject();
  const individualTraits = [];
  for (const collection_key of Object.keys(traits) as TraitType[]) {
    const collectionData = traits[collection_key];
    console.log({ collection_key });
    const collection = traitsCollectionObj[collection_key];

    const none = collectionData.data["None"]?.total ?? 0;

    collection.total = collectionData.trait_net_total + none;
    collection.none = none;

    const traits_in_collection = Object.keys(collectionData.data);

    for (const trait_key of Object.keys(collectionData.data)) {
      const trait = collectionData.data[trait_key];

      const rarity_score = 1 / (trait.total / collection.total);
      const traitFromDB = individualTraitObj?.[collection_key]?.[trait_key];

      if (!traitFromDB) {
        if (collection_key === "Level") {
          const newTrait = new TraitModel({
            trait_type: collection_key,
            trait_collection: collection,
            value: trait_key,
            total: trait.total,
            rarity_score,
          });
          console.log(newTrait);
          individualTraits.push(newTrait);
        } else {
          console.log({ trait });
        }
      } else {
        individualTraitObj[collection_key][trait_key].total = trait.total;
        individualTraitObj[collection_key][trait_key].rarity_score =
          rarity_score;
        individualTraits.push(individualTraitObj[collection_key][trait_key]);
      }
    }
  }

  await TraitCollectionModel.bulkSave(traitCollections);
  await TraitModel.bulkSave(individualTraits);
};

// export const calculateTraitsRarityScore = async () => {
//   let traits: TraitObjectForRarity;

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

export const newLevelTrait = async (level: number) => {
  const levelCollection = await TraitCollectionModel.find({
    trait_type: "Level",
  });
  return new TraitModel({
    trait_type: "Level",
    value: level.toString(),
    rarity_score: 0,
    total: 1,
    trait_collection: levelCollection,
  });
};
