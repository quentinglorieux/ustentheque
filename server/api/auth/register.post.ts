import { createDirectus, rest, staticToken, createUser } from '@directus/sdk';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const config = useRuntimeConfig();

    if (!config.directusAdminToken) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Server configuration error: Missing Admin Token',
        });
    }

    const client = createDirectus(config.public.directusBase)
        .with(rest())
        .with(staticToken(config.directusAdminToken));

    try {
        const user = await client.request(createUser({
            ...body,
            role: '62de0e16-3453-45fc-bc57-89ca548930f8', // User Role
            status: 'active'
        }));
        return user;
    } catch (error: any) {
        console.error('Registration error:', error);
        throw createError({
            statusCode: 400,
            statusMessage: error.message || 'Registration failed',
            data: error
        });
    }
});
