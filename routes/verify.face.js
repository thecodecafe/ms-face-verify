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
  const {image1, image2} = req.body;

  // create image names
  const image1Name = uuid() + '.jpg';
  const image2Name = uuid() + '.jpg';

  // create image buffers
  const image1Buffer = new Buffer(image1, 'base64');
  const image2Buffer = new Buffer(image2, 'base64');

  try {
    // create images folder
    await CreateImageDirectory();

    // save images locally
    await SaveImage(path.join(Directories.imagesPath, image1Name), image1Buffer);
    await SaveImage(path.join(Directories.imagesPath, image2Name), image2Buffer);

    // detect image one
    const image1Detection = await FaceId.detect(process.env.APP_URL + '/images/' + image1Name, 1);
    // throw error if face one was not detected
    if(!image1Detection[0]) throw new Error('Failed to detect face on image one.');

    // detect image two
    const image2Detection = await FaceId.detect(process.env.APP_URL + '/images/' + image2Name, 1);
    // throw error if face two was not detected
    if(!image2Detection[0]) throw new Error('Failed to detect face on image two.');

    // verify faces
    const verification = await FaceId.verify(image1Detection[0].faceId, image2Detection[0].faceId);
    if(!verification) throw new Error('Unable to verify faces at the moment.');
    if(verification.error) throw verification.error;

    // delete images
    await SilentDelete(path.join(Directories.imagesPath, image1Name));
    await SilentDelete(path.join(Directories.imagesPath, image2Name));

    // return a response
    return res.status(200).json({
      success: true,
      data: verification
    });

  }catch(error){
    // get error message
    let errorMessage = error.message;
    // delete files
    await SilentDelete(path.join(Directories.imagesPath, image1Name));
    await SilentDelete(path.join(Directories.imagesPath, image2Name));
    // more than one face detected
    if(/multiple faces/i.test(errorMessage)){
      errorMessage = image1Detection 
        ? 'Multiple faces detected in image two.'
        : 'Multiple faces detected in image one.'
    }
    // no face detected error
    if(/must consist of one/i.test(errorMessage)){
      errorMessage = image1Detection 
        ? 'No face detected in image two.'
        : 'No face detected in image one.'
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