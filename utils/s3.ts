import S3 from "aws-sdk/clients/s3";
import { createReadStream } from "fs";

const {
  MY_AWS_ACCESS_KEY,
  MY_AWS_SECRET_KEY,
  MY_AWS_BUCKET_NAME,
  MY_AWS_BUCKET_REGION,
} = process.env;

const s3 = new S3({
  region: MY_AWS_BUCKET_REGION,
  accessKeyId: MY_AWS_ACCESS_KEY,
  secretAccessKey: MY_AWS_SECRET_KEY,
});

export const uploadImageToS3 = async ({
  path,
  fileName,
}: {
  path: string;
  fileName: string;
}) => {
  const fileStream = createReadStream(path);

  if (!MY_AWS_BUCKET_NAME) {
    throw new Error("MY_AWS_BUCKET_NAME is undefined");
  }

  const uploadParams = {
    Bucket: MY_AWS_BUCKET_NAME,
    Body: fileStream,
    Key: fileName,
  };

  return s3.upload(uploadParams).promise();
};

const backupImageToS3 = async (id: number) => {
  const imagePath = `collection/tokens/${id}/images/init_400.png`;

  const result = await uploadImageToS3({
    path: imagePath,
    fileName: `init_${id}`,
  });

  // console.log(`Uploaded Token Image ${id} to the cloud.`);
  // console.log(result);
};
