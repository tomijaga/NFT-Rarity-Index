import SortedSet from "collections/sorted-set";
import { IToken, Token, TokenModel } from "../models/server/tokens";
import { getTraitsAsObject, TraitObjectFromDB } from "./traits";

export const getTokenRarityScore = (
  traits: TraitObjectFromDB,
  token: IToken
) => {
  let rarity_score = 0;
  for (const attr of token.attributes) {
    rarity_score += attr.rarity_score;
  }

  return rarity_score;
};

export const createSortedSet = async (tokens: IToken[]) => {
  const traits = await getTraitsAsObject();
  tokens = tokens.map((token) => {
    token.rarity_score = getTokenRarityScore(traits, token);
    return token;
  });

  const ss = new SortedSet(
    tokens,
    (a: Token, b: Token) => a.rarity_score === b.rarity_score,
    (a: Token, b: Token) => b.rarity_score! - a.rarity_score!
  );
  return ss;
};

export const getTokensSortedByRarity = async () => {
  const tokens = await TokenModel.getOutkasts();
  const tokensAsArray = await (
    await createSortedSet((tokens as any).toArray())
  ).toArray();

  return tokensAsArray.map((token: IToken, i: number) => {
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
//   customToken.rarity_score = getTokenRarityScore(traits, customToken);

//   const result = ss.findGreatestLessThan(customToken as IToken);

//   const rank = result?.left?.index + 2;

//   if (rank) {
//     return { rank, rarity_score: customToken.rarity_score };
//   }
//   return { rank: 1, rarity_score: customToken.rarity_score };
// };
