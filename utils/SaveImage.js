const { writeFile } = require('fs');

module.exports = (name, bufferData) => {
  try {
    writeFile(name, bufferData, (error) => {
      if (error) return Promise.reject(error);
      return Promise.resolve();
    });
  } catch (error) {
    Promise.reject(error);
  }
}