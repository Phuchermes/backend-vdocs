const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// === REGISTER ===
exports.register = async (req, res) => {
  try {
    const { userId, name, deptname, password, department } = req.body;

    if (!userId || !name || !deptname ||!password || !department) {
      return res.status(400).json({ message: 'Thiếu thông tin' });
    }

    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ message: 'User ID đã tồn tại' });
    }

    const user = new User({ userId, name, deptname, password, department });
    await user.save();

    res.status(201).json({ message: 'Đăng ký thành công', user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Lỗi server khi đăng ký' });
  }
};

// === LOGIN ===
exports.login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(400).json({ message: 'User ID không tồn tại' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, userId: user.userId, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Đăng nhập thành công', token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập' });
  }
};

// === GET CURRENT USER ===
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
