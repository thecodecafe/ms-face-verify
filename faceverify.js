const express = require('express');
const router = express.Router();
const request = require('request');
const { unlinkSync, writeFile, existsSync, mkdirSync } = require('fs');
const path = require('path');
const uuid = require('uuid/v4');
const imagesPath = path.join(__dirname, 'images');

// default headers per request
const HEADERS = {
  'Content-Type': 'application/json',
  'Ocp-Apim-Subscription-Key': process.env.FACE_ID_KEY
}

// deletes files quietly
const silenDelete = async (file) => {
  try{
    // delete file
    unlinkSync(file);
    // resolve promise
    return Promise.resolve();
  }catch(error){
    // resolve promise
    return Promise.resolve();
  }
}

const createImagesFolder = () => new Promise((resolve, reject) => {
  try{
    if(!existsSync(imagesPath)){
      mkdirSync(imagesPath);
    }
    resolve();
  }catch(error){
    reject(error);
  }
})

// Upload app to directory
const updloadImage = async (name, bufferData) => {
  try{
    writeFile(name, bufferData, (error) => {
      if(error) return Promise.reject(error);
      return Promise.resolve();
    });
  }catch(error){
    Promise.reject(error);
  }
}

// verifies two faces are similar
const verifyFace = (faceid1, faceid2) => {
  // setup request options
  const options = {
    uri: process.env.BASE_URI + '/verify',
    qs: {'returnFaceId': true},
    body: JSON.stringify({faceid1, faceid2,}),
    headers: HEADERS
  }
  // return promise
  return new Promise((resolve, reject) => {
    // make request
    request.post(options, (error, responce, body) => {
      // reject when thee is an error
      if(error) return reject(error);
      // resolve with response body parsed
      return resolve(JSON.parse(body));
    });
  })
}

// detects face and returns a face ID
const detectFace = url => {
  // setup request options
  const options = {
    uri: process.env.BASE_URI + '/detect',
    qs: {'returnFaceId': true},
    body: JSON.stringify({url}),
    headers: HEADERS
  }
  return new Promise((resolve, reject) => {
    // make request
    request.post(options, (error, response, body) => {
      // return error when no image is found
      if(error) return reject(error);
      // parse JSON body
      body = JSON.parse(body);
      // multiple faces check
      if(body.length >= 2) return reject(new Error('Multiple faces per photo not supported.'));
      // no face check
      if(body.length <= 0) return reject(new Error('All images must consist of one face.'));
      // return found face
      return resolve(body[0]);
    });
  })
}

// handle request for face verifications
router.post('/', async (req, res) => {
  // get images from the request body
  const {face1, face2} = req.body;

  // face date containers
  let face1Data, face2Data;

  // create image names
  const face1Name = uuid() + '.jpg';
  const face2Name = uuid() + '.jpg';

  // create image buffers
  const face1Buffer = new Buffer(face1, 'base64');
  const face2Buffer = new Buffer(face2, 'base64');

  try {
    // create images folder
    await createImagesFolder();

    // save images locally
    await updloadImage(path.join(imagesPath, face1Name), face1Buffer);
    await updloadImage(path.join(imagesPath, face2Name), face2Buffer);

    // detect image one
    face1Data = await detectFace(process.env.APP_URL + '/images/' + face1Name);
    // throw error if face one was not detected
    if(!face1Data) throw new Error('Failed to detect face on image one.');

    // detect image two
    face2Data = await detectFace(process.env.APP_URL + '/images/' + face2Name);
    // throw error if face two was not detected
    if(!face2Data) throw new Error('Failed to detect face on image two.');

    // verify faces
    const faceVerification = await verifyFace(face1Data.faceId, face2Data.faceId);
    if(!faceVerification) throw new Error('Unable to verify faces at the moment.');

    // delete images
    await silenDelete(path.join(imagesPath, face1Name));
    await silenDelete(path.join(imagesPath, face2Name));

    // return a response
    return res.status(200).json({
      success: true,
      data: faceVerification
    });

  }catch(error){
    // get error message
    let errorMessage = error.message;
    // delete files
    await silenDelete(path.join(imagesPath, face1Name));
    await silenDelete(path.join(imagesPath, face2Name));
    // more than one face detected
    if(/multiple faces/i.test(errorMessage)){
      errorMessage = face1Data 
        ? 'Multiple faces detected in image two.'
        : 'Multiple faces detected in image one.'
    }
    // no face detected error
    if(/must consist of one/i.test(errorMessage)){
      errorMessage = face1Data 
        ? 'No face detected in image two.'
        : 'No face detected in image one.'
    }
    // return status
    return res.status(400).json({success: false, message: errorMessage});
  }
});

module.exports = router;