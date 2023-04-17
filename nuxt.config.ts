export default defineNuxtConfig({
    modules: [
      "@nuxtjs/tailwindcss",
      '@pinia/nuxt'],
    ssr: false,
    css: [
      "primevue/resources/themes/saga-blue/theme.css",
      "primevue/resources/primevue.css",
      "~/assets/styles.scss",
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
  });
  