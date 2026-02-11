import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Admin from './models/Admin';

dotenv.config();

const clearDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error('MONGO_URI not found');
    
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for cleanup...');
    
    const resultUser = await User.deleteMany({});
    const resultAdmin = await Admin.deleteMany({});
    console.log(`Successfully deleted ${resultUser.deletedCount} users and ${resultAdmin.deletedCount} admins.`);
    
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
};

clearDB();
