import connectDB from '../lib/db/database';
import User from '../lib/db/User';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
    await connectDB();

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
        console.log('Admin user already exists:', existingAdmin.email);
        process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);

    const admin = await User.create({
        username: 'admin',
        email: 'admin@bidstrike.com',
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@bidstrike.com');
    console.log('Password: admin123');
    console.log('ID:', admin._id);

    process.exit(0);
}

createAdminUser().catch((err) => {
    console.error('Error creating admin user:', err);
    process.exit(1);
});
