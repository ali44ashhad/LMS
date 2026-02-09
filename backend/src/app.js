import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';
import enrollmentRoutes from './routes/enrollment.routes.js';
import adminRoutes from './routes/admin.routes.js';
import moduleRoutes from './routes/module.routes.js';
import lessonRoutes from './routes/lesson.routes.js';

const app = express();

// CRITICAL: Handle OPTIONS requests at the absolute top level
// This must be before ANY other middleware
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        try {
            const origin = req.headers.origin;
            const allowedOrigins = [
                'https://courses.cyfi.nestatoys.com',
                'https://platform.nestatoys.com',
                'https://nestatoys.com',
                'http://localhost:5173',
                'http://localhost:5174',
                'http://localhost:3000',
                'https://nestatoys.com',
                process.env.FRONTEND_URL,
            ].filter(Boolean).map(o => o && o.replace(/\/$/, ''));

            const normalizedOrigin = origin ? origin.replace(/\/$/, '') : null;
            const isAllowed = normalizedOrigin && allowedOrigins.includes(normalizedOrigin);

            if (isAllowed) {
                res.setHeader('Access-Control-Allow-Origin', origin);
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
                res.setHeader('Access-Control-Max-Age', '86400');
            }

            return res.status(204).end();
        } catch (error) {
            console.error('OPTIONS handler error:', error);
            return res.status(204).end();
        }
    }
    next();
});

// CORS Configuration - wrapped in try-catch to prevent initialization errors
let allowedOrigins = [];
try {
    allowedOrigins = [
        'https://courses.cyfi.nestatoys.com',
        'https://platform.nestatoys.com',
        'https://nestatoys.com',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        process.env.FRONTEND_URL
    ]
        .filter(Boolean)
        .map(origin => origin.replace(/\/$/, '')); // Remove trailing slashes
} catch (error) {
    console.error('Error setting up CORS origins:', error);
    allowedOrigins = ['https://courses.cyfi.nestatoys.com'];
}

// CORS configuration function
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed for this origin'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Authorization'],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Set CORS headers for non-OPTIONS requests (OPTIONS already handled above)
app.use((req, res, next) => {
    if (req.method !== 'OPTIONS') {
        try {
            const origin = req.headers.origin;
            const normalizedOrigin = origin ? origin.replace(/\/$/, '') : null;
            const isAllowed = normalizedOrigin && allowedOrigins.includes(normalizedOrigin);

            if (isAllowed) {
                res.setHeader('Access-Control-Allow-Origin', origin);
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
                res.setHeader('Access-Control-Expose-Headers', 'Authorization');
            }
        } catch (error) {
            console.error('CORS headers error:', error);
        }
    }
    next();
});

// Apply CORS middleware (as backup)
app.use(cors(corsOptions));

// Middleware
// Increase body parser limits to handle large course data (videos, modules, etc.)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cookieParser());
// Serve uploaded files statically (only if not in serverless)
try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    if (!process.env.VERCEL) {
        // Go up one level to root since we are in src/
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        app.use('/uploads', express.static(uploadsDir));
    }
} catch (error) {
    console.warn('Could not set up static file serving:', error.message);
    // Continue without static file serving - not critical for API
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'LMS API is running' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);

    // Handle CORS errors specifically
    if (err.message && err.message.includes('CORS')) {
        return res.status(403).json({
            success: false,
            message: 'CORS: Origin not allowed',
            origin: req.headers.origin,
            allowedOrigins: allowedOrigins
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

export default app;