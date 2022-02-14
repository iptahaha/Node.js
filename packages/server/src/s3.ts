import dotenv from 'dotenv';
import aws from 'aws-sdk';
import sharp from 'sharp';
// import * as buffer from 'buffer';

dotenv.config();

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: 'v4',
});

export async function uploadAnyFiles(params, fileName) {
  return new Promise((resolve, reject) => {
    params.Key = `${fileName}`;
    s3.putObject(params, (err) => {
      if (err) {
        reject();
      } else {
        resolve(200);
      }
    });
  })
}

export async function uploadImages(params, fileName, sizes, sizeType) {
  return new Promise((resolve, reject) => {
    sharp(params.Body)
      .resize(sizes, sizes)
      .toBuffer()
      .then((buffer) => {
        params.Body = buffer;
        params.Key = `${sizeType}_${fileName}`;
        s3.putObject(params, (err) => {
          if (err) {
            reject();
          } else {
            resolve(200);
          }
        });
      });
  });
}

