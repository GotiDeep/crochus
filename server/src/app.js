const express = require('express');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const router = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

function createCorsOptions() {
  return {
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  };
}

function createApp() {
  const app = express();

  app.use(cors(createCorsOptions()));
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'uploads')));
  app.use('/api/v1', router);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};

