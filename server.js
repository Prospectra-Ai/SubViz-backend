import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const REDDIT_API_URL = "https://oauth.reddit.com/search";
const TOKEN_URL = "https://www.reddit.com/api/v1/access_token";

// Replace these with your Reddit app credentials
const CLIENT_ID = "9182e1htJyHrD-nmJjORVQ";
const CLIENT_SECRET = "qfj0LBE5u9XekH043N3NqGhqcYFuvQ";

// Function to get an OAuth2 token
const getRedditToken = async () => {
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64"
  );
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to obtain Reddit token");
  }

  const data = await response.json();
  return data.access_token; // Return the token
};

// Define a route for fetching Reddit data
app.get("/api/search", async (req, res) => {
  const { q } = req.query; // Get the 'q' parameter from the query string
  if (!q) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  try {
    const token = await getRedditToken(); // Get OAuth2 token

    // Create the query string for the Reddit API
    const params = new URLSearchParams({
      q, // The keyword to search
      sort: "hot", // Sort by new posts
      limit: "25", // Limit the number of posts
      t: "week", // Posts from the last week
    });

    // Fetch data from the Reddit API
    const response = await fetch(`${REDDIT_API_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the OAuth2 token
        "User-Agent": "subViz/1.0",
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
