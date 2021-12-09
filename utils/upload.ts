import { TokenModel } from "../models/server/tokens";
import connectDb from "./connectDb";
import { getTokenFromFileStorage } from "./token";

const uploadTokenToMongo = async (id: number) => {
  const rawToken = await getTokenFromFileStorage(id);

  const token = new TokenModel(rawToken);
  token.save();
  // const token2 = new TokenModel(rawToken);
  // token2.save();
};

connectDb().then(() => {
  uploadTokenToMongo(102);
});
