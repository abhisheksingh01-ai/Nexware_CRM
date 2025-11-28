const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// Register is working 

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, teamHeadId } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      phone,
      teamHeadId: teamHeadId || null,  
    });
    const token = generateToken(user);
    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        teamHeadId: user.teamHeadId || null,
      },
      token,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Login is working

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });
    if (user.status === "inactive") {
      return res.status(403).json({ message: "Your account is inactive. Contact admin." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    const token = generateToken(user);
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        role: user.role,
        teamHeadId: user.teamHeadId || null,
        status: user.status,
      },
      token,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
