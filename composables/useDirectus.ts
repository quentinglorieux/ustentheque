import { createDirectus, rest, authentication } from '@directus/sdk';
import { useDirectusBase } from './useDirectusBase';

export const useDirectus = () => {
    const directusBase = useDirectusBase();

    const storage = {
        get: () => {
            if (typeof window !== 'undefined') {
                const val = window.localStorage.getItem('directus_auth_token');
                return val ? JSON.parse(val) : null;
            }
            return null;
        },
        set: (value: any) => {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem('directus_auth_token', JSON.stringify(value));
            }
        },
    };

    const client = createDirectus(directusBase)
        .with(rest())
        .with(authentication('json', {
            autoRefresh: true,
            storage: storage,
        }));

    return client;
};
