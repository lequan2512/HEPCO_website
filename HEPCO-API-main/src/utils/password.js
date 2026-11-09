const { randomBytes, scrypt, timingSafeEqual, createHash } = require('node:crypto');
const { promisify } = require('node:util');
const { AUTH } = require('../constants/auth');
const derive = promisify(scrypt);
const hashOptions = { N: AUTH.HASH_COST, r: AUTH.HASH_BLOCK_SIZE, p: AUTH.HASH_PARALLELISM, maxmem: AUTH.HASH_MAX_MEMORY };
const hashHeader = `${AUTH.HASH_PREFIX}$${AUTH.HASH_COST}$${AUTH.HASH_BLOCK_SIZE}$${AUTH.HASH_PARALLELISM}`;

const isPasswordHash = (value) => {
  if (typeof value !== 'string') return false;
  const parts = value.split('$');
  return parts.length === 6 && parts.slice(0, 4).join('$') === hashHeader && /^[a-f0-9]{32}$/.test(parts[4]) && /^[a-f0-9]{128}$/.test(parts[5]);
};
const hashPassword = async (password) => {
  if (typeof password !== 'string' || !password || Buffer.byteLength(password) > AUTH.MAX_PASSWORD_BYTES) throw new Error('Invalid password');
  const salt = randomBytes(AUTH.SALT_BYTES);
  const hash = await derive(password, salt, AUTH.HASH_BYTES, hashOptions);
  return `${hashHeader}$${salt.toString('hex')}$${hash.toString('hex')}`;
};
const verifyPassword = async (password, encoded) => {
  if (!isPasswordHash(encoded) || typeof password !== 'string' || Buffer.byteLength(password) > AUTH.MAX_PASSWORD_BYTES) return false;
  const parts = encoded.split('$');
  const actual = await derive(password, Buffer.from(parts[4], 'hex'), AUTH.HASH_BYTES, hashOptions);
  return timingSafeEqual(actual, Buffer.from(parts[5], 'hex'));
};
const credentialVersion = (passwordHash) => createHash('sha256').update(passwordHash).digest('base64url');
module.exports = { hashPassword, verifyPassword, isPasswordHash, credentialVersion };
