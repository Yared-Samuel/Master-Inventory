import connect from '../db';
import { isConnected } from '../db';

/**
 * Middleware that ensures database connection before handling API requests
 */
export async function dbMiddleware(handler) {
    return async (req, res) => {
        try {
            // For GET requests, check if we already have a connection
            if (req.method === 'GET' && isConnected()) {
                return handler(req, res);
            }

            // Connect to MongoDB
            await connect();
            
            // Call the API handler
            return handler(req, res);
        } catch (error) {
            console.error('Database middleware error:', error);
            
            // If it's a GET request and we got a connection error, try one more time
            if (req.method === 'GET' && error.name === 'MongoNetworkError') {
                try {
                    console.log('Retrying connection for GET request...');
                    await connect();
                    return handler(req, res);
                } catch (retryError) {
                    console.error('Retry failed:', retryError);
                }
            }

            return res.status(500).json({ 
                success: false, 
                error: 'Database connection error',
                message: error.message 
            });
        }
    };
} 