require('./configs');
const express = require('express');
const bodyParser = require('body-parser');
const port = process.env.PORT || process.env.APP_PORT;
const path = require('path');

// initialize app
const app = express();

// initialize body parser
app.use(bodyParser.json({limit: '50mb'}));

app.use('/images', express.static(path.join(__dirname, 'images')))

// setup routes
app.use('/face/verify', require("./routes/verify.face"));
app.use('/face/detect', require("./routes/detect.face"));

// 404 page not found errors
app.use((req, res) => {
  res.status(404).json({
    success: true,
    message: 'Resource has either been moved or does not exist.'
  });
});

// start server
if(!port) {
  console.log('Please specify port either with PORT or APP_PORT to run app');
  return process.exit(1);
}

app.listen(port, () => console.log(
  `Server started on port ${port}.`
));