import axios from "axios";
import { existsSync, mkdirSync, unlinkSync } from "fs";
import wget from "wget-improved";
import { Attribute, IToken, Token, TokenModel } from "../models/server/tokens";
import { Trait, TraitModel } from "../models/server/traits";
import { compressImage } from "./compress";
import { uploadImageToS3 } from "./s3";

export const getTokenDir = (id: number) => {
  return `collection/tokens/${id}`;
};

export const getTokenPath = (
  id: number,
  file: "index" | "details" = "index"
) => {
  return `${getTokenDir(id)}/${file}.json`;
};

export const getTokenSrcPath = (id: number) => {
  return `https://outkast.world/metadata/${id}`;
};
export const IMAGE_DIR = "collection/images";
export const getTokenImagePath = (
  id: number,
  ext: "png" | "gif",
  action: "fused" | "init",
  last_fused_id?: number
) => {
  return `${IMAGE_DIR}/${
    action === "fused" ? `${id}_fusedwith_${last_fused_id}` : `init_${id}`
  }.${ext}`;
};

export const saveOutkastAsFused = (id: number) => {};

export const getIdsFromFusedImage = (image_url: string) => {
  const routes = image_url.split(/[.\/]/);
  const name = routes[routes.length - 2];

  const [decommissionedId, fusedId] = name
    .split("fusedwith")
    .map((id) => Number(id));

  return { decommissionedId, fusedId };
};

export const waitForMinTime =
  (timeBeforeFinish = 250, fn: Function) =>
  async (...params: any[]) => {
    const startTime = Date.now();

    await fn(...params);

    const elapsedTime = Date.now() - startTime;
    if (!(elapsedTime > timeBeforeFinish)) {
      await sleep(elapsedTime - timeBeforeFinish);
    }
  };

// // Checks the attributes of the new and old tokens to see if they match
// export const didTokenEvolve = (attr1: Attribute[], attr2: Attribute[]) => {
//   let comparator = (a: Attribute, b: Attribute) =>
//     b.trait_type.localeCompare(a.trait_type);

//   attr1 = attr1.sort(comparator);
//   attr2 = attr2.sort(comparator);

//   for (let i = 0; i < attr1.length; i += 1) {
//     if (attr1[i].value !== attr2[i].value) {
//       return false;
//     }
//   }
//   return true;
// };

type ImagePathOptions =
  | {
      id: number;
      action: "init";
      src?: string;
    }
  | {
      id: number;
      action: "fused";
      decommissioned_id: number;
      src?: string;
    };

export const downloadTokenImage = async (
  imagePathOptions: ImagePathOptions
) => {
  const { id, action } = imagePathOptions;

  let src;

  if (imagePathOptions.src) {
    src = imagePathOptions.src;
  } else {
    const token = await TokenModel.findByTokenId(id);
    src = token.image!;
  }

  let dest;
  const isGif = src.endsWith(".gif");
  if (action === "fused") {
    dest = getTokenImagePath(
      id,
      isGif ? "gif" : "png",
      action,
      imagePathOptions.decommissioned_id
    );
  } else {
    dest = getTokenImagePath(id, isGif ? "gif" : "png", action);
  }

  if (src.endsWith(".gif")) {
    await downloadImage(src, dest);
  } else {
    try {
      await downloadImage(src, dest, true);
    } catch (e) {
      console.log("Couldn't compress image");
      console.log(e);
      await downloadImage(src, dest);
    }
  }

  const s3Result = await uploadImageToS3({
    path: dest,
    fileName: dest.split("/").pop()!,
  });
  unlinkSync(dest);

  return s3Result;
};

export const addTraitCountToAttributes = (token: Token) => {
  if (token?.attributes?.length) {
    const traitCount = token.attributes.reduce(
      (acc, { trait_type }) => {
        if (trait_type !== "Experience" && trait_type !== "Trait Count") {
          acc.value += 1;
        }
        return acc;
      },
      { trait_type: "Trait Count", value: 0 }
    );
    token.attributes.push(traitCount as Trait);
  }
};

export const tokenEvolution = async (
  tokenDoc: IToken,
  decommissionedTokenDoc: IToken
) => {
  const token = await downloadLatestToken(tokenDoc.id);

  if (
    token.attributes &&
    tokenDoc.fusedWith &&
    !tokenDoc.fusedWith.includes(decommissionedTokenDoc.id)
  ) {
    const imageSrc = token.image;
    const s3Result = await downloadTokenImage({
      src: imageSrc,
      id: tokenDoc.id,
      action: "fused",
      decommissioned_id: decommissionedTokenDoc.id,
    });

    console.log(s3Result);

    tokenDoc.history = {
      previous: tokenDoc.toTokenObject(),
      fusion: decommissionedTokenDoc.toTokenObject(),
    };

    const prevTraits = tokenDoc.attributes;

    tokenDoc.fusedWith.push(decommissionedTokenDoc.id);
    tokenDoc.image = imageSrc;
    tokenDoc.fused = true;
    tokenDoc.lastModified = token.lastModified;
    tokenDoc.s3_image = s3Result.Location;
    tokenDoc.level = token.level;
    tokenDoc.experience = token.experience;

    addTraitCountToAttributes(token);
    return { token: tokenDoc, newAttributes: token.attributes };
  }

  tokenDoc.history = {
    previous: tokenDoc.toTokenObject(),
    fusion: decommissionedTokenDoc.toTokenObject(),
  };

  tokenDoc.fusedWith.push(decommissionedTokenDoc.id);
  tokenDoc.fused = true;
  tokenDoc.lastModified = token.lastModified;

  return { token: tokenDoc, newAttributes: tokenDoc.attributes };

  // return null;
};

