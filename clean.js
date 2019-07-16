const { unlinkSync, readdirSync, existsSync, mkdirSync } = require("fs");
const path = require('path');
const imagesPath = path.join(__dirname, 'images');

// deletes files quietly
const silenDelete = async file => {
  try {
    // delete file
    unlinkSync(file);
    // resolve promise
    return Promise.resolve();
  } catch (error) {
    // resolve promise
    return Promise.resolve();
  }
}

// create images path if it does not exist
if(!existsSync(imagesPath)) mkdirSync(imagesPath);

// get all images in the images directory
readdirSync(imagesPath).forEach(async image => {
  // delete images in th eimages directory
  await silenDelete(path.join(imagesPath, image));
});