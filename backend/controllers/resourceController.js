const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const db = require("../config/db"); // adjust if your db config file is elsewhere
const YOUTUBE_API_KEY = "AIzaSyCe7v0xl9uMrtLWhLYKsnAHUKIuN6UbHbM"; // Replace with your actual key
const MISTRAL_API_KEY = "wuOSFtMwGb25ITwo0DdRCOFoa99gxhN3";

// Helper: Fetch subtopics from DB
const getResources = async (req, res) => {
  const {sub_topics, resource_type } = req.body;

  if (!sub_topics || !Array.isArray(sub_topics) || !resource_type) {
    return res.status(400).json({ error: "Missing sub_topics or resource_type" });
  }

  try {
    const results = {};

    for (const sub of sub_topics) {
      if (resource_type === "notes") {
        const prompt = `Explain the concept of "${sub}" in a simple and concise way for students.`;

        const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${MISTRAL_API_KEY}`
          },
          body: JSON.stringify({
            model: "mistral-tiny",
            messages: [{ role: "user", content: prompt }]
          })
        });

        const data = await response.json();
        results[sub] = {
          explanation: data.choices?.[0]?.message?.content || "No explanation found"
        };
      }

      else if (resource_type === "articles") {
        results[sub] = {
          suggestions: [
            `https://medium.com/search?q=${encodeURIComponent(sub)}`,
            `https://www.geeksforgeeks.org/?s=${encodeURIComponent(sub)}`
          ]
        };
      }

      else if (resource_type === "videos") {
        const apiKey = YOUTUBE_API_KEY;
        const query = encodeURIComponent(sub);
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${apiKey}&maxResults=3&type=video`;

        const response = await fetch(url);
        const data = await response.json();

        results[sub] = {
          videos: data.items.map(item => ({
            title: item.snippet.title,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`
          }))
        };
      }
    }

    res.json(results);
  } catch (err) {
    console.error("Error fetching resources:", err);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
};

const formatMySQLDateTime = (isoString) => {
  const date = new Date(isoString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

const saveResources = (req, res) => {
  const { user_id, topic, created_at, type, resources } = req.body;

  if (!user_id || !topic || !created_at || !resources) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const formattedCreatedAt = formatMySQLDateTime(created_at);
  const resource_type = type; // 'notes', 'articles', or 'videos'


  const sql = `INSERT INTO resources (user_id, topic, created_at, resource_type, subtopic, content)
               VALUES (?, ?, ?, ?, ?, ?)`;

  const insertValues = [];

  for (const [subtopic, contentTypes] of Object.entries(resources)) {
    for (const [type, content] of Object.entries(contentTypes)) {
      insertValues.push([
        user_id,
        topic,
        formattedCreatedAt,
        type,        // videos / articles / notes
        subtopic,    // actual subtopic name
        JSON.stringify(content)
      ]);
    }
  }
  


  let completed = 0;
  let errors = [];

  insertValues.forEach((values, idx) => {
    db.query(sql, values, (err) => {
      if (err) {
        console.error(`❌ DB error for row ${idx + 1}:`, err);
        errors.push(err);
      }
      completed++;
      if (completed === insertValues.length) {
        if (errors.length > 0) {
          return res.status(500).json({ error: "Some inserts failed", details: errors });
        }
        return res.json({ message: "✅ Resources saved successfully!" });
      }
    });
  });
};


const viewResources = async (req, res) => {
  try {
    const { user_id, topic, created_at } = req.query;
    const createdAt = formatMySQLDateTime(created_at);

    if (!user_id || !topic || !createdAt) {
      return res.status(400).json({ error: 'Missing query parameters' });
    }

    const query = `
      SELECT * FROM resources 
      WHERE user_id = ? AND topic = ? AND created_at = ?
    `;

    db.query(query, [user_id, topic, createdAt], (err, rows) => {
      if (err) {
        console.error('Error fetching resources:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: 'No resources found for this topic and date' });
      }

      return res.json(rows); // ✅ only this response is needed
    });

  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getResources, saveResources, viewResources };
