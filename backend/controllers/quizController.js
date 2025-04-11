const axios = require('axios');
const connection = require('../config/db');
require('dotenv').config();

const MISTRAL_API_KEY = "6gyuyKEVlaUXnHcMmVKGmmMoaexM2rfs";

function formatDate(isoString) {
    const date = new Date(isoString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const renderSubtopics = (subtopics) => {
    try {
        let raw = subtopics;

        if (typeof raw === "string" && raw.startsWith('"[')) {
            raw = JSON.parse(raw);
            raw = JSON.parse(raw);
        } else if (typeof raw === "string") {
            raw = JSON.parse(raw);
        }

        return Array.isArray(raw) ? raw : [];
    } catch (err) {
        console.error("❌ Error rendering subtopics:", err);
        return "N/A";
    }
};

// ✅ Generate Quiz API
exports.generateQuiz = async (req, res) => {
    const { user_id, topic, subtopics, created_at } = req.body;
    // console.log("Data being sent to generate-quiz:", req.body);


    const formattedCreatedAt = formatDate(created_at);
    const sub_topics = renderSubtopics(subtopics);

    if (!user_id || !topic || !sub_topics || !formattedCreatedAt) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = `Generate a 5-question multiple choice quiz on the topic "${topic}".
Focus on these subtopics: ${sub_topics.join(', ')}.
Each question must have options A, B, C, D and mention the correct answer.
Return output as JSON in this format:
[
  {
    "question": "....",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "answer": "A"
  }
]`;

    try {
        const response = await axios.post(
            'https://api.mistral.ai/v1/chat/completions',
            {
                model: 'mistral-medium',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            },
            {
                headers: {
                    Authorization: `Bearer ${MISTRAL_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const quizText = response.data.choices[0].message.content;
        let quizData;

        try {
            quizData = JSON.parse(quizText);
        } catch (err) {
            return res.status(500).json({ error: 'Failed to parse quiz JSON from Mistral response' });
        }

        const insertQuery = `
            INSERT INTO quizzes (user_id, topic, subtopics, quiz_data, created_at)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [user_id, topic, sub_topics.join(', '), JSON.stringify(quizData), formattedCreatedAt];

        connection.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).json({ error: 'Failed to save quiz to database' });
            }
            res.status(200).json({ message: 'Quiz generated and stored successfully', quiz: quizData });
        });
    } catch (error) {
        console.error('Mistral API Error:', error.message);
        res.status(500).json({ error: 'Failed to generate quiz from Mistral API' });
    }
};

// ✅ Get All Quizzes for a User
// In your controller
exports.getQuiz = (req, res) => {
  const { user_id, topic, created_at } = req.query;

  console.log('Received quiz fetch:', user_id, topic, created_at);
  const new_created_at = formatDate(created_at);
  const query = `
      SELECT quiz_data FROM quizzes
      WHERE user_id = ? AND topic = ? AND created_at = ?
  `;
  const values = [user_id, topic, new_created_at];

  connection.query(query, values, (err, results) => {
      if (err) {
          console.error('Database Error:', err);
          return res.status(500).json({ error: 'Failed to fetch quiz' });
      }

      if (results.length === 0) {
          return res.status(404).json({ error: 'Quiz not found' });
      }

      let quiz;
      if (typeof results[0].quiz_data === 'string') {
        quiz = JSON.parse(results[0].quiz_data); // If stored as string
      } else {
        quiz = results[0].quiz_data; // Already an object
      }
      res.status(200).json({ quiz });
  });
};



