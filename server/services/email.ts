
// Email Service - Send verification codes via Gmail SMTP
import nodemailer from 'nodemailer';

// Gmail SMTP transporter
// Requires: GMAIL_USER and GMAIL_APP_PASSWORD environment variables
// To get app password: Google Account → Security → 2-Step Verification → App passwords
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  
  if (!user || !pass) {
    console.warn('[EmailService] GMAIL_USER or GMAIL_APP_PASSWORD not set - emails will be logged only');
    return null;
  }
  
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
  
  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const transport = getTransporter();
  
  if (!transport) {
    // Log email in development when no Gmail configured
    console.log('[EmailService] Would send email:', {
      to: options.to,
      subject: options.subject,
      text: options.text?.substring(0, 100),
    });
    return { success: true }; // Pretend success in dev mode
  }
  
  try {
    await transport.sendMail({
      from: `"EcoPro Platform" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    
    console.log('[EmailService] Email sent to:', options.to);
    return { success: true };
  } catch (error: any) {
    console.error('[EmailService] Failed to send email:', error.message);
    return { success: false, error: error.message };
  }
}

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification code email
export async function sendVerificationCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  const subject = 'EcoPro - Email Verification Code';
  
  const text = `Your EcoPro verification code is: ${code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 500px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; color: #f97316; }
    .code-box { 
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      text-align: center;
      padding: 20px;
      border-radius: 12px;
      margin: 20px 0;
    }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🛒 EcoPro</div>
      <p>Email Verification</p>
    </div>
    
    <p>Hello,</p>
    <p>Your verification code is:</p>
    
    <div class="code-box">${code}</div>
    
    <p>Enter this code to complete your registration. This code will expire in <strong>10 minutes</strong>.</p>
    
    <p>If you didn't request this code, please ignore this email.</p>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} EcoPro Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({ to: email, subject, text, html });
}
