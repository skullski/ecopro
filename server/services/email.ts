
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
  
  console.log('[EmailService] Checking email config:', {
    hasUser: !!user,
    userEmail: user ? `${user.substring(0, 3)}...@${user.split('@')[1] || '?'}` : 'NOT SET',
    hasPassword: !!pass,
    passwordLength: pass?.length || 0,
  });
  
  if (!user || !pass) {
    console.warn('[EmailService] GMAIL_USER or GMAIL_APP_PASSWORD not set - emails will be logged only');
    return null;
  }
  
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user,
      pass,
    },
    // Increase timeouts for slow networks (Render can be slow)
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,
    socketTimeout: 60000, // 60 seconds
    // Pool connections for better reliability
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
  });
  
  // Verify transporter connection
  transporter.verify((error, success) => {
    if (error) {
      console.error('[EmailService] SMTP connection verification failed:', error.message);
    } else {
      console.log('[EmailService] SMTP server is ready to send emails');
    }
  });
  
  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: SendEmailOptions, retries = 2): Promise<{ success: boolean; error?: string }> {
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
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      console.log(`[EmailService] Attempting to send email to: ${options.to} (attempt ${attempt}/${retries + 1})`);
      const info = await transport.sendMail({
        from: `"EcoPro Platform" <${process.env.GMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      
      console.log('[EmailService] Email sent successfully:', {
        to: options.to,
        messageId: info.messageId,
        response: info.response,
      });
      return { success: true };
    } catch (error: any) {
      console.error(`[EmailService] Failed to send email (attempt ${attempt}/${retries + 1}):`, {
        to: options.to,
        error: error.message,
        code: error.code,
        command: error.command,
        responseCode: error.responseCode,
      });
      
      // If this is a timeout error and we have retries left, reset the transporter and try again
      if (attempt <= retries && (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET' || error.message.includes('timeout'))) {
        console.log('[EmailService] Resetting transporter for retry...');
        transporter = null; // Reset to force new connection
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Wait before retry
        continue;
      }
      
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, error: 'Max retries exceeded' };
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
