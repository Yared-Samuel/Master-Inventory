import { getRequestHandler } from '@/lib/utils/getRequestHandler';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { getModel } from '@/lib/models';

async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const token = req.cookies?.token;
        
        if (!token) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const tokenData = await getDataFromToken(token);
        
        if (!tokenData.success) {
            return res.status(401).json({ success: false, error: tokenData.error || 'Invalid authentication' });
        }

        const User = getModel('User');
        const user = await User.findById(tokenData.id)
            .select('-password')
            .populate('companyId', 'name isActive subscription');

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, error: 'Account is deactivated' });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId._id,
                companyName: user.companyId.name,
                isActive: user.isActive,
                permissions: user.permissions
            }
        });
    } catch (error) {
        console.error('Error in me route:', error);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
}

export default getRequestHandler(handler, { maxRetries: 2 }); 