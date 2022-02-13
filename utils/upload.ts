import { TokenModel } from "../models/server/tokens";
import { connectMongoDB } from "./connectDb";
import { getTokenFromFileStorage } from "./token";

const uploadTokenToMongo = async (id: number) => {
  const rawToken = await getTokenFromFileStorage(id);

  const token = new TokenModel(rawToken);
  token.save();
  // const token2 = new TokenModel(rawToken);
  // token2.save();
};

connectMongoDB().then(() => {
  uploadTokenToMongo(102);
});
