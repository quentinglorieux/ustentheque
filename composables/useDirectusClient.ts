import type { Directus } from "@directus/sdk";

export const useDirectusClient = <Schema extends Record<string, any> = any>() => {
  const nuxtApp = useNuxtApp();
  const client = nuxtApp.$directus as Directus<Schema> | undefined;

  if (!client) {
    throw new Error("Directus client is not available. Ensure the directus plugin is loaded.");
  }

  return client;
};
