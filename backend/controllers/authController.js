const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'safesphere_super_secret_jwt_key_2026_dev_major_project', {
    expiresIn: '7d'
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numeric OTP
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (name, email, phone, password)' });
    }

    // Basic Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: role && ['user', 'admin'].includes(role) ? role : 'user',
      isOtpVerified: false,
      otpCode,
      otpExpiresAt
    });

    // Log Development OTP mechanism to console
    console.log('\n======================================================');
    console.log(`[DEV OTP ENGINE] Account Registration`);
    console.log(`User: ${email}`);
    console.log(`Verification OTP Code: ${otpCode}`);
    console.log('======================================================\n');

    return res.status(201).json({
      success: true,
      message: 'Account created! Please verify your OTP to complete registration.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isOtpVerified: false,
        devOtp: otpCode // For testing/evaluation convenience
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP for account activation
// @route   POST /api/v1/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    if (user.isOtpVerified) {
      return res.status(200).json({
        success: true,
        message: 'Account is already verified. You can log in.',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    }

    if (!user.otpCode || user.otpCode !== otpCode.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP verification code' });
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP code has expired. Please request a new code.' });
    }

    // Mark verified
    user.isOtpVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    return res.json({
      success: true,
      message: 'OTP verified successfully! Account is fully active.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    return res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage || user.avatar || '',
        medicalInfo: user.medicalInfo,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset OTP
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this email address' });
    }

    const resetOtp = generateOTP();
    user.resetPasswordToken = resetOtp;
    user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
    await user.save();

    console.log('\n======================================================');
    console.log(`[DEV OTP ENGINE] Password Reset Requested`);
    console.log(`User: ${email}`);
    console.log(`Reset OTP Code: ${resetOtp}`);
    console.log('======================================================\n');

    return res.json({
      success: true,
      message: 'Password reset OTP code generated. (Check dev server console during testing)',
      data: {
        email: user.email,
        devOtp: resetOtp
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using OTP code
// @route   POST /api/v1/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, otpCode, newPassword } = req.body;

    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    if (!user.resetPasswordToken || user.resetPasswordToken !== otpCode.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid password reset OTP code' });
    }

    if (user.resetPasswordExpiresAt && user.resetPasswordExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset OTP code has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-passwordHash')
      .populate('emergencyContacts');

    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  verifyOTP,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe
};
