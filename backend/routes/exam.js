const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');
const Student = require('../models/Student');

// Dashboard - NO MIDDLEWARE
router.get('/dashboard', async (req, res) => {
  try {
    if (!req.session.studentId) {
      return res.redirect('/login');
    }
    
    const student = await Student.findById(req.session.studentId);
    if (!student) {
      req.session.destroy();
      return res.redirect('/login');
    }
    
    req.student = student;
    
    const exams = await Exam.find({ 
      isActive: true,
      openDate: { $lte: new Date() },
      closeDate: { $gte: new Date() }
    });

    const completedAttempts = await ExamAttempt.find({
      student: student._id,
      status: 'submitted'
    }).populate('exam');

    return res.render('dashboard', {
      student: student,
      exams: exams,
      completedAttempts: completedAttempts
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    return res.status(500).send('Server Error');
  }
});

// Exam Details
router.get('/exam/:id', async (req, res) => {
  try {
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

    const existingAttempt = await ExamAttempt.findOne({
      student: student._id,
      exam: exam._id,
      status: 'in-progress'
    });

    return res.render('exam-details', {
      student: student,
      exam: exam,
      existingAttempt: existingAttempt
    });
  } catch (error) {
    console.error('Exam Details Error:', error);
    return res.status(500).send('Server Error');
  }
});

// Start Exam
router.post('/exam/:id/start', async (req, res) => {
  try {
    if (!req.session.studentId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const student = await Student.findById(req.session.studentId);
    if (!student) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const exam = await Exam.findById(req.params.id);
    const { quizPassword } = req.body;

    if (quizPassword !== exam.quizPassword) {
      return res.status(400).json({ error: 'Invalid quiz password' });
    }

    const existingAttempt = await ExamAttempt.findOne({
      student: student._id,
      exam: exam._id,
      status: 'in-progress'
    });

    if (existingAttempt) {
      return res.json({ redirect: `/exam/attempt/${existingAttempt._id}` });
    }

    const attempt = new ExamAttempt({
      student: student._id,
      exam: exam._id,
      answers: exam.questions.map(q => ({
        questionId: q._id,
        selectedOption: null,
        isCorrect: false,
        flagged: false
      })),
      ipAddress: req.ip
    });

    await attempt.save();

    return res.json({ redirect: `/exam/attempt/${attempt._id}` });
  } catch (error) {
    console.error('Start Exam Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
