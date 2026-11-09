// Reads one JSON object from stdin; never accept passwords in command arguments.
require('dotenv').config();
const { prisma } = require('../src/db');
const UserModel = require('../src/models/user.model');
const { hashPassword } = require('../src/utils/password');

const main = async () => {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
    if (Buffer.byteLength(input) > 4096) throw new Error('Input is too large');
  }
  const { username, password } = JSON.parse(input);
  if (typeof username !== 'string' || typeof password !== 'string' || password.length < 12) throw new Error('A username and a new password of at least 12 characters are required');
  const user = await UserModel.findByUsername(username.trim());
  if (!user) throw new Error('Account not found');
  if (!process.argv.includes('--apply')) { console.log('Account found. Dry run only; use --apply to reset this account in the configured database.'); return; }
  await UserModel.setPassword(user.id, await hashPassword(password));
  console.log('Account password reset. Existing sessions for this account are invalidated.');
};
main().catch(() => { console.error('Password reset failed. Check the account, configuration and input.'); process.exitCode = 1; }).finally(() => prisma.$disconnect());
