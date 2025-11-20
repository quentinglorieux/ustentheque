import { createError, setResponseStatus } from "h3";
import type { H3Event } from "h3";

const buildHealthUrl = (base: string) => {
  try {
    const url = new URL("/server/health", base);
    return url.toString();
  } catch {
    return `${base.replace(/\/$/, "")}/server/health`;
  }
};

const fetchDirectusHealth = async (event: H3Event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const base = runtimeConfig.directus?.base;

  if (!base) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing directus base URL",
    });
  }

  const url = buildHealthUrl(base);
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: `Directus health check failed (${response.status})`,
    });
  }

  return response.json();
};

export default defineEventHandler(async (event) => {
  try {
    const upstream = await fetchDirectusHealth(event);
    return {
      ok: true,
      upstream,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const status = error instanceof Error && "statusCode" in error ? (error as any).statusCode : 503;
    setResponseStatus(event, status ?? 503);

    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
});
