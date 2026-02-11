
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';
import Admin from './src/models/Admin';

dotenv.config();

const run = async () => {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is missing');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const users = await User.find({});
        const admins = await Admin.find({});

        console.log('--- USERS ---');
        users.forEach(u => console.log(`${u.email} (${u.username}): ${u.role} [Verified: ${u.isVerified}]`));

        console.log('--- ADMINS ---');
        admins.forEach(a => console.log(`${a.email} (${a.username}): ${a.role} [Verified: ${a.isVerified}]`));
        
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
