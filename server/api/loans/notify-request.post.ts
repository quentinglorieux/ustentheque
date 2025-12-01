export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { ownerEmail, borrowerName, borrowerPhone, itemName, startDate, endDate } = body;

    if (!ownerEmail) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Owner email is required',
        });
    }

    const subject = `Nouvelle demande de prêt pour : ${itemName}`;
    const html = `
    <p>Bonjour,</p>
    <p><strong>${borrowerName}</strong> souhaite emprunter votre objet <strong>${itemName}</strong>.</p>
    <p><strong>Téléphone :</strong> ${borrowerPhone}</p>
    <p>Dates : du ${startDate} au ${endDate}.</p>
    <p>Rendez-vous sur votre espace BibOB pour accepter ou refuser la demande.</p>
    <p><a href="https://bibob.rubidiumweb.fr/mesprets">Voir mes demandes</a></p>
  `;

    return await sendEmail(ownerEmail, subject, undefined, html);
});
