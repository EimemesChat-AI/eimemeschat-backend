import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...');
  console.log('URI:', process.env.MONGO_URI?.replace(/:[^:]*@/, ':****@'));
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully!');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('👋 Disconnected');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('💡 Check:');
    console.error('   - MONGO_URI in .env file');
    console.error('   - IP whitelist in MongoDB Atlas (add 0.0.0.0/0)');
    console.error('   - Username and password are correct');
    console.error('   - Special characters in password are URL-encoded');
  }
}

testConnection();