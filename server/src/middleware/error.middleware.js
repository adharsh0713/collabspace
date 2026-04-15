const errorMiddleware = (err, req, res, next) => {
    // Log error for debugging
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${err.message}`, err);

    const statusCode = err.statusCode || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(isDevelopment && { stack: err.stack }),
    });
};

module.exports = errorMiddleware;