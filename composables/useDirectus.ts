import { createDirectus, rest, authentication } from '@directus/sdk';
import { useDirectusBase } from './useDirectusBase';

export const useDirectus = () => {
    const directusBase = useDirectusBase();

    const client = createDirectus(directusBase)
        .with(rest())
        .with(authentication('cookie', { autoRefresh: true }));

    return client;
};
