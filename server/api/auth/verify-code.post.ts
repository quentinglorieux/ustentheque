import crypto from 'crypto';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { email, code, hash } = body;

    if (!email || !code || !hash) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields',
        });
    }

    const secret = process.env.NUXT_SECRET || 'temp-secret-key';
    const computedHash = crypto.createHmac('sha256', secret).update(email + code).digest('hex');

    if (computedHash !== hash) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid code',
        });
    }

    return { success: true };
});
