import {
  readFileSync,
  readFile,
  unlink,
  writeFile,
  createWriteStream,
  writeFileSync,
  readdirSync,
  existsSync,
  mkdir,
  mkdirSync,
} from "fs";
import { Attribute, Token } from "../models/server/tokens";
import { TraitType } from "../models/server/trait-type";
import wget from "wget-improved";
import axios from "axios";
import { getTraitsAsObject, TraitObject } from "./traits";
import Async from "async";
import {
  getIdsFromFusedImage,
  getTokenFromFileStorage,
  getTokenPath,
  updateToken,
  waitForMinTime,
} from "./token";

export const getSnapShots = (id: number) => {
  const tokenDetailsPath = getTokenPath(id, "details");
  return JSON.parse(readFileSync(tokenDetailsPath, "utf8")).snapshots;
};

export const getTokenHistory = async (id: number) => {
  const token = await getTokenFromFileStorage(id);
  const snapShots = getSnapShots(id);
  return await createHistoryTree(token, snapShots);
};

async function createHistoryTree(
  token: Token | undefined,
  snapShots: Token[],
  prevToken?: number
) {
  let fusion;
  if (token) {
    if (token.fused) {
      const { fusedInto } = token;
      if (fusedInto !== prevToken) {
        const fusedToken = await getTokenFromFileStorage(fusedInto);
        const fusedTokenSnapshots = getSnapShots(fusedInto);
        fusion = await createHistoryTree(
          fusedToken,
          fusedTokenSnapshots,
          token.id
        );
      } else {
        fusion = null;
      }
    } else {
      if (token.fusedWith && token.fusedWith.length) {
        let fusedWithId = token.fusedWith.pop();
        if (!fusedWithId || fusedWithId === prevToken) {
          fusion = null;
        } else {
          //   console.log({ fusedWithId, tokenId: token.id });
          const evolvedToken = await getTokenFromFileStorage(fusedWithId);
          const evolvedTokenSnapshots = await getSnapShots(fusedWithId);
          fusion = await createHistoryTree(
            evolvedToken,
            evolvedTokenSnapshots,
            token.id
          );
        }
      } else {
        fusion = null;
      }
    }

    const previousToken = snapShots.pop();

    token.history = {
      previous: await createHistoryTree(previousToken, snapShots, token.id),
      fusion,
    };
    return token;
  }

  return null;
}
getTokenHistory(102);
