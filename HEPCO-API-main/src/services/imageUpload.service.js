const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const cloudinary = require('cloudinary').v2;
const { LOCAL_MEDIA_DIRECTORY, IMAGE_FOLDER } = require('../constants/upload');
const AppError = require('../utils/AppError');

const localEnabled = () => process.env.UPLOAD_STORAGE === 'local' && !process.env.VERCEL && process.env.NODE_ENV !== 'production';
const imageExtension = (buffer) => {
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return 'jpg';
  if (['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString())) return 'gif';
  if (buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return 'webp';
  throw new AppError('INVALID_IMAGE_UPLOAD', 400, 'Unsupported image contents');
};
const configureCloud = () => {
  if (![process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET].every(Boolean)) throw new AppError('UPLOAD_CONFIGURATION_ERROR', 503, 'Image storage is not configured');
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
};
if ([process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET].every(Boolean)) configureCloud();
exports.uploadImage = async (file) => {
  if (!file?.buffer) throw new AppError('NO_FILE_UPLOADED', 400, 'An image is required');
  const extension = imageExtension(file.buffer);
  if (localEnabled()) {
    const folder = path.join(LOCAL_MEDIA_DIRECTORY, 'images');
    await fs.mkdir(folder, { recursive: true });
    const filename = `${randomUUID()}.${extension}`;
    await fs.writeFile(path.join(folder, filename), file.buffer, { flag: 'wx' });
    return `/api/media/images/${filename}`;
  }
  configureCloud();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: IMAGE_FOLDER, resource_type: 'image' }, (error, result) => {
      if (error) reject(new AppError('UPLOAD_FAILED', 502, 'Image storage did not accept the upload'));
      else if (!result?.secure_url) reject(new AppError('UPLOAD_FAILED', 502, 'Image storage did not confirm a permanent URL'));
      else resolve(result.secure_url);
    });
    stream.end(file.buffer);
  });
};
exports.deleteImage = async (url) => {
  if (localEnabled() && typeof url === 'string' && /^\/api\/media\/images\/[a-f0-9-]+\.(png|jpg|gif|webp)$/.test(url)) {
    try { await fs.unlink(path.join(LOCAL_MEDIA_DIRECTORY, 'images', path.basename(url))); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    return;
  }
  configureCloud();
  let parsed;
  try { parsed = new URL(url); } catch { throw new AppError('INVALID_INPUT', 400, 'Invalid image URL'); }
  const prefix = `/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'res.cloudinary.com' || !parsed.pathname.startsWith(prefix)) throw new AppError('INVALID_INPUT', 400, 'Image is outside the managed storage');
  const relative = parsed.pathname.slice(prefix.length).replace(/^v\d+\//, '');
  if (!/^hepco_news\/[A-Za-z0-9_-]+\.[A-Za-z0-9]+$/.test(relative)) throw new AppError('INVALID_INPUT', 400, 'Image is outside the managed folder');
  const result = await cloudinary.uploader.destroy(relative.replace(/\.[^.]+$/, ''));
  if (!['ok', 'not found'].includes(result.result)) throw new AppError('DELETE_FAILED', 502, 'Image storage did not confirm deletion');
};
