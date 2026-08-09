const serverless = require('serverless-http');
const { createApp } = require('../../server/src/app');

module.exports.handler = serverless(createApp());
