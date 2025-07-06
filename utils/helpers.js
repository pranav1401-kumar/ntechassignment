const crypto = require('crypto');

class Helpers {
  // Generate random string
  static generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Hash string using SHA256
  static hashString(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  // Format user for response (remove sensitive data)
  static formatUser(user) {
    const userObj = user.toJSON ? user.toJSON() : user;
    delete userObj.password;
    delete userObj.otp;
    delete userObj.refreshToken;
    delete userObj.passwordResetToken;
    delete userObj.passwordResetExpiry;
    return userObj;
  }

  // Paginate results
  static paginate(page, limit, total) {
    const currentPage = parseInt(page) || 1;
    const itemsPerPage = parseInt(limit) || 10;
    const totalPages = Math.ceil(total / itemsPerPage);
    const offset = (currentPage - 1) * itemsPerPage;

    return {
      currentPage,
      totalPages,
      totalItems: total,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      offset
    };
  }

  // Validate email format
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  static isStrongPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  // Generate OTP
  static generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  // Format response
  static formatResponse(success, message, data = null, error = null) {
    const response = { success, message };
    if (data !== null) response.data = data;
    if (error !== null && process.env.NODE_ENV === 'development') response.error = error;
    return response;
  }

  // Get client IP address
  static getClientIP(req) {
    return req.headers['x-forwarded-for'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.ip;
  }

  // Format duration in minutes to human readable
  static formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  }

  // Sanitize search query
//   static sanitizeSearchQuery(query) {
//     if (!query || typeof query !== 'string') return '';
    
//     // Remove special characters that might interfere with SQL
//     return query.replace(/[%_\\]/g, '\\        data: {
//           series: [{name: 'Successful Lo').trim();
//   }

  // Generate avatar URL based on initials
  static generateAvatarUrl(firstName, lastName) {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=667eea&color=fff&size=128`;
  }
}

module.exports = Helpers;