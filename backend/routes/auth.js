const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Login Page (GET)
router.get('/login', (req, res) => {
  if (req.session.studentId) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

// Login Handler (POST)
router.post('/login', async (req, res) => {
  try {
    const { admissionNumber, password } = req.body;
    
    console.log('Login attempt:', admissionNumber);
    
    const student = await Student.findOne({ admissionNumber });
    
    if (!student) {
      console.log('Student not found');
      return res.render('login', { error: 'Invalid admission number or password' });
    }

    console.log('Student found:', student.firstName);
    
    // Plain text password comparison
    const isMatch = (password === student.password);
    
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('Password incorrect');
      return res.render('login', { error: 'Invalid admission number or password' });
    }

    // Set session
    req.session.studentId = student._id;
    
    // Save session
    await new Promise((resolve) => {
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
        }
        resolve();
      });
    });
    
    console.log('Session saved');

    // Redirect based on mustChangePassword
    if (student.mustChangePassword) {
      console.log('Redirecting to change password');
      return res.redirect('/change-password');
    }

    console.log('Redirecting to dashboard');
    return res.redirect('/dashboard');
    
  } catch (error) {
    console.error('Login error:', error);
    return res.render('login', { error: 'Server error. Please try again.' });
  }
});

// Change Password Page (GET) - NO MIDDLEWARE
router.get('/change-password', async (req, res) => {
  try {
    if (!req.session.studentId) {
      return res.redirect('/login');
    }
    
    const student = await Student.findById(req.session.studentId);
    
    if (!student) {
      req.session.destroy();
      return res.redirect('/login');
    }
    
    return res.render('change-password', { 
      student: student,
      error: null,
      success: null
    });
  } catch (error) {
    console.error('Change password page error:', error);
    return res.render('change-password', { 
      student: null,
      error: 'Server error',
      success: null
    });
  }
});

// Change Password Handler (POST) - NO MIDDLEWARE
router.post('/change-password', async (req, res) => {
  try {
    if (!req.session.studentId) {
      return res.redirect('/login');
    }
    
    const student = await Student.findById(req.session.studentId);
    
    if (!student) {
      req.session.destroy();
      return res.redirect('/login');
    }
    
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validate current password
    if (currentPassword !== student.password) {
      return res.render('change-password', {
        student: student,
        error: 'Current password is incorrect',
        success: null
      });
    }
    
    // Validate new password
    if (newPassword.length < 6) {
      return res.render('change-password', {
        student: student,
        error: 'Password must be at least 6 characters',
        success: null
      });
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.render('change-password', {
        student: student,
        error: 'New passwords do not match',
        success: null
      });
    }
    
    // Update password
    student.password = newPassword;
    student.mustChangePassword = false;
    await student.save();
    
    console.log('Password changed successfully for:', student.admissionNumber);
    
    return res.render('change-password', {
      student: student,
      error: null,
      success: 'Password changed successfully!'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    return res.render('change-password', {
      student: null,
      error: 'Server error. Please try again.',
      success: null
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    return res.redirect('/login');
  });
});

module.exports = router;











































