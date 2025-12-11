/**
 * API Logging Middleware
 * Automatically logs all requests and responses
 */

const { logRequest, logResponse, logError } = require('./logger');

// Middleware to log all API requests and responses
const apiLogger = (handler) => {
  return async (req, res) => {
    // Add start time to request
    req.startTime = Date.now();

    // Log incoming request
    try {
      logRequest(req, req.url);
    } catch (error) {
      console.error('Failed to log request:', error.message);
    }

    // Override res.json and res.send to capture response
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    const originalStatus = res.status.bind(res);

    let statusCode = 200;
    let responseData = null;

    // Capture status code
    res.status = (code) => {
      statusCode = code;
      return originalStatus(code);
    };

    // Capture JSON response
    res.json = (data) => {
      responseData = data;
      try {
        logResponse(req, res, data, statusCode);
      } catch (error) {
        console.error('Failed to log response:', error.message);
      }
      return originalJson(data);
    };

    // Capture text response
    res.send = (data) => {
      responseData = data;
      try {
        logResponse(req, res, data, statusCode);
      } catch (error) {
        console.error('Failed to log response:', error.message);
      }
      return originalSend(data);
    };

    // Execute the handler and catch errors
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Handler Error:', error);
      
      // Log the error
      try {
        logError(req, error, 'API Handler');
      } catch (logErr) {
        console.error('Failed to log error:', logErr.message);
      }

      // Send error response if not already sent
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: error.message || 'Internal server error'
        });
      }
    }
  };
};

module.exports = apiLogger;
