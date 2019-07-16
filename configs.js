const path = require('path');

/**
 * This file is simply used to initialize
 * and configure dotenv. Here we specify the
 * path to the folder where the .env file can be found
 */
require('dotenv').config({
  path: path.join(__dirname, './.env')
});