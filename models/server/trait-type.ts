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
