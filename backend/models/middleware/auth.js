const Student = require('../models/Student');

module.exports = {
  isAuthenticated: async (req, res, next) => {
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
      next();
    } catch (error) {
      console.error('Auth Error:', error);
      res.redirect('/login');
    }
  },

  mustChangePassword: (req, res, next) => {
    if (req.student.mustChangePassword) {
      return res.redirect('/change-password');
    }
    next();
  }
};