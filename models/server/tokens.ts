import { Document, model, Model, models, Query, Schema } from "mongoose";
import { getTraitsAsObject, newLevelTrait } from "utils/traits";
import { TraitType } from "./trait-collection";
import { ITrait, Trait, TraitModel } from "./traits";
console.log(TraitModel);

export interface Attribute {
  trait_type: TraitType;
  value: string | number;
}
export interface Token {
  name: string;
  image: string;
  s3_image?: string;
  id: number;
  experience: number;
  level: number;
  fused?: boolean;
  decommissioned?: boolean;
  fusedInto: number;
  fusedWith: number[];
  lastModified: number;
  rarity_score?: number;
  rank?: number;
  attributes: Trait[];
  history?: {
    previous: Token | null;
    fusion: Token | null;
  };
}

const tokenSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String },
  s3_image: { type: String },
  id: { type: Number, required: true, unique: true },
  experience: { type: Number, required: true },
  level: { type: Number, required: true },
  fused: { type: Boolean, required: true },
  decommissioned: { type: Boolean, required: true },
  fusedInto: Number,
  fusedWith: [Number],
  lastModified: { type: Date, required: true },
  rarity_score: Number,
  rank: Number,
  attributes: [{ type: Schema.Types.ObjectId, ref: "Trait", required: true }],
  history: {
    previous: Schema.Types.Mixed,
    fusion: Schema.Types.Mixed,
  },
});

tokenSchema.methods.toTokenObject = function (): Token {
  const obj = this.toObject();
  delete obj["__v"];
  delete obj["_id"];
  return obj as Token;
};

type X = typeof tokenSchema;
export interface IToken extends Document, Token {
  id: number;
  attributes: ITrait[];
  toTokenObject: () => Token;
}

tokenSchema.statics.findByTokenId = function findByTokenId(id: number) {
  return this.findOne({ id }).populate("attributes");
};

tokenSchema.statics.findTokenByName = function findTokenByName(name: string) {
  return this.findOne({ name }).populate("attributes");
};

tokenSchema.statics.getFusedOutkasts = function () {
  return this.find({ fused: true, decommissioned: false })
    .where("decommissioned")
    .equals(false)
    .populate("attributes");
};

tokenSchema.statics.getDecommissionedOutkasts = function (): Query<
  IToken[],
  any,
  {},
  any
> {
  return this.find({ decommissioned: true }).populate("attributes");
};

tokenSchema.statics.getOutkasts = function () {
  return this.find({ decommissioned: false }).populate("attributes");
};

interface TokenUpdateData {
  token: IToken;
  newAttributes: Trait[] | ITrait[];
}

tokenSchema.statics.bulkUpdateAndSave = async function (
  updateData: TokenUpdateData[]
) {
  const traitsObject = await getTraitsAsObject();

  const addTrait = async (trait: Trait | ITrait) => {
    const { trait_type, value } = trait;
    console.log({ trait_type, value }, trait);

    if (traitsObject[trait_type] && traitsObject[trait_type][value]) {
      return traitsObject[trait_type][value];
    }
    if (trait_type === "Level") return await newLevelTrait(Number(value));

    throw new Error(
      "An unknown trait has is trying to bypass your verification"
    );
  };

  const tokens = updateData.map(async ({ token, newAttributes }) => {
    token.attributes = [];

    for (const attr of newAttributes) {
      token.attributes.push(await addTrait(attr));
    }
    return token;
  });

  console.log("About to save");
  return await this.bulkSave(await Promise.all(tokens));
};

interface ITokenModel extends Model<IToken, {}, {}, {}> {
  (): IToken;
  findByTokenId: (id: number) => Promise<IToken>;
  findTokenByName: (name: string) => Promise<IToken>;
  getFusedOutkasts: () => Query<IToken[], any, {}, any>;
  getDecommissionedOutkasts: () => Query<IToken[], any, {}, any>;
  getOutkasts: () => Query<IToken[], any, {}, any>;
  bulkUpdateAndSave: (data: TokenUpdateData[]) => Promise<any>;
}

export const TokenModel =
  (models.Token as ITokenModel) || (model("Token", tokenSchema) as ITokenModel);
