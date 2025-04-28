import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    throw new Error(
        'Please define the MONGO_URI environment variable inside .env'
    );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
        isConnected: false
    };
}

async function connect() {
    // If we have a cached connection and it's connected, return it
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    // If we have a cached connection but it's not connected, clear it
    if (cached.conn && mongoose.connection.readyState !== 1) {
        cached.conn = null;
        cached.promise = null;
        cached.isConnected = false;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4,
            retryWrites: true,
            retryReads: true,
            connectTimeoutMS: 30000,
            heartbeatFrequencyMS: 10000,
            useNewUrlParser: true,
            useUnifiedTopology: true
        };

        cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
            console.log('MongoDB connected successfully');
            cached.isConnected = true;
            return mongoose;
        }).catch((err) => {
            console.error('MongoDB connection error:', err);
            cached.promise = null;
            cached.isConnected = false;
            throw err;
        });
    }
    
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        cached.isConnected = false;
        throw e;
    }

    return cached.conn;
}

// Check connection status
function isConnected() {
    return cached.isConnected && mongoose.connection.readyState === 1;
}

export default connect;
export { isConnected };
