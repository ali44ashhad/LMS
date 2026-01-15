import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';
import enrollmentRoutes from './routes/enrollment.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Load env variables
dotenv.config();

const app = express();

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

// CORS Configuration
const allowedOrigins = [
  'https://courses.cyfi.nestatoys.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL
]
  .filter(Boolean)
  .map(origin => origin.replace(/\/$/, '')); // Remove trailing slashes

console.log('🌐 CORS Allowed Origins:', allowedOrigins);
console.log('🌐 FRONTEND_URL from env:', process.env.FRONTEND_URL);

// CORS configuration function
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked request from origin: ${origin}`);
      console.log('Allowed origins:', allowedOrigins);
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

// Manual CORS headers middleware (FIRST - runs before everything, even DB connection)
app.use((req, res, next) => {
  try {
    const origin = req.headers.origin;
    const normalizedOrigin = origin ? origin.replace(/\/$/, '') : null;
    
    // Check if origin is allowed (normalized comparison)
    const isAllowed = normalizedOrigin && allowedOrigins.includes(normalizedOrigin);
    
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin); // Use original origin, not normalized
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
      res.setHeader('Access-Control-Expose-Headers', 'Authorization');
      res.setHeader('Access-Control-Max-Age', '86400');
    }
    
    // Handle preflight OPTIONS requests IMMEDIATELY (before any other processing)
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    
    next();
  } catch (error) {
    console.error('CORS middleware error:', error);
    // Still try to respond to OPTIONS even if there's an error
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next(error);
  }
});

// Apply CORS middleware (as backup - but manual middleware handles it first)
app.use(cors(corsOptions));

// Request logging middleware (for debugging) - skip for OPTIONS to reduce noise
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  }
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

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
// Vercel expects a handler function
const handler = app;

// Only start server if not in Vercel environment
const PORT = process.env.PORT || 5000;

// Check if we're running in Vercel (Vercel sets VERCEL env variable)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
} else {
  console.log('🚀 Running on Vercel');
}

// Export both app and handler for compatibility
export { app, handler };
export default app;
