import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('CRITICAL ERROR: JWT_SECRET not defined');
    process.exit(1);
}

// Main authentication middleware
export const authenticateToken = (req, res, next) => {
    // Get token from cookie, header, or query
    const token =
        req.cookies?.accessToken ||
        req.headers?.authorization?.replace('Bearer ', '') ||
        req.query?.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user info to request
        req.userId = decoded.id;
        req.userRoles = decoded.roles || [];
        req.userRole = decoded.role; // student/parent/teacher

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired, please login again'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Check if user is instructor (teacher role)
export const requireInstructor = (req, res, next) => {
    if (!req.userRoles.includes('ROLE_TEACHER' || 'ROLE_ADMIN')) {
        return res.status(403).json({
            success: false,
            message: 'Admin/Instructor access required. Only admins/teachers can perform this action.'
        });
    }
    next();
};

// Check if user is admin
export const requireAdmin = (req, res, next) => {
    if (!req.userRoles.includes('ROLE_ADMIN')) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

// Check if user is student
export const requireStudent = (req, res, next) => {
    if (!req.userRoles.includes('ROLE_STUDENT')) {
        return res.status(403).json({
            success: false,
            message: 'Student access required'
        });
    }
    next();
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.headers?.authorization?.replace('Bearer ', '') ||
        req.query?.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.userId = decoded.id;
            req.userRoles = decoded.roles || [];
            req.userRole = decoded.role;
        } catch (error) {
            // Token invalid/expired, but continue anyway
            console.log('Optional auth failed:', error.message);
        }
    }

    next();
};
