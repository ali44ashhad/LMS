import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // If already connected, return
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
      return;
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Don't exit process in serverless environments
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error; // Re-throw so caller can handle it
  }
};

export default connectDB;
