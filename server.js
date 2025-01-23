import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const REDDIT_API_URL = "https://www.reddit.com/search.json";

// Define a route for fetching Reddit data
app.get("/api/search", async (req, res) => {
  const { q } = req.query; // Get the 'q' parameter from the query string
  if (!q) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  try {
    // Create the query string for the Reddit API
    const params = new URLSearchParams({
      q, // The keyword to search
      sort: "new", // Sort by new posts
      limit: "25", // Limit the number of posts
      t: "week", // Posts from the last week
    });

    // Fetch data from the Reddit API
    const response = await fetch(`${REDDIT_API_URL}?${params.toString()}`, {
      headers: {
        "User-Agent": "subviz/1.0 by Difficult-Food479", // Required header for Reddit API
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Reddit data: ${response.statusText}`);
    }

    const data = await response.json(); // Parse the response as JSON
    res.json(data); // Send the data back to the frontend
  } catch (error) {
    console.error("Error fetching Reddit data:", error);
    res.status(500).json({ error: "Failed to fetch data from Reddit" });
  }
});

// Start the server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
