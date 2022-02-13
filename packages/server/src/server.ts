import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { uploadAnyFiles, uploadImages } from './s3';

const app = express();

app.use(cors());
app.use(express.static('./../web/dist'));

const PORT = process.env.PORT || 3000;
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 20971520,
  },
  fileFilter: (req, file, cb) => {
    const fileSize = parseInt(req.headers['content-length'], 10);
    if (fileSize > 20971520) {
      return cb(new Error('File to large'));
    }
    return cb(null, true);
  },
});

app.post('/*', async (req, res) => {
  const uploadToS3 = upload.single('file');

  uploadToS3(req, res, (err) => {
    if (err) {
      return res.status(422).send(Error);
    }

    if (req.file) {
      const params = {
        Body: req.file.buffer,
        Bucket: process.env.S3_BUCKET,
        Key: req.file.originalname,
      };
      const newName = `${Date.now()}_${req.file.originalname}`;

      if (req.file.mimetype.includes('image/') && req.file.mimetype !== 'image/gif') {
        const largeImage = uploadImages(params, newName, 2048, 'large');
        const middleImage = uploadImages(params, newName, 1024, 'middle');
        const thumbImage = uploadImages(params, newName, 300, 'thumb');

        Promise.all([largeImage, middleImage, thumbImage])
          .then(() => {
            res.status(200).send({
              links: [
                `https://tixawsbucket.s3.eu-central-1.amazonaws.com/large_${newName}`,
                `https://tixawsbucket.s3.eu-central-1.amazonaws.com/middle_${newName}`,
                `https://tixawsbucket.s3.eu-central-1.amazonaws.com/thumb_${newName}`,
              ],
            });
          })
          .catch(() => {
            res.status(402).send('error');
          });
      } else {
        uploadAnyFiles(params, newName)
          .then(() => {
            res.status(200).send({
              links: [`https://tixawsbucket.s3.eu-central-1.amazonaws.com/${newName}`],
            });
          })
          .catch(() => {
            res.status(402).send('error');
          });
      }
    }
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
