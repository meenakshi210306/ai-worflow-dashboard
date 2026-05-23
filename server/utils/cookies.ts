export function getCookieValue(cookieHeader: string | undefined, cookieName: string) {
  if (!cookieHeader) {
    return null;
  }

  const cookiePairs = cookieHeader.split(";");

  for (const cookiePair of cookiePairs) {
    const [rawName, ...rawValueParts] = cookiePair.trim().split("=");

    if (decodeURIComponent(rawName) === cookieName) {
      return decodeURIComponent(rawValueParts.join("="));
    }
  }

  return null;
}