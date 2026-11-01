import ImageKit from 'imagekit';
import { env } from './env.js';

let client = null;
export const isImageKitConfigured = () => !!(env.imagekit.publicKey && env.imagekit.privateKey && env.imagekit.urlEndpoint);

// Returns null (never throws) when ImageKit keys are missing, so the rest of the API keeps working.
export function getImageKit() {
  if (!isImageKitConfigured()) return null;
  client ||= new ImageKit({ publicKey: env.imagekit.publicKey, privateKey: env.imagekit.privateKey, urlEndpoint: env.imagekit.urlEndpoint });
  return client;
}
