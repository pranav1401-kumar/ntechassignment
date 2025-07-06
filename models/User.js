const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for OAuth users
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'first_name', // Map to snake_case database column
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'last_name',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_verified',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'otp_expiry',
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login',
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'login_attempts',
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'lock_until',
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'refresh_token',
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'password_reset_token',
    },
    passwordResetExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'password_reset_expiry',
    },
    // OAuth provider IDs
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'google_id',
    },
    githubId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'github_id',
    },
    microsoftId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'microsoft_id',
    },
    appleId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'apple_id',
    },
    // Profile information
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'phone_number',
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'date_of_birth',
    },
  }, {
    tableName: 'users',
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && user.password) {
          user.password = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
        }
      },
    },
    defaultScope: {
      attributes: { exclude: ['password', 'otp', 'refreshToken', 'passwordResetToken'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      },
      withOtp: {
        attributes: { include: ['otp', 'otpExpiry'] },
      },
    },
  });

  // Instance methods
  User.prototype.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.generateOtp = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otp = bcrypt.hashSync(otp, 10);
    this.otpExpiry = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES || 5) * 60000);
    return otp;
  };

  User.prototype.verifyOtp = function(candidateOtp) {
    if (!this.otp || !this.otpExpiry) return false;
    if (new Date() > this.otpExpiry) return false;
    return bcrypt.compareSync(candidateOtp, this.otp);
  };

  User.prototype.clearOtp = function() {
    this.otp = null;
    this.otpExpiry = null;
  };

  User.prototype.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
  };

  User.prototype.incrementLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
      return this.update({
        loginAttempts: 1,
        lockUntil: null,
      });
    }

    const updates = { loginAttempts: this.loginAttempts + 1 };

    // Lock account after 5 failed attempts for 2 hours
    if (updates.loginAttempts >= 5 && !this.isLocked()) {
      updates.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
    }

    return this.update(updates);
  };

  User.prototype.resetLoginAttempts = function() {
    return this.update({
      loginAttempts: 0,
      lockUntil: null,
    });
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.otp;
    delete values.refreshToken;
    delete values.passwordResetToken;
    return values;
  };

  // Class methods
  User.findByEmail = function(email) {
    return this.scope('withPassword').findOne({ where: { email } });
  };

  // Associations
  User.associate = (models) => {
    User.belongsTo(models.Role, {
      foreignKey: 'roleId',
      as: 'role',
    });
    User.hasMany(models.LoginLog, {
      foreignKey: 'userId',
      as: 'loginLogs',
    });
  };

  return User;
};