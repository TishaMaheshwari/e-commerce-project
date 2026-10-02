var express = require('express');
var catalogEndpoints = require('./src/routes/catalog');
require('dotenv').config();

var serverInstance = express();
serverInstance.use(express.json());

serverInstance.use('/api/v2/catalog', catalogEndpoints);

var TARGET_PORT = process.env.APP_PORT || 6000;
if (process.env.NODE_ENV !== 'test') {
  serverInstance.listen(TARGET_PORT, function () {
    console.log('Apparel core services online on port ' + TARGET_PORT);
  });
}

module.exports = serverInstance;