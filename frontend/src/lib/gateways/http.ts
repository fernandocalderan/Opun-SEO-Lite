export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
}

export function authHeaders() {
  const headers: Record<string, string> = { Accept: "application/json" };
  const key = process.env.NEXT_PUBLIC_API_KEY?.trim();
  const bearer = process.env.NEXT_PUBLIC_BEARER?.trim();
  if (key) headers["x-api-key"] = key;
  if (bearer) headers["Authorization"] = `Bearer ${bearer}`;
  return headers;
}

