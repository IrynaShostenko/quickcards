function slugifyTitle(title) {
  return String(title || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яіїєґёüöäß\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function createPublicSlug(title) {
  const baseSlug = slugifyTitle(title) || "deck";
  const suffix = Math.random().toString(36).slice(2, 8);

  return `${baseSlug}-${suffix}`;
}

module.exports = {
  createPublicSlug,
};
