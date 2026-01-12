
// Email Service - Send verification codes via Resend API (primary) or Gmail SMTP (fallback)
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Resend client (uses HTTPS API - works even when SMTP is blocked)
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendClient) return resendClient;
  
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.log('[EmailService] RESEND_API_KEY not set - will try Gmail SMTP');
    return null;
  }
  
  console.log('[EmailService] Using Resend API for emails');
  resendClient = new Resend(apiKey);
  return resendClient;
}

// Gmail SMTP transporter (fallback)
// Requires: GMAIL_USER and GMAIL_APP_PASSWORD environment variables
// To get app password: Google Account → Security → 2-Step Verification → App passwords
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  
  console.log('[EmailService] Checking Gmail SMTP config:', {
    hasUser: !!user,
    userEmail: user ? `${user.substring(0, 3)}...@${user.split('@')[1] || '?'}` : 'NOT SET',
    hasPassword: !!pass,
    passwordLength: pass?.length || 0,
  });
  
  if (!user || !pass) {
    console.warn('[EmailService] GMAIL_USER or GMAIL_APP_PASSWORD not set');
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
  
  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Send email using Resend API (HTTPS - bypasses SMTP blocks)
async function sendViaResend(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) return { success: false, error: 'Resend not configured' };
  
  try {
    console.log('[EmailService] Sending via Resend API to:', options.to);
    const { data, error } = await resend.emails.send({
      // Use Resend's test domain until you verify your own domain
      from: 'EcoPro <onboarding@resend.dev>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    
    if (error) {
      console.error('[EmailService] Resend API error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('[EmailService] Resend email sent successfully:', { to: options.to, id: data?.id });
    return { success: true };
  } catch (err: any) {
    console.error('[EmailService] Resend exception:', err.message);
    return { success: false, error: err.message };
  }
}

// Send email using Gmail SMTP (fallback)
async function sendViaSmtp(options: SendEmailOptions, retries = 2): Promise<{ success: boolean; error?: string }> {
  const transport = getTransporter();
  
  if (!transport) {
    return { success: false, error: 'Gmail SMTP not configured' };
  }
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      console.log(`[EmailService] Sending via Gmail SMTP to: ${options.to} (attempt ${attempt}/${retries + 1})`);
      const info = await transport.sendMail({
        from: `"EcoPro Platform" <${process.env.GMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      
      console.log('[EmailService] Gmail SMTP sent successfully:', {
        to: options.to,
        messageId: info.messageId,
      });
      return { success: true };
    } catch (error: any) {
      console.error(`[EmailService] Gmail SMTP failed (attempt ${attempt}/${retries + 1}):`, error.message);
      
      // If timeout error and retries left, reset and retry
      if (attempt <= retries && (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET' || error.message.includes('timeout'))) {
        transporter = null;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, error: 'Max retries exceeded' };
}

// Main send function - tries Resend API first, falls back to Gmail SMTP
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // In development without email config, just log
  if (!isProduction && !process.env.RESEND_API_KEY && !process.env.GMAIL_USER) {
    console.log('[EmailService] DEV MODE - Would send email:', {
      to: options.to,
      subject: options.subject,
      text: options.text?.substring(0, 100),
    });
    return { success: true };
  }
  
  // Try Resend API first (uses HTTPS, bypasses SMTP blocks)
  if (process.env.RESEND_API_KEY) {
    const resendResult = await sendViaResend(options);
    if (resendResult.success) return resendResult;
    console.log('[EmailService] Resend failed, trying Gmail SMTP fallback...');
  }
  
  // Fall back to Gmail SMTP
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return await sendViaSmtp(options);
  }
  
  return { success: false, error: 'No email service configured' };
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
// Trigger redeploy Mon 12 Jan 2026 05:52:17 PM CET
