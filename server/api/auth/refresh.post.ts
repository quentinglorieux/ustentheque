import { createError, readBody } from "h3";

interface RefreshBody {
  refreshToken?: string;
}

const buildEndpoint = (base: string, path: string) => new URL(path, base).toString();

export default defineEventHandler(async (event) => {
  const body = (await readBody<RefreshBody>(event)) ?? {};

  if (!body.refreshToken) {
    throw createError({
      statusCode: 400,
      statusMessage: "Refresh token is required",
    });
  }

  const runtimeConfig = useRuntimeConfig(event);
  const directusBase = runtimeConfig.directus?.base;

  if (!directusBase) {
    throw createError({
      statusCode: 500,
      statusMessage: "Directus base URL is not configured",
    });
  }

  const response = await fetch(buildEndpoint(directusBase, "/auth/refresh"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ refresh_token: body.refreshToken }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.errors?.[0]?.message ?? "Directus refresh failed";
    throw createError({
      statusCode: response.status,
      statusMessage: message,
      data: payload,
    });
  }

  return payload;
});
