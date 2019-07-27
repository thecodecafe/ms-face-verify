const { unlinkSync } = require('fs');

module.exports = async (file) => {
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