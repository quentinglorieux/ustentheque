import { DIRECTUS_BASE } from "./utils/directusConfig";

export default defineNuxtConfig({
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/tailwindcss"],

  runtimeConfig: {
    smtpHost: process.env.NUXT_SMTP_HOST,
    smtpPort: process.env.NUXT_SMTP_PORT,
    smtpUser: process.env.NUXT_SMTP_USER,
    smtpPass: process.env.NUXT_SMTP_PASS,
    smtpFrom: process.env.NUXT_SMTP_FROM,
    directusAdminToken: process.env.DIRECTUS_ADMIN_TOKEN,
    public: {
      directusBase: DIRECTUS_BASE,
    },
  },

  ssr: false,

  css: [
    "@/assets/styles.scss",
    "primevue/resources/themes/tailwind-light/theme.css",
    "primevue/resources/primevue.css",
    "primeicons/primeicons.css"
  ],

  build: {
    transpile: ["primevue"],
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin'],
        },
      },
    },
  },

  components: [
    {
      path: "~/components/",
      pathPrefix: false,
    },
  ],

  compatibilityDate: "2024-09-11"
});