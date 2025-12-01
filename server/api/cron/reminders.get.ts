import { createDirectus, rest, readItems, staticToken } from '@directus/sdk';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const directusUrl = config.public.directusBase || 'https://bibob.rubidiumweb.fr';
    const adminToken = process.env.DIRECTUS_ADMIN_TOKEN;

    if (!adminToken) {
        return { success: false, message: 'DIRECTUS_ADMIN_TOKEN not configured' };
    }

    const client = createDirectus(directusUrl).with(staticToken(adminToken)).with(rest());

    // Calculate "tomorrow" date string YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    try {
        // Fetch reservations ending tomorrow that are 'Validé'
        const reservations = await client.request(readItems('reservation', {
            filter: {
                fin: { _eq: tomorrowStr },
                statut: { _eq: 'Validé' }
            },
            fields: ['*', 'objet.nom', 'user_created.email', 'user_created.first_name']
        }));

        let count = 0;
        for (const resa of reservations) {
            if (resa.user_created?.email) {
                const subject = `Rappel : Votre emprunt pour ${resa.objet.nom} se termine demain`;
                const html = `
          <p>Bonjour ${resa.user_created.first_name},</p>
          <p>Ceci est un rappel que votre emprunt pour l'objet <strong>${resa.objet.nom}</strong> se termine demain (${tomorrowStr}).</p>
          <p>Merci de prendre vos dispositions pour le restituer.</p>
        `;

                await sendEmail(resa.user_created.email, subject, undefined, html);
                count++;
            }
        }

        return { success: true, sent: count };
    } catch (error) {
        console.error('Reminder Error:', error);
        return { success: false, error: error.message };
    }
});
