// server.js
// Main entry point for the Digital Notice Board backend.

require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const User = require('./models/User');

const app = express();

// ===== Basic Middleware =====
app.use(cors()); // Same-origin by default, but safe if you later host frontend separately.
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== Static Folders =====
// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploaded files (images, PDFs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== API Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);

// ===== Fallback route (serve login page) =====
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== MongoDB Connection and Server Start =====
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digital_notice_board';

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // Seed default users (admin, faculty, student) if they don't exist.
    await seedDefaultUsers();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// ===== Seed Function =====
async function seedDefaultUsers() {
  try {
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      return;
    }

    // Very simple default users for demo purposes only.
    const defaultUsers = [
      { username: 'admin1', password: 'admin123', role: 'admin' },
      { username: 'faculty1', password: 'faculty123', role: 'faculty' },
      { username: 'student1', password: 'student123', role: 'student' }
    ];

    for (const u of defaultUsers) {
      const user = new User(u);
      await user.save();
    }

    console.log('✅ Seeded default users: admin1, faculty1, student1');
    console.log('   Passwords: admin123, faculty123, student123');
  } catch (err) {
    console.error('Error seeding users:', err);
  }
}

