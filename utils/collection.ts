import async from "async";
import Async from "async";
import axios from "axios";
import cheerio from "cheerio";
import { compareAsc as compareDateAsc, isEqual as isDateEqual } from "date-fns";
import { createWriteStream, readFileSync } from "fs";
import { TokenModel } from "../models/server/tokens";
import { updateToken, getIdsFromFusedImage } from "./token";
import SortedSet from "collections/sorted-set";
import { arrayBuffer } from "stream/consumers";
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

interface DecommissionedTokenId {
  id: number;
  date: Date;
}

export const getDecommisionTokensAsObject = () => {
  const rawHtml = readFileSync("collection/oldoutkast.html", "utf8");
  const $ = cheerio.load(rawHtml);

  const oldOutkasts: { [x: string | number]: Date } = {};
  const linkObjects = $("a").toArray();

  console.log("Scanning html for links... ");

  for (const linkObj of linkObjects) {
    const link = linkObj.attribs["href"];
    const dateTag = linkObj?.parent?.next;
    if (link.endsWith(".png") && dateTag) {
      let date = new Date($(dateTag).text());
      let id = getIdsFromFusedImage(link).decommissionedId;
      oldOutkasts[id] = date;
    }
  }

  return oldOutkasts;
};

export const getNewlyDecommissionedTokens = async (): Promise<
  [DecommissionedTokenId]
> => {
  await downloadOldOutkastHtmlFile();
  const oldOutkasts = getDecommisionTokensAsObject();

  console.log("Done fetching links");
  console.log({ oldOutkasts });
  const decommissionedTokens =
    await TokenModel.getDecommissionedOutkasts().exec();

  console.log("Decommissioned outkast");
  console.log("Starting for loop ...");

  for (const { id } of decommissionedTokens) {
    const deadToken = oldOutkasts[id];
    if (deadToken) {
      delete oldOutkasts[id];
      console.log("Delete Token id ", id);
    }
  }

  const ss = new SortedSet<DecommissionedTokenId>(
    [],
    (a, b) => isDateEqual(a.date, b.date),
    (a, b) => compareDateAsc(a.date, b.date)
  );

  for (const [id, date] of Object.entries(oldOutkasts)) {
    ss.push({ id: Number(id), date });
  }

  console.log("Sorted id into set");

  return ss.toArray();
};

export const updateNewlyDecommissionedTokens = async () => {
  const newlyDecommissionedTokens = await getNewlyDecommissionedTokens();

  for (const { id } of newlyDecommissionedTokens) {
    await updateToken(id);
  }
};

export const updateAllTokens = async () => {
  for (let id = 1; id <= 10000; id += 1) {
    updateToken(id);
  }
};
