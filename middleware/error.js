const errorHandler = (err, req, res, next) => {
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  
    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(error => ({
        field: error.path,
        message: error.message
      }));
  
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
  
    // Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Resource already exists',
        field: err.errors[0]?.path
      });
    }
  
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
  
    // Default error
    const status = err.statusCode || err.status || 500;
    const message = err.message || 'Internal server error';
  
    res.status(status).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };
  
  module.exports = {
    errorHandler,
  };