import { readFile, writeFile, createWriteStream, readFileSync } from "fs";
import axios from "axios";
import {
  getIdsFromFusedImage,
  getTokenFromFileStorage,
  updateToken,
  waitForMinTime,
} from "./token";
import cheerio from "cheerio";
import { Token, TokenModel } from "../models/server/tokens";
import Async from "async";
export interface CollectionDetailsRecord {
  evolved: {
    fusedWith: number[];
  };

  fused: string | number;
}

export interface DetailsFile {
  evolved: {
    [id: number]: {
      fusedWith: number[];
    };
  };

  fused: { [id: number]: string | number };
}

export const downloadOldOutkastHtmlFile = async () => {
  const url = "https://outkast.world/oldoutkast";
  const writer = createWriteStream("collection/oldoutkast.html");
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

export const getNewlyDecommissionedTokens = async (): Promise<number[]> => {
  await downloadOldOutkastHtmlFile();

  const rawHtml = readFileSync("collection/oldoutkast.html", "utf8");
  const $ = cheerio.load(rawHtml);

  const links: { [x: string]: string } = {};
  const linkObjects = $("a");

  linkObjects.each((index, element) => {
    const href = $(element).attr("href");
    const text = $(element).text();

    if (href && text && text.endsWith(".png")) {
      links[text] = href;
    }
  });

  const decommissionedTokens = await TokenModel.getDecommissionedOutkasts();

  for (const token of decommissionedTokens) {
    const image = token.image.split("/").pop();
    if (image) {
      if (links[image]) {
        delete links[image];
      }
    }
  }

  const newlyDecommissionedToken = Object.keys(links).map((image_key) => {
    const { decommissionedId } = getIdsFromFusedImage(image_key);

    return decommissionedId;
  });

  console.log(newlyDecommissionedToken);
  return newlyDecommissionedToken;
};

export const updateNewlyDecommissionedTokens = async () => {
  const newlyDecommissionedTokens = await getNewlyDecommissionedTokens();

  for (const decommissionedTokenId of newlyDecommissionedTokens) {
    await updateToken(decommissionedTokenId);
  }

  Async.mapLimit(newlyDecommissionedTokens, 10, updateToken, (err) => {
    if (err) console.error("Error Updating Newly Decommissioned Tokens");
    console.log("Updated all the newly fused Tokens");
  });
};

export const updateAllTokens = async () => {
  const { fused } = JSON.parse(
    readFileSync("collection/details.json", "utf8")
  ) as DetailsFile;

  const tokenIdsToUpdate = [];

  for (let id = 1; id <= 10000; id += 1) {
    if (!fused[id]) {
      tokenIdsToUpdate.push(id);
    }
  }

  Async.mapLimit(tokenIdsToUpdate, 10, updateToken, (err) => {
    if (err) console.error("Error Updating Newly Decommissioned Tokens");
    console.log("Updated all the newly fused Tokens");
  });
};
