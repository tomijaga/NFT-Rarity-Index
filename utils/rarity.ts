import { readFileSync, writeFile } from "fs";
import { Attribute, IToken, Token, TokenModel } from "../models/server/tokens";
import { getTokensFromFileStorage, getTokenFromFileStorage } from "./token";
import SortedSet from "collections/sorted-set";
import { getTraitsAsObject } from "./traits";
import { TraitModel } from "models/server/traits";

const calculateRarityScore = (token: Token) => {
  if (token.attributes) {
    return token.attributes.reduce((acc, { value, trait_net_total, total }) => {
      let trait_rarity_score = 0;
      if (value === "None") {
        trait_rarity_score = 1 / ((trait_net_total + total) / total);
      } else {
        trait_rarity_score = 1 / (total / trait_net_total);
      }
      return acc + trait_rarity_score;
    }, 0);
  }

  return 0;
};

export const createSortedSet = async (tokens: IToken[]) => {
  tokens = tokens.map((token) => {
    token.rarity_score = calculateRarityScore(token);
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
  const tokensAsArray = await createSortedSet((tokens as any).toArray());

  return tokensAsArray.map((token: IToken, i: number) => {
    token.rank = 1 + i;
    return token;
  });
};

export const getFusedTokensSortedByRarity = async () => {
  const tokens = await getTokensSortedByRarity();

  const results: Token[] = [];
  (tokens.toArray() as IToken[]).forEach((token, i) => {
    const rank = i + 1;
    if (token.fused) {
      return results.push({ ...token.toObject() });
    }
  });

  return results;
};

export const getRank = async (id: number): Promise<number> => {
  const ss = await getTokensSortedByRarity();

  const token = await TokenModel.findByTokenId(id);

  const result = ss.find(token);
  return result?.index + 1;
};

export const getRankedToken = async (id: number) => {
  const ss = await getTokensSortedByRarity();

  const token = await TokenModel.findByTokenId(id);
  token.rarity_score = calculateRarityScore(token);
  const result = ss.find(token);

  return { ...result?.value.toObject() };
};

export const getRarityFromCustomTraits = async (customToken: Token) => {
  const ss = await getTokensSortedByRarity();
  const traits = await getTraitsAsObject();
  customToken.rarity_score = calculateRarityScore(customToken);

  const result = ss.findGreatestLessThan(customToken as IToken);

  const rank = result?.left?.index + 2;

  if (rank) {
    return { rank, rarity_score: customToken.rarity_score };
  }
  return { rank: 1, rarity_score: customToken.rarity_score };
};

export const updateTokensRarity = async () => {
  const sortedTokens = await getTokensSortedByRarity();
  return await TokenModel.bulkSave(sortedTokens);
};
