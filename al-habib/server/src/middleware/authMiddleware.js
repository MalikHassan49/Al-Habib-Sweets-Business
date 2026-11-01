import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.token;
  if (!token) throw new ApiError(401, 'Please log in to continue.');
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    throw new ApiError(401, 'Your session has expired. Please log in again.');
  }
  const admin = await Admin.findById(payload.id);
  if (!admin) throw new ApiError(401, 'This account no longer exists.');
  req.admin = admin;
  next();
});

export const authorize = (...roles) => (req, _res, next) =>
  roles.includes(req.admin?.role) ? next() : next(new ApiError(403, 'You do not have permission to do this.'));

// CSRF defence for cookie auth: SameSite cookie + CORS locked to CLIENT_URL + a custom header
// required on every state-changing request (cannot be sent cross-site without a CORS preflight).
export const csrfGuard = (req, _res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('x-requested-with') !== 'XMLHttpRequest') return next(new ApiError(403, 'Missing CSRF header.'));
  next();
};

// Sets req.admin when a valid session exists; never rejects. Lets public routes show admins extra data.
export const optionalAuth = (req, _res, next) => {
  if (!req.cookies?.token) return next();
  protect(req, _res, (err) => next(err?.status === 401 ? undefined : err));
};
