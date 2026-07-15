const fs = require('fs');
const path = require('path');
const { createApp } = require('./app');
const env = require('./config/env');

// Ensure uploads directory exists (needed when Cloudinary is not configured)
const uploadDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = createApp();

app.listen(env.port, () => {
  console.log(`Crochus API listening on port ${env.port}`);
});

