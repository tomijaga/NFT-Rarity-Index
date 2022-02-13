import async from "async";
import Async from "async";
import axios from "axios";
import cheerio from "cheerio";
import {
  compareAsc as compareDateAsc,
  compareDesc,
  isEqual as isDateEqual,
} from "date-fns";
import { createWriteStream, readFileSync, writeFileSync } from "fs";
import { TokenModel } from "../models/server/tokens";
import {
  updateToken,
  getIdsFromFusedImage,
  sleep,
  waitForMinTime,
} from "./token";

import SortedSet from "collections/sorted-set";
import { arrayBuffer } from "stream/consumers";
import path from "path";

import { connectFirebaseDB, connectMongoDB } from "utils/connectDb";
import firebase, { getApp } from "firebase/app";
import firestore, {
  getFirestore,
  updateDoc,
  doc,
} from "firebase/firestore/lite";

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
  const writer = createWriteStream(
    path.join(process.env.ROOT!, "collection/oldoutkast.html")
  );
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
  const rawHtml = readFileSync(
    path.join(process.env.ROOT!, "collection/oldoutkast.html"),
    "utf8"
  );
  const $ = cheerio.load(rawHtml);

  const oldOutkasts: { [x: string | number]: Date } = {};
  const linkObjects = $("a").toArray();

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

export const getFusedTokenIdsFromHtml = () => {
  const rawHtml = readFileSync(
    path.join(process.env.ROOT!, "collection/oldoutkast.html"),
    "utf8"
  );
  const $ = cheerio.load(rawHtml);

  const fusedOutkastIds: { [x: string | number]: any } = {};
  const linkObjects = $("a").toArray();

  for (const linkObj of linkObjects) {
    const link = linkObj.attribs["href"];
    if (link.endsWith(".png")) {
      let id = getIdsFromFusedImage(link).fusedId;
      if (!fusedOutkastIds[id]) {
        fusedOutkastIds[id] = id;
      }
    }
  }

  return Object.values(fusedOutkastIds);
};

export const getNewlyDecommissionedTokens = async (): Promise<
  [DecommissionedTokenId]
> => {
  const oldOutkasts = getDecommisionTokensAsObject();

  console.log("Done fetching links");
  const decommissionedTokens =
    await TokenModel.getDecommissionedOutkasts().exec();

  console.log("Decommissioned outkast");
  console.log("Starting for loop ...");

  for (const { id } of decommissionedTokens) {
    const deadToken = oldOutkasts[id];
    if (deadToken) {
      delete oldOutkasts[id];
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
  await downloadOldOutkastHtmlFile();
  const newlyDecommissionedTokens = await getNewlyDecommissionedTokens();

  console.log(newlyDecommissionedTokens);
  for (const { id } of newlyDecommissionedTokens) {
    await updateToken(id);
  }

  await updateStats();
};

export const readServerDetails = () => {
  console.log(process.env.ROOT);
  const server_details = JSON.parse(
    readFileSync(
      path.join(process.env.ROOT!, "collection/details.json"),
      "utf8"
    )
  );
  return server_details;
};

export const updateAllTokens = async () => {
  await downloadOldOutkastHtmlFile();

  const ids: number[] = [...Array(10000)].map((_, i) => i + 1);

  Async.mapLimit(ids, 10, waitForMinTime(250, updateToken), (err) => {
    if (err) return console.error("Error Updating collection", err);
    console.log("Updated all token data in the collection");
  });

  await updateStats();
};

export const updateStats = async () => {
  connectFirebaseDB();
  const db = getFirestore(getApp());

  const decommissionedTokenIds = getDecommisionTokensAsObject();
  const fusedTokenIds = getFusedTokenIdsFromHtml();

  let decommissionedTokensArr = Object.values(decommissionedTokenIds);

  decommissionedTokensArr.sort(compareDesc);

  const totalFusions = decommissionedTokensArr.length;
  const lastFusion = new Date(decommissionedTokensArr[0].getTime());

  await updateDoc(doc(db, "outkast-server", "stats"), {
    fusions: { total: totalFusions, lastFusion },
    tokens: { total: 10000 - totalFusions, fused: fusedTokenIds.length },
    lastUpdated: Date.now(),
  });
};
