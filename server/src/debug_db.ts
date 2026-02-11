import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Admin from './models/Admin';

dotenv.config();

async function debugSignup() {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        console.error('MONGO_URI not found');
        return;
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const users = await User.find({});
    const admins = await Admin.find({});

    console.log('--- Users ---');
    users.forEach(u => console.log(`Email: ${u.email}, Username: ${u.username}, Phone: ${u.phoneNumber}`));
    
    console.log('--- Admins ---');
    admins.forEach(a => console.log(`Email: ${a.email}, Username: ${a.username}, Phone: ${a.phoneNumber}`));

    await mongoose.disconnect();
}

debugSignup();
