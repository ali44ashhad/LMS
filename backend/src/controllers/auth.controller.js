import User from '../models/User.model.js';

export const validateToken = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar || '',
                bio: user.bio || ''
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error validating token',
            error: error.message
        });
    }
};

export const logout = (req, res) => {
    res.clearCookie('accessToken');
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};
