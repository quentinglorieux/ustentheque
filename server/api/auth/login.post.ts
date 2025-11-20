import { createError, readBody } from "h3";

interface LoginBody {
  email?: string;
  password?: string;
}

const buildEndpoint = (base: string, path: string) => {
  const url = new URL(path, base);
  return url.toString();
};

export default defineEventHandler(async (event) => {
  const body = (await readBody<LoginBody>(event)) ?? {};

  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and password are required",
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

  const response = await fetch(buildEndpoint(directusBase, "/auth/login"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email: body.email,
      password: body.password,
      mode: "json",
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.errors?.[0]?.message ?? "Directus login failed";
    throw createError({
      statusCode: response.status,
      statusMessage: message,
      data: payload,
    });
  }

  return payload;
});
