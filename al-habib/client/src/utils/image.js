// Adds ImageKit resize/format transformations; other URLs are returned unchanged.
export const ikUrl = (url, width = 480) =>
  url && url.includes('ik.imagekit.io') ? `${url}${url.includes('?') ? '&' : '?'}tr=w-${width},f-auto,q-80` : url;
