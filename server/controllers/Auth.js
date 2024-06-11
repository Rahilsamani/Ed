const bcrypt = require('bcrypt');
const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const Profile = require('../models/Profile');
require('dotenv').config();

// SignUp
const signUp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          'Password and ConfirmPassword Value does not match, please try again',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User is already registered',
      });
    }

    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

    if (response.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'OTP NOT Found',
      });
    } else if (otp !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumer: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType: accountType,
      approved: approved,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    return res.status(200).json({
      success: true,
      user,
      message: 'User is registered Successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'User cannot be registrered. Please try again',
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: 'Please Fill up All the Required Fields',
      });
    }

    const user = await User.findOne({ email }).populate('additionalDetails');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User is not registrered, please signup first',
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });
      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie('token', token, options).status(200).json({
        success: true,
        token,
        user,
        message: 'Logged in successfully',
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect',
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Login Failure, please try again',
    });
  }
};

// SendOTP
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const checkUserPresent = await User.findOne({ email });

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: 'User already registered',
      });
    }

    // TODO: This is Brute Force Method, is there any good way? In companies we will get third party library which will return unique OTP only. (178 to 192)
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log('OTP generated: ', otp);

    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
    }

    const otpPayload = { email, otp };

    const otpBody = await OTP.create(otpPayload);
    console.log('OTP Body', otpBody);

    res.status(200).json({
      success: true,
      message: 'OTP Sent Successfully',
      otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { signUp, login, sendOTP };
