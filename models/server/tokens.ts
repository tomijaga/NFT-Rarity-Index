import {
  Document,
  Schema,
  model,
  models,
  SchemaType,
  Model,
  Query,
} from "mongoose";
import { TraitType, TraitTypeForSchema } from "./trait-type";
import { TraitModel, Trait, ITrait } from "./traits";
import { getTraitsAsObject } from "utils/traits";

console.log(TraitModel);
export interface Attribute {
  trait_type: TraitType;
  value: string | number;
}
export interface Token {
  name: string;
  image?: string;
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

tokenSchema.statics.findByName = function (name: string) {
  return this.findOne({ name }).populate("attributes");
};

tokenSchema.statics.getFusedOutkasts = function () {
  return this.find({ fused: true }).populate("attributes");
};

tokenSchema.statics.getDecommissionedOutkasts = function () {
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
  const changedTraits: {
    [P in TraitType]: {
      [x: string | number]: number;
    };
  } = {} as any;

  const recordTrait = (trait: Trait | ITrait, action: "add" | "subtract") => {
    const { trait_type, value } = trait;
    const change = action === "add" ? 1 : -1;

    const changedTrait = changedTraits[trait_type];
    if (changedTrait) {
      if (changedTrait[value]) {
        changedTrait[value] += change;
      } else {
        changedTrait[value] = change;
      }
    } else {
      changedTraits[trait_type] = { [value]: change };
    }
    traitsObject[trait_type][value].total += change;
    return traitsObject[trait_type][value];
  };

  const tokens = updateData.map(({ token, newAttributes }) => {
    const prevAttributes = token.attributes;

    for (const attr of prevAttributes) {
      recordTrait(attr, "subtract");
    }
    token.attributes = [];

    for (const attr of newAttributes) {
      token.attributes.push(recordTrait(attr, "add"));
    }

    return token;
  });

  for (const trait_type of Object.keys(traitsObject) as TraitType[]) {
    let net_total = 0;
    Object.keys(changedTraits[trait_type]).map((key, i) => {
      const value = changedTraits[trait_type][key];
      if (i === 0) {
        net_total = traitsObject[trait_type][key].trait_net_total;
      }
      net_total += value;
    });

    await TraitModel.updateMany(
      { name: trait_type },
      { trait_net_total: net_total }
    );
  }
  console.log("About to save");
  console.log(tokens);
  return await this.bulkSave(tokens);
};

interface ITokenModel extends Model<any, {}, {}, {}> {
  (): IToken;
  findByTokenId: (id: number) => Promise<IToken>;
  getFusedOutkasts: () => Query<any[], any, {}, any>;
  getDecommissionedOutkasts: () => Query<any[], any, {}, any>;
  getOutkasts: () => Query<any[], any, {}, any>;
  bulkUpdateAndSave: (data: TokenUpdateData[]) => Promise<any>;
}

export const TokenModel =
  (models.Token as ITokenModel) || (model("Token", tokenSchema) as ITokenModel);

export const BackupTokenModel =
  (models.BackupToken as ITokenModel) ||
  (model("BackupToken", tokenSchema) as ITokenModel);
