const path = require('node:path');
const os = require('node:os');
module.exports = {
  IMAGE_MAX_BYTES: 5 * 1024 * 1024,
  IMAGE_FOLDER: 'hepco_news',
  LOCAL_MEDIA_DIRECTORY: process.env.LOCAL_MEDIA_DIRECTORY || path.join(process.env.LOCALAPPDATA || os.tmpdir(), 'HEPCO', 'uploads'),
};
