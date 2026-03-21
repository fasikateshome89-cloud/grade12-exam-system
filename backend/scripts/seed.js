require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Exam = require('../models/Exam');
const connectDB = require('../config/database');

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Student.deleteMany({});
    await Exam.deleteMany({});
    
    // Create sample student
    const student = await Student.create({
      admissionNumber: '912131410',
      fullName: 'JOHN SMITH',
      password: 'Test@1234',
      school: 'TULDIM(R)',
      examCenter: 'ADDIS ABABA',
      enrollmentType: 'Regular',
      isBlind: false,
      isDeaf: false,
      mustChangePassword: true
    });
    
    console.log('Student created:', student.admissionNumber);
    
    // Create sample Chemistry exam with 100 questions
    const questions = [];
    
    // Question 1
    questions.push({
      questionText: '"A reaction that involves the exchange of positive and negative ions of each reactant". This is a definition of a',
      options: [
        'Single displacement reaction',
        'Combination reaction',
        'Decomposition reaction',
        'Double displacement reaction'
      ],
      correctAnswer: 3,
      marks: 1
    });
    
    // Question 2
    questions.push({
      questionText: '180 g of calcium carbonate ((CaCO3)) is allowed to react with 156 gram of hydrochloric acid (HCl). Which is the limiting reagent?',
      options: ['CO2', 'HCl', 'H2O', 'CaCO3'],
      correctAnswer: 3,
      marks: 1
    });
    
    // Question 3
    questions.push({
      questionText: 'A forward and reverse reaction continues at equal rate. This is the definition of',
      options: [
        'The law of mass action',
        'Dynamic equilibrium',
        'Degree of freedom',
        'Chemical kinetics'
      ],
      correctAnswer: 1,
      marks: 1
    });
    
    // Question 4
    questions.push({
      questionText: 'A nuclear breakdown in which particles or electromagnetic radiation is emitted is',
      options: [
        'Radioactive isotopes',
        'Radio wave',
        'Radioactivity',
        'Radioactive decay'
      ],
      correctAnswer: 3,
      marks: 1
    });
    
    // Add more questions to reach 100
    for (let i = 5; i <= 100; i++) {
      questions.push({
        questionText: `Sample question number ${i} - Choose the correct answer`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        marks: 1
      });
    }
    
    // Question 100 (specific)
    questions[99] = {
      questionText: 'Which one of the following is correct about chemical reaction?',
      options: [
        'Chemical reaction is areaction that follows only one path',
        'Reactions that follows double pass rate forms high rate of product',
        'Reaction that pass throuth intermediate complex in pass rate',
        'It is a kind of reaction which use activation enery at any time'
      ],
      correctAnswer: 3,
      marks: 1
    };
    
    const chemistryExam = await Exam.create({
      subject: 'Chemistry',
      courseName: 'Natural Science Grade 12',
      duration: 60,
      totalMarks: 100,
      openDate: new Date('2024-04-22'),
      closeDate: new Date('2025-12-31'),
      quizPassword: 'chem123',
      isActive: true,
      questions: questions
    });
    
    console.log('Chemistry exam created with', chemistryExam.questions.length, 'questions');
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();