import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function isValidEmail(value) {
    return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not configured.');
        return res.status(500).json({ error: 'Email service is not configured.' });
    }

    try {
        const { name, email, message, lang } = req.body || {};

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Missing required fields: name, email, message.' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email address.' });
        }

        const cleanName = escapeHtml(String(name).trim());
        const cleanMessage = escapeHtml(String(message).trim());
        const safeLang = lang === 'hu' ? 'hu' : 'en';

        const subject = safeLang === 'hu' ? 'Köszönöm a megkeresést!' : 'Thank you for your inquiry!';

        const emailTemplate = (greeting, bodyText, quoteText, signature, subtitle, footerText) => `
        <!DOCTYPE html>
        <html lang="${safeLang}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #4a3b32; margin: 0; padding: 40px 20px; color: #f5f0e6;">
            
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #2a211c; border-radius: 10px; border: 1px solid rgba(212, 195, 163, 0.2); overflow: hidden;">
                <tr>
                    <td style="padding: 30px; text-align: center; border-bottom: 1px solid rgba(212, 195, 163, 0.1);">
                        <h1 style="color: #d4c3a3; margin: 0; font-size: 26px; letter-spacing: 2px; text-transform: uppercase;">Kovács Dávid</h1>
                        <p style="color: #8e7865; margin: 5px 0 0 0; font-size: 14px; font-weight: bold;">${subtitle}</p>
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 40px 30px; line-height: 1.6;">
                        <h2 style="color: #d4c3a3; margin-top: 0; font-size: 20px;">${greeting} ${cleanName}!</h2>
                        <p style="color: #f5f0e6; font-size: 16px; margin-bottom: 30px;">${bodyText}</p>
                        
                        <div style="background-color: #4a3b32; border-left: 4px solid #d4c3a3; padding: 15px 20px; margin: 25px 0; border-radius: 0 5px 5px 0;">
                            <p style="margin: 0; font-style: italic; color: #d4c3a3; font-size: 13px; margin-bottom: 8px; text-transform: uppercase;">${quoteText}:</p>
                            <p style="margin: 0; color: #f5f0e6; font-size: 15px;">"${cleanMessage}"</p>
                        </div>
                        
                        <p style="color: #f5f0e6; font-size: 16px; margin-bottom: 5px; margin-top: 30px;">${signature}</p>
                        <p style="color: #d4c3a3; font-weight: bold; margin-top: 0; font-size: 16px;">Kovács Dávid</p>
                    </td>
                </tr>
                
                <tr>
                    <td style="background-color: #1a1411; padding: 20px; text-align: center;">
                        <p style="color: #8e7865; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Kovács Dávid | ${footerText}</p>
                        <p style="color: #8e7865; font-size: 12px; margin: 5px 0 0 0;"><a href="https://kkdavid.top" style="color: #d4c3a3; text-decoration: none;">www.kkdavid.top</a></p>
                    </td>
                </tr>
            </table>

        </body>
        </html>
        `;

        const html = safeLang === 'hu'
            ? emailTemplate(
                'Kedves',
                'Köszönöm a megkeresésedet! Az üzenetedet sikeresen megkaptam, és hamarosan felveszem veled a kapcsolatot az általad megadott e-mail címen.',
                'Ezt az üzenetet küldted',
                'Üdvözlettel,',
                'WEBFEJLESZTÉS & DESIGN',
                'Segítek a vállalkozásod digitális növekedésében.'
              )
            : emailTemplate(
                'Dear',
                'Thank you for reaching out! I have successfully received your message and will get back to you shortly at this email address.',
                'You sent the following message',
                'Best regards,',
                'WEB DEVELOPMENT & DESIGN',
                'Helping businesses grow online.'
              );

        const data = await resend.emails.send({
            from: 'Kovács Dávid <megkereses@kkdavid.top>',
            to: email,
            subject: subject,
            html: html
        });

        if (data?.error) {
            console.error('Resend error:', data.error);
            return res.status(502).json({ error: 'Failed to send email.' });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('send-email handler error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
