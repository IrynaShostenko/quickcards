export function getPracticeDeckIdFromUrl() {
  const hashPath = window.location.hash.replace("#", "");
  const pathParts = hashPath.split("/").filter(Boolean);

  if (pathParts[0] !== "practice" || !pathParts[1]) {
    return null;
  }

  return pathParts[1];
}