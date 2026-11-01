import { body } from 'express-validator';

export const loginRules = [
  body('email').isString().trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').isString().isLength({ min: 1, max: 128 }).withMessage('Enter your password.'),
];
