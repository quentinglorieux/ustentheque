export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { to, subject, text, html } = body;

    return await sendEmail(to, subject, text, html);
});
