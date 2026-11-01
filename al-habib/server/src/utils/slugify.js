export const slugify = (text) => {
  const s = String(text).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s || `item-${Date.now().toString(36)}`;
};
