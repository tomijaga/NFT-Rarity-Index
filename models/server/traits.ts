import { Document, Schema, model, models, Model } from "mongoose";
import { TraitType, TraitTypeForSchema } from "./trait-type";

export type Gender = "male" | "female";

export interface Trait {
  trait_type: TraitType;
  value: number | string;
  total: number;
  trait_net_total: number;
  rarity_score?: number;
  combos: { first: string; second: string }[];
  levelRequirement?: number;
  image?: string;
  gender?: Gender;
}

const traitsSchema = new Schema({
  trait_type: TraitTypeForSchema,
  value: { type: Schema.Types.Mixed, required: true },
  total: { type: Number, required: true },
  trait_net_total: { type: Number, required: true },
  rarity_score: { type: Number },
  combos: [{ first: String, second: String }],
  levelRequirement: Number,
  image: String,
  gender: { type: String, enum: ["male", "female"] },
});

// Make `trait_type` and `value` a composite primary key
traitsSchema.index({ trait_type: 1, value: 1 }, { unique: true });

traitsSchema.methods.add = async function (value) {
  const query = { total: this.total + value };
  const net_total = this.trait_net_total + value;

  await this.updateOne({ value: this.value }, query);
  if (this.value.toLowerCase() !== "none") {
    await this.model("Trait").updateMany(
      { trait_type: this.trait_type },
      { trait_type_total: net_total }
    );
  }
};

traitsSchema.methods.subtract = async function (value) {
  const total = this.total - value;
  const net_total = this.trait_net_total - value;

  return await this.updateOne({ value: this.value }, { total }).exec(
    async (err: any) => {
      if (err) return console.error("Traits method [subtract] error", err);

      if (this.value.toLowerCase() !== "none") {
        await this.model("Trait").updateMany(
          { trait_type: this.trait_type },
          { trait_type_total: net_total }
        );
      }
    }
  );
};

export interface ITrait extends Document, Trait {
  add: (value: number) => Promise<any>;
  subtract: (value: number) => Promise<any>;
}

export interface ITraitModel extends Model<any, {}, {}, {}> {}

export const TraitModel =
  (models.Trait as ITraitModel) ||
  (model("Trait", traitsSchema) as ITraitModel);

export const BackupTraitModel =
  (models.BackupTrait as ITraitModel) ||
  (model("BackupTrait", traitsSchema) as ITraitModel);
