const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');
const Student = require('../models/Student');

// Dashboard
router.get('/dashboard', async (req, res) => {
  if (!req.session.studentId) {
    return res.redirect('/login');
  }
  
  const student = await Student.findById(req.session.studentId);
  if (!student) {
    req.session.destroy();
    return res.redirect('/login');
  }

  const exams = await Exam.find({ isActive: true });
  const attempts = await ExamAttempt.find({ student: student._id, status: 'submitted' });

  res.render('dashboard', { student: student, exams: exams, completedAttempts: attempts });
});

// Exam Details
router.get('/exam/:id', async (req, res) => {
  if (!req.session.studentId) {
    return res.redirect('/login');
  }
  
  const student = await Student.findById(req.session.studentId);
  if (!student) {
    req.session.destroy();
    return res.redirect('/login');
  }

  const exam = await Exam.findById(req.params.id);
  if (!exam) {
    return res.status(404).send('Exam not found');
  }

  res.render('exam-details', { student: student, exam: exam, existingAttempt: null });
});

module.exports = router;
