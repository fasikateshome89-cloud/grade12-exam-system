const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    selectedOption: Number,
    isCorrect: Boolean,
    flagged: {
      type: Boolean,
      default: false
    }
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  submitTime: {
    type: Date
  },
  timeSpent: {
    type: Number
  },
  score: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'expired'],
    default: 'in-progress'
  },
  ipAddress: {
    type: String
  }
});

attemptSchema.pre('save', function(next) {
  if (this.status === 'submitted' && !this.score) {
    let correctCount = 0;
    this.answers.forEach(answer => {
      if (answer.isCorrect) correctCount++;
    });
    this.score = correctCount;
    this.percentage = (correctCount / this.answers.length) * 100;
  }
  next();
});

module.exports = mongoose.model('ExamAttempt', attemptSchema);