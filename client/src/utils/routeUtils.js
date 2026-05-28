function getHashPathParts() {
  const hashPath = window.location.hash.replace("#", "");
  return hashPath.split("/").filter(Boolean);
}

export function getPracticeDeckIdFromUrl() {
  const pathParts = getHashPathParts();

  if (pathParts[0] !== "practice" || !pathParts[1]) {
    return null;
  }

  return pathParts[1];
}

export function getEditDeckIdFromUrl() {
  const pathParts = getHashPathParts();

  if (pathParts[0] !== "edit" || !pathParts[1]) {
    return null;
  }

  return pathParts[1];
}

export function isDashboardRoute() {
  const pathParts = getHashPathParts();

  return pathParts[0] === "dashboard";
}