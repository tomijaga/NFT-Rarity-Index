// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next";

import { getApp } from "firebase/app";
import {
  getFirestore,
  collection as getCollection,
  getDocs,
} from "firebase/firestore/lite";
import { connectFirebaseDB } from "utils/connectDb";
import auth from "../../../middlewares/auth";

type Data = {
  success: boolean;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | any>
) {
  await connectFirebaseDB();

  const db = getFirestore(getApp());
  const ok_collection = getCollection(db, "outkast-server");
  const snapshot = await getDocs(ok_collection);
  const obj: { [x: string]: any } = {};
  snapshot.docs.map((doc) => (obj[doc.id] = doc.data()));

  res.send(obj.stats);
}
