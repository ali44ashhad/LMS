export const validateToken = async (req, res) => {
    try {
        // At this point, authenticateToken has already verified the JWT
        const decoded = req.userToken || {};
        const rawRoles = req.userRoles || decoded.roles || [];

        // Normalize roles: ["ROLE_USER","ROLE_ADMIN"] -> ["user","admin"]
        const roles = Array.isArray(rawRoles)
            ? rawRoles.map((r) => String(r).replace(/^ROLE_/, '').toLowerCase())
            : [];

        const primaryRole = (req.userRole || decoded.role || '').toLowerCase();

        return res.json({
            success: true,
            user: {
                id: req.userId,
                roles,
                role: primaryRole,
                name: decoded.name || '',
                email: decoded.email || '',
                avatar: '',
                bio: ''
            }
        });
    } catch (error) {
        return res.status(500).json({
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