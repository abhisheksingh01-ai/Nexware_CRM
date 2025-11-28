const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const { registerValidation, loginValidation } = require('../validations/userValidation');

const pick = (obj, keys) => keys.reduce((a, k) => { if (obj[k] !== undefined) a[k] = obj[k]; return a; }, {});

///////////////////// REGISTER (SECRET / PUBLIC RESTRICTED) /////////////////////
exports.register = async (req, res) => {
  try {
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const payload = {
      ...req.body,
      email: (req.body.email || '').toLowerCase().trim(),
      name: (req.body.name || '').trim(),
      phone: req.body.phone ? req.body.phone.trim() : null
    };

    const publicAllowedRoles = ['admin']; 
    if (!publicAllowedRoles.includes(payload.role)) {
      return res.status(403).json({ message: 'You cannot register with this role' });
    }

    const exist = await User.findOne({ email: payload.email });
    if (exist) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(payload.password, 10);

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: hashed,
      role: payload.role,
      phone: payload.phone,
      teamHeadId: payload.role === 'agent' ? payload.teamHeadId : null,
      status: 'active'
    });

    const token = generateToken(user);

    return res.status(201).json({
      user: pick(user.toObject(), ['_id', 'name', 'email', 'role', 'phone', 'teamHeadId', 'status']),
      token,
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

///////////////////// LOGIN /////////////////////
exports.login = async (req, res) => {
  try {
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const email = (req.body.email || '').toLowerCase().trim();
    const { password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account is inactive. Contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        role: user.role,
        teamHeadId: user.teamHeadId || null,
        status: user.status
      },
      token,
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
