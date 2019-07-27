const { existsSync, mkdirSync } = require('fs');
const { imagesPath } = require('./Directories');

module.exports = () => new Promise((resolve, reject) => {
  try {
    if (!existsSync(imagesPath)) {
      mkdirSync(imagesPath);
    }
    resolve();
  } catch (error) {
    reject(error);
  }
})