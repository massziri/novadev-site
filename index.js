/**
 * ══════════════════════════════════════════════════════════════════════
 *  Netlify Serverless Function: send-email
 *  Nova Dev Contact Form Handler
 * ══════════════════════════════════════════════════════════════════════
 *  Robust SMTP configuration with port fallback (465 SSL → 587 STARTTLS)
 *  Handles AWS Lambda SMTP restrictions on Netlify
 * ══════════════════════════════════════════════════════════════════════
 */

const nodemailer = require('nodemailer');

// ── Environment Configuration ────────────────────────────────────────
const SMTP_HOST = process.env.SMTP_HOST || 'mail.novatvhub.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER || 'admin@novatvhub.com';
const SMTP_PASS = process.env.SMTP_PASS || '';
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'admin@novatvhub.com';

// ── CORS Headers ─────────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

// ── Create Transporter with Fallback Strategy ───────────────────────
async function createTransporter(preferredPort = 465) {
  const ports = [465, 587]; // Try SSL first, then STARTTLS
  
  for (const port of ports.filter(p => p === preferredPort).concat(ports.filter(p => p !== preferredPort))) {
    const config = {
      host: SMTP_HOST,
      port: port,
      secure: port === 465, // true for 465 (SSL), false for 587 (STARTTLS)
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certs
        minVersion: 'TLSv1.2',
      },
      connectionTimeout: 8000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
      logger: false,
      debug: false,
    };

    try {
      const transporter = nodemailer.createTransport(config);
      await transporter.verify(); // Test connection
      console.log(`✅ SMTP connection verified on port ${port}`);
      return transporter;
    } catch (err) {
      console.warn(`⚠️  Port ${port} failed: ${err.message}`);
      if (port === ports[ports.length - 1]) {
        throw new Error(`All SMTP ports failed. Last error: ${err.message}`);
      }
    }
  }
}

// ── Generate HTML Email Templates ────────────────────────────────────
function generateAdminEmail(data) {
  const { fname, lname, email, company, website, phone, service, message } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Website Audit Request</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);padding:30px;border-radius:8px 8px 0 0;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">🚀 New Audit Request</h1>
              <p style="margin:10px 0 0;color:#e0e0e0;font-size:14px;">Nova Dev | Website Audit System</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding:40px 30px;">
              
              <div style="background-color:#f8f9fa;border-left:4px solid #667eea;padding:20px;margin-bottom:30px;border-radius:4px;">
                <p style="margin:0;color:#333;font-size:16px;font-weight:600;">📋 Contact Information</p>
              </div>
              
              <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e9ecef;color:#6c757d;font-size:14px;font-weight:600;width:140px;">👤 Name</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e9ecef;color:#212529;font-size:14px;">${fname} ${lname}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e9ecef;color:#6c757d;font-size:14px;font-weight:600;">📧 Email</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e9ecef;">
                    <a href="mailto:${email}" style="color:#667eea;text-decoration:none;font-size:14px;">${email}</a>
                  </td>
                </tr>
                ${company ? `
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e9ecef;color:#6c757d;font-size:14px;font-weight:600;">🏢 Company</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e9ecef;color:#212529;font-size:14px;">${company}</td>
                </tr>
                ` : ''}
                ${website ? `
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e9ecef;color:#6c757d;font-size:14px;font-weight:600;">🌐 Website</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e9ecef;">
                    <a href="${website.startsWith('http') ? website : 'https://' + website}" target="_blank" style="color:#667eea;text-decoration:none;font-size:14px;">${website}</a>
                  </td>
                </tr>
                ` : ''}
                ${phone ? `
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e9ecef;color:#6c757d;font-size:14px;font-weight:600;">📱 Phone</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e9ecef;color:#212529;font-size:14px;">${phone}</td>
                </tr>
                ` : ''}
                ${service ? `
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e9ecef;color:#6c757d;font-size:14px;font-weight:600;">🎯 Service</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e9ecef;color:#212529;font-size:14px;">${service.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                </tr>
                ` : ''}
              </table>
              
              ${message ? `
              <div style="background-color:#f8f9fa;border-left:4px solid #667eea;padding:20px;margin-top:30px;border-radius:4px;">
                <p style="margin:0 0 10px;color:#333;font-size:16px;font-weight:600;">💬 Message</p>
                <p style="margin:0;color:#495057;font-size:14px;line-height:1.6;">${message.replace(/\n/g, '<br>')}</p>
              </div>
              ` : ''}
              
              <div style="margin-top:30px;padding:20px;background-color:#f8f9fa;border-radius:4px;text-align:center;">
                <p style="margin:0 0 15px;color:#6c757d;font-size:13px;">⏰ <strong>Action Required:</strong> Respond within 24 hours</p>
                <a href="mailto:${email}?subject=Re:%20Your%20Free%20Website%20Audit%20Request" 
                   style="display:inline-block;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:#ffffff;padding:12px 30px;border-radius:5px;text-decoration:none;font-weight:600;font-size:14px;">
                  📨 Reply to Client
                </a>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f9fa;padding:20px 30px;border-radius:0 0 8px 8px;text-align:center;border-top:1px solid #e9ecef;">
              <p style="margin:0;color:#6c757d;font-size:12px;">
                <strong>Nova Dev</strong> | WordPress & Next.js Development<br>
                Automated notification from novadev-official.netlify.app
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateClientEmail(fname) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Website Audit Request</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);padding:40px 30px;border-radius:8px 8px 0 0;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:700;">✅ We Received Your Request!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding:40px 30px;">
              
              <p style="margin:0 0 20px;color:#212529;font-size:18px;font-weight:600;">Hi ${fname},</p>
              
              <p style="margin:0 0 20px;color:#495057;font-size:15px;line-height:1.7;">
                Thank you for requesting a <strong>free website audit</strong> from Nova Dev! 🎉
              </p>
              
              <p style="margin:0 0 20px;color:#495057;font-size:15px;line-height:1.7;">
                Our team is already analyzing your website. Here's what happens next:
              </p>
              
              <div style="background-color:#f8f9fa;border-left:4px solid #667eea;padding:20px;margin:25px 0;border-radius:4px;">
                <ul style="margin:0;padding:0 0 0 20px;color:#495057;font-size:15px;line-height:1.8;">
                  <li style="margin-bottom:10px;"><strong>Within 24 hours:</strong> You'll receive a comprehensive PDF report</li>
                  <li style="margin-bottom:10px;"><strong>Our analysis covers:</strong> Speed, SEO, mobile responsiveness, security, and conversion issues</li>
                  <li style="margin-bottom:10px;"><strong>No obligation:</strong> Use our insights however you wish — no strings attached</li>
                </ul>
              </div>
              
              <p style="margin:0 0 20px;color:#495057;font-size:15px;line-height:1.7;">
                If you have any urgent questions in the meantime, feel free to reply to this email or call us directly.
              </p>
              
              <div style="margin:30px 0;padding:25px;background-color:#f0f7ff;border-radius:6px;border:1px solid #b8d4ff;">
                <p style="margin:0 0 15px;color:#004085;font-size:16px;font-weight:600;">📞 Need immediate help?</p>
                <p style="margin:0;color:#004085;font-size:14px;line-height:1.6;">
                  <strong>Email:</strong> <a href="mailto:admin@novatvhub.com" style="color:#667eea;text-decoration:none;">admin@novatvhub.com</a><br>
                  <strong>Phone:</strong> +212 665 103 031
                </p>
              </div>
              
              <p style="margin:0;color:#495057;font-size:15px;line-height:1.7;">
                Looking forward to helping you grow your online presence! 🚀
              </p>
              
              <p style="margin:30px 0 0;color:#495057;font-size:15px;">
                <strong>Best regards,</strong><br>
                The Nova Dev Team
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f9fa;padding:20px 30px;border-radius:0 0 8px 8px;text-align:center;border-top:1px solid #e9ecef;">
              <p style="margin:0 0 10px;color:#212529;font-size:14px;font-weight:600;">Nova Dev</p>
              <p style="margin:0;color:#6c757d;font-size:12px;line-height:1.6;">
                WordPress & Next.js Development | Digital Marketing<br>
                Specializing in Moving Company Websites<br>
                <a href="https://novadev-official.netlify.app" style="color:#667eea;text-decoration:none;">novadev-official.netlify.app</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ── Main Lambda Handler ──────────────────────────────────────────────
