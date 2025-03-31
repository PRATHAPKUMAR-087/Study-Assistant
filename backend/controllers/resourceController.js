const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const YOUTUBE_API_KEY = "YOUR_YOUTUBE_API_KEY"; // Replace with your YouTube API key
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

// ✅ Function to fetch YouTube search URL based on Activity & Topic
const getSearchUrl = async (req, res) => {
    const { activity, topic } = req.body; // Extract activity & topic

    try {
        const searchQuery = `${topic} ${activity} tutorial`; // Format query (e.g., "Java Variables Tutorial")
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

        res.status(200).json({ searchUrl });
    } catch (error) {
        console.error("Error generating YouTube search URL:", error);
        res.status(500).json({ error: "Failed to generate search URL" });
    }
};

module.exports = { getSearchUrl };
