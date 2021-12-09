import Jimp from "jimp";

export const compressImage = async (src: string, output: string) => {
  let image;

  image = await Jimp.read(decodeURI(src));

  await image.resize(400, 400);
  console.log("resize");
  await image.quality(30);
  console.log("quality");

  await image.writeAsync(output);
  console.log("Compressed", src);
};
