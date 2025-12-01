import crypto from 'crypto';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { email } = body;

    if (!email) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Email is required',
        });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    //console.log(code);
    // Send email
    await sendEmail(
        email,
        'Votre code de vérification BibOB',
        `Bonjour et bienvenue sur la BibOB. Merci pour votre inscription. Votre code de vérification est : ${code}`,
        `<p>Bonjour et bienvenue sur la BibOB. Merci pour votre inscription.</p><p>Votre code de vérification est : <strong>${code}</strong></p>`
    );
    //console.log("Email sent");

    // Create a signature to verify the code later without a DB
    // In production, use a proper secret from env
    const secret = process.env.NUXT_SECRET || 'temp-secret-key';
    const hash = crypto.createHmac('sha256', secret).update(email + code).digest('hex');

    // Return the hash to the client (they will send it back with the code)
    return { success: true, hash };
});
