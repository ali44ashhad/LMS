import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';
import enrollmentRoutes from './routes/enrollment.routes.js';
import adminRoutes from './routes/admin.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load env variables FIRST
dotenv.config();

const app = express();

// CRITICAL: Handle OPTIONS requests at the absolute top level
// This must be before ANY other middleware
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    try {
      const origin = req.headers.origin;
      const allowedOrigins = [
        'https://courses.cyfi.nestatoys.com',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'https://lms-trvj-git-testing-kahas-projects-baeca9d9.vercel.app/',
        process.env.FRONTEND_URL
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

// Lazy database connection (only connect when needed, not for OPTIONS)
let dbConnected = false;
const ensureDBConnection = async () => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (error) {
      console.error('Database connection error:', error);
      // Don't exit process in serverless - let requests handle the error
      if (process.env.VERCEL) {
        console.warn('Running on Vercel - continuing without DB connection');
      } else {
        throw error;
      }
    }
  }
};

// CORS Configuration - wrapped in try-catch to prevent initialization errors
let allowedOrigins = [];
try {
  allowedOrigins = [
    'https://courses.cyfi.nestatoys.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://lms-trvj-git-testing-kahas-projects-baeca9d9.vercel.app/',
  
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (only if not in serverless)
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  if (!process.env.VERCEL) {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    app.use('/uploads', express.static(uploadsDir));
  }
} catch (error) {
  console.warn('Could not set up static file serving:', error.message);
  // Continue without static file serving - not critical for API
}

// Middleware to ensure DB connection for non-OPTIONS requests
app.use(async (req, res, next) => {
  // Skip DB connection for OPTIONS requests
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  // Ensure DB connection for other requests
  try {
    await ensureDBConnection();
  } catch (error) {
    console.error('Failed to connect to database:', error);
    // Continue anyway - routes will handle the error
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);

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

// Export for Vercel serverless functions
// Vercel expects the default export to be the handler
export default app;

// Only start server if not in Vercel environment
const PORT = process.env.PORT || 5000;

// Check if we're running in Vercel (Vercel sets VERCEL env variable)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
