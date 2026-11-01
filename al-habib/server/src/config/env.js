import dotenv from 'dotenv';
dotenv.config();

const missing = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill them in.`);
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters long.');
  process.exit(1);
}

export const env = {
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL,
  // Use COOKIE_SAMESITE=none only if client and API are on different sites in production.
  cookieSameSite: process.env.COOKIE_SAMESITE || 'strict',
  whatsappNumber: process.env.WHATSAPP_NUMBER || '',
  imagekit: {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: (process.env.IMAGEKIT_URL_ENDPOINT || '').replace(/\/+$/, ''),
  },
};
