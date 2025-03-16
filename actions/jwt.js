import jwt from 'jsonwebtoken';

export function generateToken(userId, companyId, role) {
    return jwt.sign(
        {
            id: userId,
            companyId,
            role
        }, 
        process.env.JWT_SECRET, 
        {
            expiresIn: '1d'
        }
    );
}

export function verifyToken(token) {
    try {
        return {
            valid: true,
            decoded: jwt.verify(token, process.env.JWT_SECRET)
        };
    } catch (error) {
        return {
            valid: false,
            error: error.message
        };
    }
}

