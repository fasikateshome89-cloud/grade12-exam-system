const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Login Page
router.get('/login', (req, res) => {
  if (req.session.studentId) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

// Login Handler
router.post('/login', async (req, res) => {
  try {
    const { admissionNumber, password } = req.body;
    const student = await Student.findOne({ admissionNumber });
    
    if (!student || password !== student.password) {
      return res.render('login', { error: 'Invalid admission number or password' });
    }

    req.session.studentId = student._id;
    await new Promise((resolve) => req.session.save(resolve));

    if (student.mustChangePassword) {
      return res.redirect('/change-password');
    }

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { error: 'Server error' });
  }
});

// Change Password Page
router.get('/change-password', async (req, res) => {
  if (!req.session.studentId) {
    return res.redirect('/login');
  }
  const student = await Student.findById(req.session.studentId);
  if (!student) {
    req.session.destroy();
    return res.redirect('/login');
  }
  res.render('change-password', { student: student, error: null, success: null });
});

// Change Password Handler
router.post('/change-password', async (req, res) => {
  if (!req.session.studentId) {
    return res.redirect('/login');
  }
  const student = await Student.findById(req.session.studentId);
  if (!student) {
    req.session.destroy();
    return res.redirect('/login');
  }

  const { currentPassword, newPassword, confirmPassword } = req.body;
  
  if (currentPassword !== student.password) {
    return res.render('change-password', { student: student, error: 'Current password incorrect', success: null });
  }
  if (newPassword.length < 6 || newPassword !== confirmPassword) {
    return res.render('change-password', { student: student, error: 'Invalid new password', success: null });
  }

  student.password = newPassword;
  student.mustChangePassword = false;
  await student.save();

  res.render('change-password', { student: student, error: null, success: 'Password changed!' });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;











































