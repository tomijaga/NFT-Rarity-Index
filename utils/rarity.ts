import SortedSet from "collections/sorted-set";
import { IToken, Token, TokenModel } from "../models/server/tokens";
import { getTraitsAsObject, TraitObjectFromDB } from "./traits";

export const getTokenRarityScore = (token: IToken) => {
  let rarity_score = 0;
  for (const attr of token.attributes) {
    rarity_score += attr.rarity_score;
  }

  return rarity_score;
};

export const getTokensSortedByRarity = async () => {
  const tokens = await TokenModel.getOutkasts();

  tokens.forEach((token, i) => {
    const score = getTokenRarityScore(token);
    if (score) {
      token.rarity_score = score;
    } else {
      console.error(i, score);
      console.error(token.attributes);

      throw new Error("Invalid rarity score");
    }
  });

  tokens.sort((a: Token, b: Token) => b.rarity_score! - a.rarity_score!);

  return tokens.map((token: IToken, i: number) => {
    token.rank = 1 + i;
    return token;
  });
};

export const updateAllTokensRarity = async () => {
  const sortedTokens = await getTokensSortedByRarity();
  await TokenModel.bulkSave(sortedTokens);
};

// export const getRarityFromCustomTraits = async (customToken: Token) => {
//   const ss = await getTokensSortedByRarity();
//   const traits = await getTraitsAsObject();
//   customToken.rarity_score = getTokenRarityScore( customToken);

//   const result = ss.findGreatestLessThan(customToken as IToken);

//   const rank = result?.left?.index + 2;

//   if (rank) {
//     return { rank, rarity_score: customToken.rarity_score };
//   }
//   return { rank: 1, rarity_score: customToken.rarity_score };
// };
