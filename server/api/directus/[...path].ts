import { defineEventHandler, getRequestURL, proxyRequest } from "h3";

export default defineEventHandler(async (event) => {
  const {
    directus: { base },
  } = useRuntimeConfig();

  const pathSegments = event.context.params?.path;
  const relativePath = Array.isArray(pathSegments)
    ? pathSegments.join("/")
    : pathSegments ?? "";

  const requestUrl = getRequestURL(event);
  const target = new URL(relativePath, base.endsWith("/") ? base : `${base}/`);
  target.search = requestUrl.search;

  return proxyRequest(event, target.toString());
});
