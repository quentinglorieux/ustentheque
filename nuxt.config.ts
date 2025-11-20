import { DIRECTUS_BASE, DIRECTUS_REMOTE_BASE } from "./utils/directusConfig";

export default defineNuxtConfig({
  modules: [
    'nuxt-directus',
    "@nuxtjs/tailwindcss",
    '@nuxt/ui'
  ],

  runtimeConfig: {
    directus: {
      base: DIRECTUS_REMOTE_BASE,
    },
    public: {
      directusBase: DIRECTUS_BASE,
    },
  },

  ssr: false,

  css: [
    "@/assets/styles.scss",
    "primevue/resources/themes/tailwind-light/theme.css",
    "primevue/resources/primevue.css",
    "primeicons/primeicons.css",
    "primeflex/primeflex.css",
    "@/assets/demo/styles/flags/flags.css"
  ],

  build: {
    transpile: ["primevue"],
  },

  components: [
    {
      path: "~/components/",
      pathPrefix: false,
    },
  ],

  serverMiddleware: [
    { path: '/api/send-email', handler: '~/api/sendEmail.js' },
  ],

  compatibilityDate: "2024-09-11"
});