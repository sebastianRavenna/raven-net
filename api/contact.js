const nodemailer = require('nodemailer');

// Rate limiting en memoria (se resetea en cold starts)
const rateLimitMap = new Map();
const RATE_LIMIT_MS = 60_000;

function checkRateLimit(ip) {
  const now = Date.now();
  const last = rateLimitMap.get(ip);
  if (last && now - last < RATE_LIMIT_MS) return false;
  rateLimitMap.set(ip, now);
  return true;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getArgentinaDate() {
  return new Date().toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildNotificationEmail(name, email, phone, message, logoUrl) {
  const nameEsc    = escapeHtml(name);
  const emailEsc   = escapeHtml(email);
  const phoneEsc   = escapeHtml(phone);
  const messageEsc = escapeHtml(message).replace(/\n/g, '<br>');

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Nuevo mensaje de contacto</title>
  <!--[if mso]>
  <style type="text/css">
    table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  </style>
  <![endif]-->
  <style type="text/css">
    body, table, td { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; outline: none; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-content   { padding: 24px 20px !important; }
      .data-label      { display: block !important; width: 100% !important; padding-bottom: 4px !important; }
      .data-value      { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F2F2F2;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F2F2F2;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:600px;width:100%;margin:0 auto;">

          <!-- Header -->
          <tr>
            <td align="center" bgcolor="#2f333b" style="background-color:#2f333b;padding:24px 32px;">
              <img src="${logoUrl}/images/Icono_-_copia-removebg-preview.png" alt="Raven-Net" width="80" style="display:block;border:0;width:80px;height:auto;" />
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:bold;color:#ffffff;margin-top:12px;letter-spacing:1px;">Raven-Net</div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td bgcolor="#FFFFFF" class="email-content" style="background-color:#FFFFFF;padding:32px;border-left:1px solid #E5E5E5;border-right:1px solid #E5E5E5;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;color:#2D2D2D;padding-bottom:6px;">
                    Nuevo mensaje desde el sitio web
                  </td>
                </tr>
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#8C8C8C;padding-bottom:24px;">
                    Recibido el ${getArgentinaDate()} (hora Argentina)
                  </td>
                </tr>
              </table>

              <!-- Data table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #EBEBEB;">
                <tr>
                  <td class="data-label" style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8C8C8C;text-transform:uppercase;letter-spacing:0.5px;background-color:#FAFAFA;border-bottom:1px solid #F0F0F0;width:120px;vertical-align:top;">Nombre</td>
                  <td class="data-value" style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#2D2D2D;border-bottom:1px solid #F0F0F0;vertical-align:top;font-weight:bold;">${nameEsc}</td>
                </tr>
                <tr>
                  <td class="data-label" style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8C8C8C;text-transform:uppercase;letter-spacing:0.5px;background-color:#FAFAFA;border-bottom:1px solid #F0F0F0;width:120px;vertical-align:top;">Email</td>
                  <td class="data-value" style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#2D2D2D;border-bottom:1px solid #F0F0F0;vertical-align:top;">
                    <a href="mailto:${emailEsc}" style="color:#2D2D2D;text-decoration:underline;">${emailEsc}</a>
                  </td>
                </tr>
                <tr>
                  <td class="data-label" style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8C8C8C;text-transform:uppercase;letter-spacing:0.5px;background-color:#FAFAFA;border-bottom:1px solid #F0F0F0;width:120px;vertical-align:top;">Tel&eacute;fono</td>
                  <td class="data-value" style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#2D2D2D;border-bottom:1px solid #F0F0F0;vertical-align:top;">${phoneEsc}</td>
                </tr>
                <tr>
                  <td class="data-label" style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8C8C8C;text-transform:uppercase;letter-spacing:0.5px;background-color:#FAFAFA;width:120px;vertical-align:top;">Mensaje</td>
                  <td class="data-value" style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#2D2D2D;line-height:1.6;vertical-align:top;">${messageEsc}</td>
                </tr>
              </table>

              <!-- Reply hint -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-top:24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#999999;line-height:1.5;">
                    Pod&eacute;s responder directamente a este email para contactar a ${nameEsc}.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#F9F9F9" style="background-color:#F9F9F9;padding:20px 32px;border:1px solid #E5E5E5;border-top:none;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#AAAAAA;line-height:1.5;">
                    Este mensaje fue enviado desde el formulario de contacto de raven-net.com.ar
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildConfirmationEmail(name, message, logoUrl) {
  const nameEsc    = escapeHtml(name);
  const messageEsc = escapeHtml(message).replace(/\n/g, '<br>');

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Recibimos tu mensaje</title>
  <!--[if mso]>
  <style type="text/css">
    table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  </style>
  <![endif]-->
  <style type="text/css">
    body, table, td { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; outline: none; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-content   { padding: 28px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F2F2F2;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F2F2F2;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:600px;width:100%;margin:0 auto;">

          <!-- Header -->
          <tr>
            <td align="center" bgcolor="#2f333b" style="background-color:#2f333b;padding:24px 32px;">
              <img src="${logoUrl}/images/Icono_-_copia-removebg-preview.png" alt="Raven-Net" width="80" style="display:block;border:0;width:80px;height:auto;" />
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:bold;color:#ffffff;margin-top:12px;letter-spacing:1px;">Raven-Net</div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td bgcolor="#FFFFFF" class="email-content" style="background-color:#FFFFFF;padding:36px 32px;border-left:1px solid #E5E5E5;border-right:1px solid #E5E5E5;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:bold;color:#2D2D2D;padding-bottom:16px;">
                    Hola ${nameEsc},
                  </td>
                </tr>
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#555555;line-height:1.7;padding-bottom:28px;">
                    Gracias por contactarnos. Recibimos tu mensaje y nuestro equipo lo revisar&aacute; a la brevedad. Nos pondremos en contacto con vos lo antes posible.
                  </td>
                </tr>

                <!-- Message copy -->
                <tr>
                  <td style="padding-bottom:28px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8C8C8C;text-transform:uppercase;letter-spacing:1px;padding-bottom:10px;">
                          Tu mensaje
                        </td>
                      </tr>
                      <tr>
                        <td bgcolor="#F7F7F7" style="background-color:#F7F7F7;padding:20px;border-left:3px solid #e97770;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#444444;line-height:1.7;">
                          ${messageEsc}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#555555;line-height:1.7;">
                    Si quer&eacute;s agregar algo m&aacute;s, pod&eacute;s responder directamente a este correo.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#2f333b" style="background-color:#2f333b;padding:24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <img src="${logoUrl}/images/Icono_-_copia-removebg-preview.png" alt="Raven-Net" width="50" style="display:block;border:0;width:50px;height:auto;" />
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#999999;line-height:1.5;">
                    &copy; ${new Date().getFullYear()} Raven-Net. Todos los derechos reservados.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Transporter reutilizable entre invocaciones warm
const smtpPort = parseInt(process.env.SMTP_PORT || '465');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  pool: true,
  maxConnections: 2,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  const { name, email, phone, message, website } = req.body || {};

  // Honeypot
  if (website) {
    return res.status(200).json({ success: true, message: 'Mensaje enviado correctamente.' });
  }

  // Validaciones
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'El email ingresado no es válido' });
  }
  if (name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'El nombre debe tener al menos 2 caracteres' });
  }
  if (message.trim().length < 10) {
    return res.status(400).json({ success: false, message: 'El mensaje debe tener al menos 10 caracteres' });
  }

  // Rate limit por IP
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress
    || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ success: false, message: 'Por favor esperá un momento antes de enviar otro mensaje' });
  }

  const toEmail  = process.env.CONTACT_TO || 'info@raven-net.com.ar';
  const siteUrl  = (process.env.SITE_URL || 'https://raven-net.com.ar').replace(/\/$/, '');

  try {
    await Promise.all([
      transporter.sendMail({
        from:    `"Raven-Net Web" <${process.env.SMTP_USER}>`,
        to:      toEmail,
        replyTo: email,
        subject: `[Web] Nuevo mensaje de ${name}`,
        html:    buildNotificationEmail(name, email, phone, message, siteUrl),
      }),
      transporter.sendMail({
        from:    `"Raven-Net" <${process.env.SMTP_USER}>`,
        to:      email,
        replyTo: toEmail,
        subject: 'Recibimos tu mensaje \u2014 Raven-Net',
        html:    buildConfirmationEmail(name, message, siteUrl),
      }),
    ]);

    console.log(`[CONTACT] Mensaje de ${name} (${email} / ${phone})`);
    return res.status(200).json({ success: true, message: 'Mensaje enviado correctamente. Te contactaremos pronto.' });
  } catch (err) {
    console.error('Error sending email:', err);
    return res.status(500).json({ success: false, message: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.' });
  }
};
