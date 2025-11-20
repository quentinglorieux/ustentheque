import { Directus } from "@directus/sdk";

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig();
  const baseURL = process.server
    ? runtimeConfig.directus?.base
    : runtimeConfig.public.directusBase;

  const directus = new Directus(baseURL);

  return {
    provide: {
      directus,
    },
  };
});

type DirectusClient = Directus<Record<string, any>>;

declare module "#app" {
  interface NuxtApp {
    $directus: DirectusClient;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $directus: DirectusClient;
  }
}
