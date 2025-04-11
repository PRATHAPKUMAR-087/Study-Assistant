const express = require('express');
const router = express.Router();
const { generateQuiz, getQuiz } = require('../controllers/quizController');

router.post('/generate-quiz', generateQuiz);
router.get('/get-quiz', getQuiz);
//router.get('/quiz-status/:user_id/:topic',viewQuizStatus);

module.exports = router;
