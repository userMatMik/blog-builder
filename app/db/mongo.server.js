import mongoose from 'mongoose';

let isConnected = false;

export async function connectToMongo() {
  if (isConnected) {
    return mongoose.connection;
  }
  
  const uri = process.env.MONGO_URI;
  
  if (!uri) {
    // throw new Error('Missing MONGO_URI in environment variables');
    console.error("❌ Missing MONGO_URI in environment variables. Skipping MongoDB connection.");
    null;
  }
  
  try {
    mongoose.set("strictQuery", true);
    
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    
    // Event listeners (helpful dla debugging)
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
      isConnected = false;  // Reset flag on error
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose disconnected');
      isConnected = false;  // Reset flag on disconnect
    });
    
    return mongoose.connection;
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    isConnected = false;  // Reset flag on error
    throw error;
  }
}