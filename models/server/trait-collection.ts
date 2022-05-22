import { Document, model, Model, models, Schema } from "mongoose";

export type TraitType =
  | "Level"
  | "Experience"
  | "Gender"
  | "Mouth"
  | "Eyes"
  | "Eyewear"
  | "Hair"
  | "Skin"
  | "Clothes"
  | "Mask"
  | "Weapon"
  | "Background"
  | "Facial Marks"
  | "Trait Count";

export const TraitTypeForSchema = {
  type: String,
  enum: [
    "Level",
    "Experience",
    "Gender",
    "Mouth",
    "Eyes",
    "Eyewear",
    "Hair",
    "Skin",
    "Clothes",
    "Mask",
    "Weapon",
    "Background",
    "Facial Marks",
    "Trait Count",
  ],
  required: true,
};

export interface TraitCollecton {
  trait_type: string;
  total: number;
  none: number;
}

const traitCollectionSchema = new Schema({
  trait_type: TraitTypeForSchema,
  total: { type: Number, required: true },
  none: { type: Number, required: true },
});

export interface ITraitCollecton extends Document, TraitCollecton {}

export interface ITraitCollectonModel
  extends Model<ITraitCollecton, {}, {}, {}> {}

export const TraitCollectionModel =
  (models.TraitCollection as ITraitCollectonModel) ||
  (model("TraitCollection", traitCollectionSchema) as ITraitCollectonModel);
