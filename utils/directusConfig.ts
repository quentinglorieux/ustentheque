const envBaseFromProcess =
  typeof process !== "undefined" ? process.env?.NUXT_PUBLIC_DIRECTUS_BASE : undefined;
const envBaseFromImportMeta =
  typeof import.meta !== "undefined" ? import.meta.env?.NUXT_PUBLIC_DIRECTUS_BASE : undefined;

export const DIRECTUS_BASE =
  envBaseFromProcess ?? envBaseFromImportMeta ??
  "https://devdirectus.rubidiumweb.eu";
