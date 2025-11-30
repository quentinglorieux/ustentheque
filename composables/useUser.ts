import { readMe, authentication } from '@directus/sdk';

export const useUser = () => {
    const user = useState<any>('user', () => null);
    const loading = useState('user-loading', () => false);
    const directus = useDirectus();

    const fetchUser = async () => {
        console.log('useUser: fetchUser called');
        loading.value = true;
        try {
            const me = await directus.request(readMe({
                fields: ['*', 'avatar', 'role', 'first_name', 'last_name', 'email']
            }));
            console.log('useUser: fetchUser success', me);
            user.value = me;
        } catch (e) {
            console.error('useUser: fetchUser error', e);
            user.value = null;
        } finally {
            loading.value = false;
        }
    };

    const login = async (email: string, password: string) => {
        console.log('useUser: login called');
        try {
            await directus.login({ email, password });
            console.log('useUser: directus login success, fetching user...');
            await fetchUser();
            return true;
        } catch (e) {
            console.error('useUser: Login failed:', e);
            throw e;
        }
    };

    const logout = async () => {
        console.log('useUser: logout called');
        try {
            await directus.logout();
        } catch (e) {
            console.error('useUser: Logout failed:', e);
        } finally {
            user.value = null;
            // Clear local storage if needed, though directus sdk handles cookies
            localStorage.clear();
        }
    };

    return {
        user,
        loading,
        fetchUser,
        login,
        logout,
        isAuthenticated: computed(() => !!user.value)
    };
};
