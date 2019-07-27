const { readdirSync, existsSync, mkdirSync } = require("fs");
const path = require('path');
const { SilentDelete, Directories } = require('./utils');

// create images path if it does not exist
if(!existsSync(Directories.imagesPath))
  mkdirSync(Directories.imagesPath);

// get all images in the images directory
readdirSync(Directories.imagesPath).forEach(async image => {
  // delete images in th eimages directory
  await SilentDelete(path.join(Directories.imagesPath, image));
});