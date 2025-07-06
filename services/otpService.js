const { models } = require('../config/database');

class OtpService {
  async sendOtp(email, type = 'registration') {
    try {
      // Use the withOtp scope to include otp fields
      const user = await models.User.scope('withOtp').findOne({ where: { email } });
      
      if (!user) {
        throw new Error('User not found');
      }

      // Use the User model's generateOtp method (which uses bcrypt)
      const plainOtp = user.generateOtp();
      
      // Save the hashed OTP and expiry to database
      await user.save();

      // Send email with the plain OTP
      const emailService = require('./emailService');
      await emailService.sendOtpEmail(email, plainOtp, type);

      return {
        success: true,
        message: 'OTP sent successfully',
        expiresAt: user.otpExpiry
      };
    } catch (error) {
      console.error('OTP service error:', error);
      throw new Error('Failed to send OTP');
    }
  }

  async verifyOtp(email, candidateOtp) {
    try {
      // Use the withOtp scope to include otp fields
      const user = await models.User.scope('withOtp').findOne({ where: { email } });
      
      if (!user) {
        return { success: false, message: 'Invalid or expired OTP' };
      }

      // Use the User model's verifyOtp method (which uses bcrypt)
      const isValid = user.verifyOtp(candidateOtp);
      
      if (!isValid) {
        return { success: false, message: 'Invalid or expired OTP' };
      }

      // Clear OTP after successful verification using User model method
      user.clearOtp();
      await user.save();

      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('OTP verification error:', error);
      throw new Error('Failed to verify OTP');
    }
  }

  async resendOtp(email, type = 'login') {
    const RESEND_COOLDOWN = 60000; // 1 minute

    try {
      const user = await models.User.scope('withOtp').findOne({ where: { email } });
      
      if (!user) {
        throw new Error('User not found');
      }

      // Check if there's a recent OTP
      if (user.otpExpiry && (user.otpExpiry.getTime() - Date.now()) > (parseInt(process.env.OTP_EXPIRY_MINUTES || 5) * 60000 - RESEND_COOLDOWN)) {
        throw new Error('Please wait before requesting a new OTP');
      }

      return this.sendOtp(email, type);
    } catch (error) {
      console.error('OTP resend error:', error);
      throw error;
    }
  }
}

module.exports = new OtpService();