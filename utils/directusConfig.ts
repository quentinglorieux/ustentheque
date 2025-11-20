const directusFromProcess =
  typeof process !== "undefined"
    ? process.env?.NUXT_PUBLIC_DIRECTUS_BASE ?? process.env?.DIRECTUS_BASE
    : undefined;

export const DIRECTUS_BASE =
  directusFromProcess ?? "https://bibob.rubidiumweb.fr";
