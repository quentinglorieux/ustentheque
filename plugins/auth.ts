export default defineNuxtPlugin(async (nuxtApp) => {
    const { fetchUser } = useUser();

    // We don't await this on server-side to avoid blocking, 
    // but on client-side we might want to wait or just let it run.
    // Since Directus auth is cookie-based, we can try to fetch the user.

    await fetchUser();
});
