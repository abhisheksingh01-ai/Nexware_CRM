const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ========== CREATE USER (ADMIN ONLY) ==========
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, teamHeadId } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: 'User already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      phone,
      teamHeadId: teamHeadId || null
    });
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// ========== GET USERS (RBAC LOGIC) ==========
exports.getUsers = async (req, res) => {
  try {
    const user = req.user;
    // AGENT → cannot view list
    if (user.role === "agent") {
      return res.status(403).json({ message: "Agents cannot view user list" });
    }
    let users;
    // TEAMHEAD → only their agents
    if (user.role === "teamhead") {
      users = await User.find({ teamHeadId: user._id }).select("-password");
      return res.json(users);
    }
    // SUBADMIN → all except admins
    if (user.role === "subadmin") {
      users = await User.find({ role: { $ne: "admin" } }).select("-password");
      return res.json(users);
    }
    // ADMIN → view all
    users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// ========== UPDATE USER (ROLE-BASED RULES) ==========
exports.updateUser = async (req, res) => {
  try {
    const loggedIn = req.user;
    const { id } = req.params;
    const updates = req.body;
    // Only admin can update others
    if (loggedIn.role !== "admin" && loggedIn._id.toString() !== id) {
      return res.status(403).json({ message: "You cannot update this user" });
    }
    // Only admin can change role
    if (updates.role && loggedIn.role !== "admin") {
      return res.status(403).json({ message: "Only admin can change roles" });
    }
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// ========== UPDATE ACTIVE/INACTIVE (ADMIN ONLY) ==========
exports.updateStatus = async (req, res) => {
  try {
    const adminId = req.user.id;
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Only admin can update status" });
    }
    const { userId, status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      message: `User is now ${status}`,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ========== DELETE USER (ADMIN ONLY + CANNOT DELETE LAST ADMIN) ==========
exports.deleteUser = async (req, res) => {
  try {
    const admin = req.user;
    const { id } = req.params;
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete users" });
    }
    const userToDelete = await User.findById(id);
    if (!userToDelete) return res.status(404).json({ message: "User not found" });
    if (userToDelete.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: "Cannot delete last remaining admin"
        });
      }
    }
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
