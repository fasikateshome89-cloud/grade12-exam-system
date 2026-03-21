const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  admissionNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  school: {
    type: String,
    required: true
  },
  examCenter: {
    type: String,
    required: true
  },
  enrollmentType: {
    type: String,
    enum: ['Regular', 'Private'],
    default: 'Regular'
  },
  isBlind: {
    type: Boolean,
    default: false
  },
  isDeaf: {
    type: Boolean,
    default: false
  },
  mustChangePassword: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

studentSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);