export const downloadLatestToken = async (id: number) => {
  const src = getTokenSrcPath(id);
  const { data, headers } = await axios.get(src);
  const token = data as Token;
  token.id = id;
  token.lastModified = new Date(headers["last-modified"]).getTime();

  if (token.name.includes("Fused") || !token.attributes) {
    token.decommissioned = true;
  } else {
    token.decommissioned = false;
    token.attributes = token.attributes?.filter(({ trait_type, value }) => {
      if (trait_type === "Experience") {
        token.experience = Number(value);
        return false;
      }
      if (trait_type === "Level") {
        token.level = Number(value);
      }
      return true;
    });
  }

  return token as Token;
};

export const matchAttributes = (token: Token, token2: Token) => {
  const comparator = (a: Attribute, b: Attribute) =>
    b.trait_type.localeCompare(a.trait_type);

  const funnel = ({ trait_type }: Attribute) =>
    !(
      trait_type === "Level" ||
      trait_type === "Experience" ||
      trait_type === "Trait Count"
    );

  const a1 = token?.attributes?.sort(comparator).filter(funnel);
  const a2 = token2?.attributes?.sort(comparator).filter(funnel);

  if (a1 && a2) {
    return a1.every(({ value }, i) => {
      return a2[i].value === value;
    });
  }

  return false;
};

export const updateToken = async (id: number) => {
  let token;
  try {
    token = await downloadLatestToken(id);
  } catch (e) {
    console.error("updateToken: Error Downloading Latest token");
    return;
  }

  const prevTokenDoc = await TokenModel.findByTokenId(id);

  if (
    token.decommissioned &&
    !prevTokenDoc.decommissioned &&
    !prevTokenDoc.fusedInto
  ) {
    console.log("Fusion Update", token.id);

    const { fusedId } = getIdsFromFusedImage(token.image);

    // update token History
    const fusedTokenDoc = await TokenModel.findByTokenId(fusedId);

    // save history before updating data
    const prevTokenHistory = {
      previous: await prevTokenDoc.toTokenObject(),
      fusion: await fusedTokenDoc.toTokenObject(),
    };

    // Update newly fused token
    const newlyFusedTokenUpdateData = await tokenEvolution(
      fusedTokenDoc,
      prevTokenDoc
    );

    // update tokenDoc data
    prevTokenDoc.fusedInto = fusedId;
    prevTokenDoc.image = token.image;
    prevTokenDoc.decommissioned = true;
    prevTokenDoc.lastModified = token.lastModified;
    prevTokenDoc.history = prevTokenHistory;

    delete prevTokenDoc.rank;

    if (newlyFusedTokenUpdateData) {
      return await TokenModel.bulkUpdateAndSave([
        newlyFusedTokenUpdateData,
        { token: prevTokenDoc, newAttributes: [] },
      ]);
    } else
      throw new Error(
        `Token ${fusedTokenDoc.id} has already been fused with ${prevTokenDoc.id}`
      );
  } else if (
    !prevTokenDoc.decommissioned &&
    token.lastModified !== prevTokenDoc.lastModified &&
    matchAttributes(prevTokenDoc, token)
  ) {
    console.log("Normal update");
    prevTokenDoc.image = token.image;
    prevTokenDoc.experience = token.experience;
    prevTokenDoc.level = token.level;

    return await prevTokenDoc.save();
  }

  console.log(`Token ${token.id} didnt meet the conditions for an update`);
  return;
};

const wgetDownload = async (src: string, output: string): Promise<void> => {
  const download = wget.download(decodeURI(src), output);

  return await new Promise((resolve, reject) => {
    download.on("error", (err) => {
      console.error(err);
      reject();
    });

    download.on("start", function (fileSize) {
      console.log("filesize", fileSize, "bytes");
    });
    download.on("end", function (output) {
      console.log(output);
      resolve();
    });
  });
};

export const downloadImage = async (
  image_src_url: string,
  imagePath: string,
  compress = false
): Promise<void> => {
  if (!existsSync("collection/images")) {
    mkdirSync("collection/images");
  }

  if (compress) {
    await compressImage(image_src_url, imagePath);
  } else {
    await wgetDownload(image_src_url, imagePath);
  }

  console.log("Downloaded image", image_src_url);
};

export const cloneToken = (id: number) => {
  const tokenSrc = getTokenSrcPath(id);
  const tokenPath = getTokenPath(id);
  let download = wget.download(encodeURI(tokenSrc), tokenPath);

  return new Promise((resolve, reject) => {
    download.on("error", function (err) {
      const errMessage = `Error: Downloading Outkast ${id}`;
      console.error(errMessage, err);

      reject({ ...err, message: errMessage });
    });

    download.on("start", function (fileSize) {
      console.log(`Outkast id ${id}: ${fileSize}kb`);
    });

    download.on("end", function (output) {
      console.log(output);
      resolve(`Downloaded oukast data ${id}`);
    });
  });
};

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const getPossibleCombinations = async (id: number) => {
  const token = await TokenModel.findByTokenId(id);

  // const combinations = [];
  const traits_with_possible_combinations = token.attributes.map(
    ({ trait_type, value }) => {
      return value;
    }
  );

  const results = await TraitModel.find({
    $or: [
      { "combos.first": { $in: traits_with_possible_combinations } },
      { "combos.second": { $in: traits_with_possible_combinations } },
    ],
  }).sort("trait_type");

  const combinationsAsIndependentTraits: any[] = [];

  results.map((trait) => {
    if (trait.combos.length > 1) {
      const variants = trait.combos.map((combo: any) => {
        return { ...trait.toObject(), combos: [combo] };
      });
      combinationsAsIndependentTraits.push(...variants);
    } else {
      combinationsAsIndependentTraits.push(trait);
    }
  });

  return { token, combinations: combinationsAsIndependentTraits };
};
