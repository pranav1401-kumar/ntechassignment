const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({ // ← Fixed: removed "er"
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email service error:', error);
      } else {
        console.log('✅ Email service is ready');
      }
    });
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: `"Dashboard App" <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html,
        text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendOtpEmail(email, otp, type = 'registration') {
    const subject = type === 'registration' 
      ? 'Verify Your Account - Dashboard App'
      : 'Login Verification - Dashboard App';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Verification Code</h1>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>You requested a verification code for your Dashboard App account. Use the code below to ${type === 'registration' ? 'complete your registration' : 'verify your login'}:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #666;">This code expires in 5 minutes</p>
            </div>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong> If you didn't request this code, please ignore this email and consider changing your password.
            </div>

            <p>For security reasons, never share this code with anyone. Our team will never ask for this code.</p>
          </div>
          <div class="footer">
            <p>© 2025 Dashboard App. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Verification Code: ${otp}
      
      You requested a verification code for your Dashboard App account.
      This code expires in 5 minutes.
      
      If you didn't request this code, please ignore this email.
      
      © 2025 Dashboard App
    `;

    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendWelcomeEmail(email, firstName) {
    const subject = 'Welcome to Dashboard App!';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Dashboard App!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Congratulations! Your account has been successfully verified and you're now part of our community.</p>
            
            <h3>What you can do now:</h3>
            <div class="feature">
              <strong>📊 Interactive Dashboards</strong><br>
              Access powerful analytics and visualizations
            </div>
            <div class="feature">
              <strong>📈 Real-time Data</strong><br>
              Monitor your data with live updates
            </div>
            <div class="feature">
              <strong>🔒 Secure Access</strong><br>
              Role-based permissions keep your data safe
            </div>
            
            <p>Ready to get started? <a href="${process.env.FRONTEND_URL}/dashboard" style="color: #667eea;">Visit your dashboard</a></p>
          </div>
          <div class="footer">
            <p>© 2025 Dashboard App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  async sendPasswordResetEmail(email, resetToken, firstName) {
    const subject = 'Password Reset - Dashboard App';
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>You requested a password reset for your Dashboard App account. Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link in your browser:<br>
            <a href="${resetUrl}">${resetUrl}</a></p>

            <div class="warning">
              <strong>⚠️ Important:</strong> This link expires in 1 hour. If you didn't request this reset, please ignore this email.
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Dashboard App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }
}

module.exports = new EmailService();