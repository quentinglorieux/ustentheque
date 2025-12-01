import { createDirectus, rest, staticToken } from '@directus/sdk';
import { useDirectusBase } from './useDirectusBase';

export const usePublicDirectus = () => {
    const directusBase = useDirectusBase();
    const token = process.env.NUXT_PUBLIC_DIRECTUS_TOKEN;
    const client = createDirectus(directusBase)
        .with(rest())
        .with(staticToken(token));

    return client;
};
