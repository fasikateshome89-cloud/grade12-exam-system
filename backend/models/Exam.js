const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0
  },
  marks: {
    type: Number,
    default: 1
  }
});

const examSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    enum: ['Chemistry', 'Physics', 'Biology', 'Mathematics', 'English', 'Civics']
  },
  courseName: {
    type: String,
    required: true
  },
  questions: [questionSchema],
  duration: {
    type: Number,
    default: 60
  },
  totalMarks: {
    type: Number,
    required: true
  },
  openDate: {
    type: Date,
    required: true
  },
  closeDate: {
    type: Date,
    required: true
  },
  quizPassword: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Exam', examSchema);