const nodemailer = require('nodemailer');

// Rate limiting en memoria (se resetea en cold starts, suficiente para este uso)
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const last = rateLimitMap.get(ip);
  if (last && now - last < 60000) return false;
  rateLimitMap.set(ip, now);
  return true;
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  const { name, email, phone, message, website } = req.body || {};

  // Honeypot — si está lleno es un bot
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

  // Configurar transporte SMTP
  // tls.rejectUnauthorized: false necesario porque Don Web (Ferozo) usa cert *.ferozo.com
  // pero el hostname del cliente es mail.raven-net.com.ar — no coincide el altname
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const toEmail = process.env.CONTACT_TO || 'info@raven-net.com.ar';
  const siteUrl = process.env.SITE_URL || 'https://raven-net.com.ar';
  const now = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });

  const adminMail = {
    from: `"Raven-Net Web" <${process.env.SMTP_USER}>`,
    to: toEmail,
    replyTo: email,
    subject: 'Nuevo mensaje desde raven-net.com.ar',
    text: [
      'Nuevo mensaje de contacto:',
      '',
      `Nombre:    ${name}`,
      `Email:     ${email}`,
      `Teléfono:  ${phone}`,
      `Fecha:     ${now}`,
      '',
      'Mensaje:',
      message,
      '',
      '---',
      `Enviado desde ${siteUrl}`,
    ].join('\n'),
  };

  const confirmMail = {
    from: `"Raven-Net" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Recibimos tu mensaje - Raven-Net',
    text: [
      `Hola ${name},`,
      '',
      'Recibimos tu mensaje y te contactaremos a la brevedad.',
      '',
      'Esto es lo que nos enviaste:',
      '',
      `"${message}"`,
      '',
      'Saludos,',
      'El equipo de Raven-Net',
      siteUrl,
    ].join('\n'),
  };

  try {
    await Promise.all([
      transporter.sendMail(adminMail),
      transporter.sendMail(confirmMail),
    ]);
    return res.status(200).json({ success: true, message: 'Mensaje enviado correctamente. Te contactaremos pronto.' });
  } catch (err) {
    console.error('Error sending email:', err);
    return res.status(500).json({ success: false, message: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.' });
  }
};
