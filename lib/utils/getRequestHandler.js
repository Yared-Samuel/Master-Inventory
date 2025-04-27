import { isConnected } from '../db';
import connect from '../db';

/**
 * Handles GET requests with improved connection management
 * @param {Function} handler - The request handler function
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireConnection - Whether to require a fresh connection
 * @param {number} options.maxRetries - Maximum number of retry attempts
 */
export async function getRequestHandler(handler, options = {}) {
    const { requireConnection = false, maxRetries = 1 } = options;
    
    return async (req, res) => {
        let retryCount = 0;
        
        while (retryCount <= maxRetries) {
            try {
                // If we don't require a fresh connection and we're already connected, use existing connection
                if (!requireConnection && isConnected()) {
                    return await handler(req, res);
                }
                
                // Otherwise, establish a new connection
                await connect();
                return await handler(req, res);
            } catch (error) {
                console.error(`GET request error (attempt ${retryCount + 1}):`, error);
                
                // If we've reached max retries, return error
                if (retryCount >= maxRetries) {
                    return res.status(500).json({
                        success: false,
                        error: 'Server error',
                        message: error.message
                    });
                }
                
                // If it's a network error, retry
                if (error.name === 'MongoNetworkError') {
                    retryCount++;
                    continue;
                }
                
                // For other errors, return immediately
                return res.status(500).json({
                    success: false,
                    error: 'Server error',
                    message: error.message
                });
            }
        }
    };
} 