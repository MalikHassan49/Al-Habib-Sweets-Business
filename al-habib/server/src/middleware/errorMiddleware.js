import { env } from '../config/env.js';

export const notFound = (req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });

export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message;
  let errors = err.errors;

  if (err.name === 'ValidationError') {
    status = 422;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.code === 11000) {
    status = 409;
    message = `That ${Object.keys(err.keyPattern || {})[0] || 'value'} is already in use.`;
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier.';
  }

  if (status >= 500) {
    console.error(err);
    if (env.isProd) message = 'Something went wrong on our side.';
  }
  res.status(status).json({ success: false, message, ...(errors && { errors }) });
};
