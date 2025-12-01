export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { borrowerEmail, itemName, ownerName, ownerPhone, ownerLocation } = body;

    if (!borrowerEmail) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Borrower email is required',
        });
    }

    const subject = `Votre demande pour ${itemName} a été acceptée !`;
    const html = `
    <p>Bonne nouvelle !</p>
    <p><strong>${ownerName}</strong> a accepté votre demande de prêt pour l'objet <strong>${itemName}</strong>.</p>
    <p>Vous pouvez prendre contact pour organiser la récupération de l'objet :</p>
    <ul>
        <li><strong>Téléphone :</strong> ${ownerPhone}</li>
        <li><strong>Adresse :</strong> ${ownerLocation}</li>
    </ul>
    <p>Rendez-vous sur votre espace BibOB pour plus de détails.</p>
  `;

    return await sendEmail(borrowerEmail, subject, undefined, html);
});
