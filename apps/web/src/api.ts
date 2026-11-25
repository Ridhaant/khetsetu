const API =
  (
    import.meta as unknown as { env: Record<string, string> }
  ).env.VITE_API_URL?.replace(/\/$/, "") ?? "";
let token = "";
export const connected = Boolean(API);
export async function request(
  path: string,
  body?: unknown,
  method?: string,
  headers: Record<string, string> = {},
) {
  if (!API)
    throw new Error(
      "This preview uses browser-local sample data. Connect the API to perform this action.",
    );
  const r = await fetch(`${API}${path}`, {
    method: method ?? (body ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await r.json();
  if (!r.ok)
    throw new Error(
      data.message ??
        data.error?.message ??
        data.error ??
        `Request failed (${r.status})`,
    );
  return data;
}
export async function demoLogin(role: string, sellerId?: string) {
  const data = await request("/auth/demo", {
    role,
    ...(sellerId ? { sellerId } : {}),
  });
  token = data.accessToken;
  return data;
}
