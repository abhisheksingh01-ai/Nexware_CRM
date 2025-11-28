const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,      
      lowercase: true,
      trim: true,
      index: true        
    },

    phone: { type: String, trim: true },

    role: {
      type: String,
      enum: ['admin', 'subadmin', 'teamhead', 'agent'],
      required: true,
    },

    password: { type: String, required: true },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },

    teamHeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
