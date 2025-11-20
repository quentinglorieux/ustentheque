const DEFAULT_REMOTE_BASE = "https://bibob.rubidiumweb.fr";

const directusPublicBase =
  typeof process !== "undefined"
    ? process.env?.NUXT_PUBLIC_DIRECTUS_BASE ?? "/api/directus"
    : "/api/directus";

const directusRemoteBase =
  typeof process !== "undefined"
    ? process.env?.DIRECTUS_REMOTE_BASE ?? DEFAULT_REMOTE_BASE
    : DEFAULT_REMOTE_BASE;

export const DIRECTUS_BASE = directusPublicBase;
export const DIRECTUS_REMOTE_BASE = directusRemoteBase;
