import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const COOKIE = { httpOnly: true, secure: env.isProd, sameSite: env.cookieSameSite, path: '/' };
const WEEK = 7 * 24 * 60 * 60 * 1000;
const publicAdmin = (a) => ({ id: a._id, name: a.name, email: a.email, role: a.role });

export const login = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email }).select('+passwordHash');
  const ok = admin && (await admin.comparePassword(req.body.password));
  if (!ok) throw new ApiError(401, 'Incorrect email or password.');
  const token = jwt.sign({ id: admin._id }, env.jwtSecret, { algorithm: 'HS256', expiresIn: '7d' });
  res.cookie('token', token, { ...COOKIE, maxAge: WEEK });
  res.json({ success: true, data: publicAdmin(admin) });
});

export const logout = (_req, res) => {
  res.clearCookie('token', COOKIE);
  res.json({ success: true, message: 'Logged out.' });
};

export const me = (req, res) => res.json({ success: true, data: publicAdmin(req.admin) });