exports.handler = async (event, context) => {
  
  // ── Handle OPTIONS preflight ───────────────────────────────────────
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  // ── Only allow POST ────────────────────────────────────────────────
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' }),
    };
  }

  try {
    // ── Parse request body ───────────────────────────────────────────
    const data = JSON.parse(event.body);
    const { fname, lname, email, company, website, phone, service, message } = data;

    // ── Validate required fields ─────────────────────────────────────
    if (!fname || !email || !message) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: First name, email, and message are required.' 
        }),
      };
    }

    // ── Basic email validation ───────────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: false, error: 'Invalid email address.' }),
      };
    }

    console.log(`📧 Processing audit request from: ${email}`);

    // ── Create SMTP transporter with fallback ────────────────────────
    let transporter;
    try {
      transporter = await createTransporter(SMTP_PORT);
    } catch (err) {
      console.error('❌ SMTP connection failed:', err.message);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ 
          success: false, 
          error: 'Email service temporarily unavailable. Please try again later or contact us directly at admin@novatvhub.com',
          detail: err.message 
        }),
      };
    }

    // ── Send email to admin ──────────────────────────────────────────
    const adminMailOptions = {
      from: `"Nova Dev Contact Form" <${SMTP_USER}>`,
      to: RECIPIENT_EMAIL,
      replyTo: email,
      subject: `🚀 New Audit Request: ${company || fname + ' ' + lname}`,
      html: generateAdminEmail(data),
    };

    // ── Send confirmation email to client ────────────────────────────
    const clientMailOptions = {
      from: `"Nova Dev Team" <${SMTP_USER}>`,
      to: email,
      subject: '✅ Your Website Audit Request Has Been Received!',
      html: generateClientEmail(fname),
    };

    // ── Send both emails ─────────────────────────────────────────────
    try {
      await transporter.sendMail(adminMailOptions);
      console.log(`✅ Admin notification sent to ${RECIPIENT_EMAIL}`);
      
      await transporter.sendMail(clientMailOptions);
      console.log(`✅ Confirmation email sent to ${email}`);
    } catch (err) {
      console.error('❌ Email send failed:', err);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ 
          success: false, 
          error: 'Failed to send email. Please try again or contact us directly.',
          detail: err.message 
        }),
      };
    }

    // ── Success response ─────────────────────────────────────────────
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ 
        success: true, 
        message: 'Thank you! Your audit request has been received. Check your email for confirmation.' 
      }),
    };

  } catch (error) {
    console.error('❌ Function error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred. Please try again later.',
        detail: error.message 
      }),
    };
  }
};
