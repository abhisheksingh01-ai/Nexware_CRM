const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { createUserValidation, updateUserValidation } = require('../validations/userValidation');

///////////////////// CREATE USER /////////////////////

exports.createUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Only admin can create users' });

    const { error } = createUserValidation(req.body);
    if (error) return res.status(400).json({ message: error.details.map(e => e.message).join(', ') });

    const payload = {
      ...req.body,
      email: req.body.email.toLowerCase().trim(),
      name: req.body.name.trim(),
      phone: req.body.phone ? req.body.phone.trim() : null
    };

    const allowedRoles = ['admin', 'subadmin', 'teamhead', 'agent'];
    if (!allowedRoles.includes(payload.role)) return res.status(400).json({ message: 'Invalid role' });

    const existing = await User.findOne({ email: payload.email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(payload.password, 10);
    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: hashed,
      role: payload.role,
      phone: payload.phone || null,
      teamHeadId: payload.role === 'agent' ? payload.teamHeadId : null,
      status: payload.status || 'active'
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        teamHeadId: user.teamHeadId || null,
        status: user.status
      }
    });
  } catch (err) {
    console.error('CREATE USER ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

///////////////////// GET USERS /////////////////////

exports.getUsers = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (user.role === 'agent') return res.status(403).json({ message: 'Agents cannot view user list' });

    let users;
    if (user.role === 'teamhead') {
      users = await User.find({ teamHeadId: user._id }).select('-password');
    } else if (user.role === 'subadmin') {
      users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    } else {
      users = await User.find().select('-password');
    }

    res.json(users);
  } catch (error) {
    console.error('GET USERS ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

///////////////////// UPDATE USER /////////////////////

exports.updateUser = async (req, res) => {
  try {
    const loggedIn = req.user;
    const { id } = req.params;
    if (!loggedIn) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { error } = updateUserValidation(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(e => e.message).join(", "),
      });
    }
    let updates = { ...req.body };
    if (loggedIn.role !== "admin") {
      if (loggedIn._id.toString() !== id) {
        return res.status(403).json({
          success: false,
          message: "You can update only your own profile",
        });
      }
      const allowedFields = ["name", "phone", "password"];
      Object.keys(updates).forEach(key => {
        if (!allowedFields.includes(key)) delete updates[key];
      });
      if (
        !updates.name &&
        !updates.phone &&
        !updates.password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Non-admin can only update: name, phone, password",
        });
      }
    }
    if (loggedIn.role === "admin") {
      const allowedRoles = ["admin", "subadmin", "teamhead", "agent"];

      if (updates.role && !allowedRoles.includes(updates.role)) {
        return res.status(400).json({ success: false, message: "Invalid role value" });
      }
      if (updates.role && updates.role !== "agent") {
        updates.teamHeadId = null;
      }
    }
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    if (updates.name) updates.name = updates.name.trim();
    if (updates.phone) updates.phone = updates.phone.trim();
    if (updates.email) delete updates.email;
    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
    }).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


///////////////////// UPDATE STATUS /////////////////////

exports.updateStatus = async (req, res) => {
  try {
    const admin = req.user;
    if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Only admin can update status' });

    const { userId, status } = req.body;
    if (!['active', 'inactive'].includes(status)) return res.status(400).json({ message: 'Invalid status value' });

    const userToChange = await User.findById(userId);
    if (!userToChange) return res.status(404).json({ message: 'User not found' });

    if (userToChange.role === 'admin' && status === 'inactive') {
      const adminCount = await User.countDocuments({ role: 'admin', status: 'active' });
      if (adminCount <= 1) return res.status(400).json({ message: 'Cannot deactivate the last active admin' });
    }

    const user = await User.findByIdAndUpdate(userId, { status }, { new: true }).select('-password');
    res.json({ message: `User is now ${status}`, user });
  } catch (err) {
    console.error('UPDATE STATUS ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

///////////////////// DELETE USER /////////////////////

exports.deleteUser = async (req, res) => {
  try {
    const admin = req.user;
    const { id } = req.params;
    if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Only admin can delete users' });

    const userToDelete = await User.findById(id);
    if (!userToDelete) return res.status(404).json({ message: 'User not found' });

    if (userToDelete.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', status: 'active' });
      if (adminCount <= 1) return res.status(400).json({ message: 'Cannot delete the last remaining active admin' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('DELETE USER ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
