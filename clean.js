const { readdirSync, existsSync, mkdirSync } = require("fs");
const path = require('path');
const { SilentDelete, imagesPath } = require('./utils');

// create images path if it does not exist
if(!existsSync(imagesPath)) mkdirSync(imagesPath);

// get all images in the images directory
readdirSync(imagesPath).forEach(async image => {
  // delete images in th eimages directory
  await SilentDelete(path.join(imagesPath, image));
});