export default defineNuxtConfig({
  modules: [
    'nuxt-directus',
    "@nuxtjs/tailwindcss",
    '@pinia/nuxt'],

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