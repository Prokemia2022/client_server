class ValidationError extends Error {
    constructor(message, field = null, code = 'VALIDATION_ERROR') {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.code = code;
        this.statusCode = 400;
        
        // Maintains proper stack trace
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            error: true,
            code: this.code,
            message: this.message,
            field: this.field
        };
    }
}
module.exports = { ValidationError };
