const request = require('request');

class FaceId {

  // default header for requests
  static HEADERS() {
    return {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': process.env.FACE_ID_KEY
    }
  };

  // verifies two faces are similar
  static verify(faceid1, faceid2) {
    // setup request options
    const options = {
      uri: process.env.BASE_URI + '/verify',
      qs: { 'returnFaceId': true },
      body: JSON.stringify({faceid1, faceid2}),
      headers: FaceId.HEADERS()
    }
    // return promise
    return new Promise((resolve, reject) => {
      // make request
      request.post(options, (error, responce, body) => {
        // reject when thee is an error
        if (error) return reject(error);
        // resolve with response body parsed
        return resolve(JSON.parse(body));
      });
    })
  }

  // detects face and returns a face ID
  static detect(url, maxFaces = 1) {
    // setup request options
    const options = {
      uri: process.env.BASE_URI + '/detect',
      qs: { 'returnFaceId': true },
      body: JSON.stringify({ url }),
      headers: FaceId.HEADERS()
    }
    return new Promise((resolve, reject) => {
      // make request
      request.post(options, (error, response, body) => {
        // return error when no image is found
        if (error) return reject(error);
        // parse JSON body
        body = JSON.parse(body);
        // multiple faces check
        if (body.length > maxFaces) return reject(new Error('Multiple faces per photo not supported.'));
        // no face check
        if (body.length <= 0) return reject(new Error('All images must consist of one face.'));
        // return with body error if any
        if(body.error) return reject(body.error);
        // return found face
        return resolve(body);
      });
    })
  }
}

module.exports = FaceId;