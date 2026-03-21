const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');
const { isAuthenticated, mustChangePassword } = require('../middleware/auth');

// Dashboard
router.get('/dashboard', isAuthenticated, mustChangePassword, async (req, res) => {
  try {
    const exams = await Exam.find({ 
      isActive: true,
      openDate: { $lte: new Date() },
      closeDate: { $gte: new Date() }
    });

    const completedAttempts = await ExamAttempt.find({
      student: req.student._id,
      status: 'submitted'
    }).populate('exam');

    res.render('dashboard', {
      student: req.student,
      exams,
      completedAttempts
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).send('Server Error');
  }
});

// Exam Details
router.get('/exam/:id', isAuthenticated, mustChangePassword, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).send('Exam not found');
    }

    const existingAttempt = await ExamAttempt.findOne({
      student: req.student._id,
      exam: exam._id,
      status: 'in-progress'
    });

    res.render('exam-details', {
      student: req.student,
      exam,
      existingAttempt
    });
  } catch (error) {
    console.error('Exam Details Error:', error);
    res.status(500).send('Server Error');
  }
});

// Start Exam Attempt
router.post('/exam/:id/start', isAuthenticated, mustChangePassword, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    const { quizPassword } = req.body;

    if (quizPassword !== exam.quizPassword) {
      return res.status(400).json({ error: 'Invalid quiz password' });
    }

    const existingAttempt = await ExamAttempt.findOne({
      student: req.student._id,
      exam: exam._id,
      status: 'in-progress'
    });

    if (existingAttempt) {
      return res.json({ redirect: `/exam/attempt/${existingAttempt._id}` });
    }

    const attempt = new ExamAttempt({
      student: req.student._id,
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

    res.json({ redirect: `/exam/attempt/${attempt._id}` });
  } catch (error) {
    console.error('Start Exam Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Take Exam
router.get('/exam/attempt/:attemptId', isAuthenticated, mustChangePassword, async (req, res) => {
  try {
    const attempt = await ExamAttempt.findById(req.params.attemptId)
      .populate('exam')
      .populate('student');

    if (!attempt || attempt.student._id.toString() !== req.student._id.toString()) {
      return res.status(403).send('Unauthorized');
    }

    if (attempt.status !== 'in-progress') {
      return res.redirect(`/exam/result/${attempt._id}`);
    }

    const timeElapsed = Math.floor((new Date() - attempt.startTime) / 1000);
    const timeRemaining = (attempt.exam.duration * 60) - timeElapsed;

    if (timeRemaining <= 0) {
      attempt.status = 'expired';
      attempt.submitTime = new Date();
      attempt.timeSpent = attempt.exam.duration * 60;
      await attempt.save();
      return res.redirect(`/exam/result/${attempt._id}`);
    }

    res.render('take-exam', {
      student: req.student,
      attempt,
      timeRemaining
    });
  } catch (error) {
    console.error('Take Exam Error:', error);
    res.status(500).send('Server Error');
  }
});

// Save Answer
router.post('/exam/attempt/:attemptId/save', isAuthenticated, async (req, res) => {
  try {
    const { questionId, selectedOption, flagged } = req.body;
    
    const attempt = await ExamAttempt.findById(req.params.attemptId);
    if (!attempt || attempt.student.toString() !== req.student._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const answer = attempt.answers.id(questionId);
    if (answer) {
      answer.selectedOption = selectedOption;
      answer.flagged = flagged || false;
      
      const exam = await Exam.findById(attempt.exam);
      const question = exam.questions.id(questionId);
      answer.isCorrect = (answer.selectedOption === question.correctAnswer);
      
      await attempt.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Save Answer Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit Exam
router.post('/exam/attempt/:attemptId/submit', isAuthenticated, async (req, res) => {
  try {
    const attempt = await ExamAttempt.findById(req.params.attemptId)
      .populate('exam');
    
    if (!attempt || attempt.student.toString() !== req.student._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const timeElapsed = Math.floor((new Date() - attempt.startTime) / 1000);
    
    attempt.status = 'submitted';
    attempt.submitTime = new Date();
    attempt.timeSpent = timeElapsed;
    await attempt.save();

    res.json({ success: true, redirect: `/exam/result/${attempt._id}` });
  } catch (error) {
    console.error('Submit Exam Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Exam Result
router.get('/exam/result/:attemptId', isAuthenticated, async (req, res) => {
  try {
    const attempt = await ExamAttempt.findById(req.params.attemptId)
      .populate('exam')
      .populate('student');

    if (!attempt || attempt.student._id.toString() !== req.student._id.toString()) {
      return res.status(403).send('Unauthorized');
    }

    res.render('exam-result', {
      student: req.student,
      attempt
    });
  } catch (error) {
    console.error('Exam Result Error:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;