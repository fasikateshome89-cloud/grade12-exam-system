const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { isAuthenticated, mustChangePassword } = require('../middleware/auth');

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
    if (!student) {
      return res.render('login', { error: 'Invalid admission number or password' });
    }

    const isMatch = (password === student.password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid admission number or password' });
    }

   req.session.studentId = student._id;
    req.session.save();

    if (student.mustChangePassword) {
      return res.redirect('/change-password');
    }

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login Error:', error);
    res.render('login', { error: 'Server error. Please try again.' });
  }
});

// Change Password Page
router.get('/change-password', isAuthenticated, (req, res) => {
  res.render('change-password', { 
    student: req.student,
    error: null,
    success: null
  });
});

// Change Password Handler
router.post('/change-password', isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.render('change-password', {
        student: req.student,
        error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
        success: null
      });
    }

    if (newPassword !== confirmPassword) {
      return res.render('change-password', {
        student: req.student,
        error: 'New passwords do not match',
        success: null
      });
    }

    const isMatch = await req.student.comparePassword(currentPassword);
    if (!isMatch) {
      return res.render('change-password', {
        student: req.student,
        error: 'Current password is incorrect',
        success: null
      });
    }

    req.student.password = newPassword;
    req.student.mustChangePassword = false;
    await req.student.save();

    res.render('change-password', {
      student: req.student,
      error: null,
      success: 'Password changed successfully!'
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.render('change-password', {
      student: req.student,
      error: 'Server error. Please try again.',
      success: null
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout Error:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;
