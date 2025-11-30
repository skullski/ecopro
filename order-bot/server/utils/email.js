import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOrderNotification(client, order, buyer, status) {
  const subject = `Order #${order.order_number} - ${status.toUpperCase()}`;
  
  const statusMessages = {
    approved: `✅ Great news! Your order has been APPROVED by the buyer.`,
    declined: `❌ Order was DECLINED by the buyer.`,
    changed: `🔄 Buyer has requested CHANGES to the order.`,
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Status Update</h2>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>${statusMessages[status]}</h3>
        
        <p><strong>Order Details:</strong></p>
        <ul>
          <li>Order Number: #${order.order_number}</li>
          <li>Product: ${order.product_name}</li>
          <li>Quantity: ${order.quantity}</li>
          <li>Total: ${order.total_price} DZD</li>
        </ul>

        <p><strong>Buyer Information:</strong></p>
        <ul>
          <li>Name: ${buyer.name}</li>
          <li>Phone: ${buyer.phone}</li>
          ${buyer.address ? `<li>Address: ${buyer.address}</li>` : ''}
        </ul>

        ${order.notes ? `<p><strong>Buyer Notes:</strong> ${order.notes}</p>` : ''}
      </div>

      <p>Log in to your dashboard to manage this order:</p>
      <a href="${process.env.BASE_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 6px;">
        View Dashboard
      </a>

      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        This is an automated notification from your Order Confirmation Bot.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Order Bot" <${process.env.SMTP_USER}>`,
      to: client.email,
      subject,
      html,
    });

    console.log(`✉️ Email notification sent to ${client.email}`);
  } catch (error) {
    console.error('Failed to send email:', error.message);
  }
}

export async function sendWelcomeEmail(client) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Order Confirmation Bot! 🎉</h2>
      
      <p>Hi ${client.name},</p>
      
      <p>Your account has been successfully created. You can now start managing your orders and configuring your bot.</p>

      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Getting Started:</h3>
        <ol>
          <li>Add your products in the Products page</li>
          <li>Customize bot messages in Bot Settings</li>
          <li>Configure your WhatsApp bot</li>
          <li>Start receiving orders!</li>
        </ol>
      </div>

      <a href="${process.env.BASE_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background: #2196F3; color: white; text-decoration: none; border-radius: 6px;">
        Go to Dashboard
      </a>

      <p style="margin-top: 30px;">If you have any questions, feel free to contact our support team.</p>

      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Order Confirmation Bot - Automated Order Verification System
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Order Bot" <${process.env.SMTP_USER}>`,
      to: client.email,
      subject: 'Welcome to Order Confirmation Bot',
      html,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error.message);
  }
}

export async function sendPasswordResetEmail(client, resetToken) {
  const resetUrl = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      
      <p>Hi ${client.name},</p>
      
      <p>We received a request to reset your password. Click the button below to create a new password:</p>

      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #f44336; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Reset Password
      </a>

      <p>This link will expire in 1 hour.</p>

      <p>If you didn't request this, please ignore this email.</p>

      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Order Confirmation Bot
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Order Bot" <${process.env.SMTP_USER}>`,
      to: client.email,
      subject: 'Password Reset Request',
      html,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error.message);
  }
}
