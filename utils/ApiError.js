class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error'; // ✅ شرط أكثر وضوحًا
    this.isOperational = true;

    // ✅ التقاط مكان حدوث الخطأ
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
