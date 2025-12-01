import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, text?: string, html?: string) => {
    const config = useRuntimeConfig();

    if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
        throw createError({
            statusCode: 500,
            statusMessage: 'SMTP configuration is missing',
        });
    }

    console.log(`[Mailer] Initializing transporter with host: ${config.smtpHost}, port: ${config.smtpPort}, user: ${config.smtpUser}`);

    const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: Number(config.smtpPort) || 587,
        secure: Number(config.smtpPort) === 465, // true for 465, false for other ports
        auth: {
            user: config.smtpUser,
            pass: config.smtpPass,
        },
    });

    const mailOptions = {
        from: config.smtpFrom || `"BibOB" <${config.smtpUser}>`,
        to,
        subject,
        text,
        html,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error: any) {
        console.error('Nodemailer Error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to send email',
        });
    }
};
