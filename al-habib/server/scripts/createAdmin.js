// PowerShell:
//   $env:ADMIN_NAME="Owner"; $env:ADMIN_EMAIL="owner@example.com"; $env:ADMIN_PASSWORD="a-long-password"; npm run create-admin
import mongoose from 'mongoose';
import '../src/config/env.js';
import { connectDB } from '../src/config/db.js';
import Admin from '../src/models/Admin.js';

import dns from "node:dns";

dns.setServers(['8.8.8.8']);

const { ADMIN_NAME: name, ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env;
const fail = (msg) => { console.error(msg); process.exit(1); };
if (!name || !email || !password) fail('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD first.');
if (password.length < 12) fail('ADMIN_PASSWORD must be at least 12 characters.');

await connectDB();
if (!process.argv.includes('--allow-additional') && (await Admin.countDocuments()) > 0) {
  await mongoose.disconnect();
  fail('An admin already exists. Re-run with --allow-additional to add another one.');
}
const admin = await Admin.create({ name, email, role: 'superadmin', passwordHash: await Admin.hashPassword(password) });
console.log(`Admin created: ${admin.email}`);
await mongoose.disconnect();
