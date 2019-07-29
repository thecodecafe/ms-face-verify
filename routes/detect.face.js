const express = require('express');
const router = express.Router();
const path = require('path');
const uuid = require('uuid/v4');
const {
  FaceId,
  SilentDelete,
  CreateImageDirectory,
  Directories,
  SaveImage
} = require('../utils');

// handle request for face verifications
router.post('/', async (req, res) => {
  // get images from the request body
  const { image, maxFaces } = req.body;

  // create image names
  const imageName = uuid() + '.jpg';

  // create image buffers
  const imageBuffer = new Buffer(image, 'base64');

  try {
    // create images folder
    await CreateImageDirectory();

    // save images locally
    await SaveImage(path.join(Directories.imagesPath, imageName), imageBuffer);

    // detect face on image
    const detected = await FaceId.detect(
      process.env.APP_URL + '/images/' + imageName,
      maxFaces || 1
    );

    // throw error if face was not detected
    if (!detected) throw new Error('Failed to detect face on image.');

    // delete images
    await SilentDelete(path.join(Directories.imagesPath, imageName));

    // return a response
    return res.status(200).json({ success: true, data: detected });
  } catch (error) {
    // get error message
    let errorMessage = error.message;
    // delete files
    await SilentDelete(path.join(Directories.imagesPath, imageName));
    // more than one face detected
    if (/multiple faces/i.test(errorMessage)) {
      errorMessage = `Photo must have a maximum of ${maxFaces} face(s).`
    }
    // no face detected error
    if (/must consist of one/i.test(errorMessage)) {
      errorMessage = 'No face detected on image.'
    }
    // return status
    return res.status(400).json({
      success: false,
      message: errorMessage,
      meta: {
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code
        }
      }
    });
  }
});

module.exports = router;