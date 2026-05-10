import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock data for search endpoints as requested
  const DUMMY_CITIES = [
    { name: "Paris", country: "France", cost_index: 85 },
    { name: "Tokyo", country: "Japan", cost_index: 120 },
    { name: "Dubai", country: "UAE", cost_index: 95 },
    { name: "Rome", country: "Italy", cost_index: 75 },
    { name: "London", country: "UK", cost_index: 110 },
    { name: "New York", country: "USA", cost_index: 130 },
    { name: "Bali", country: "Indonesia", cost_index: 45 },
    { name: "Santorini", country: "Greece", cost_index: 90 },
    { name: "Bangkok", country: "Thailand", cost_index: 55 }
  ];

  const DUMMY_ACTIVITIES: Record<string, any[]> = {
    "Paris": [
      { title: "Eiffel Tower Visit", cost: 25, category: "Sightseeing" },
      { title: "Seine River Cruise", cost: 40, category: "Experience" },
      { title: "Louvre Museum Tour", cost: 20, category: "Art & Culture" }
    ],
    "Tokyo": [
      { title: "Sushi Making Class", cost: 60, category: "Food" },
      { title: "Mount Fuji Day Trip", cost: 80, category: "Adventure" },
      { title: "Shibuya Crossing Photo Op", cost: 0, category: "Sightseeing" }
    ],
    "Dubai": [
      { title: "Burj Khalifa Observation Deck", cost: 50, category: "Sightseeing" },
      { title: "Desert Safari & BBQ", cost: 120, category: "Adventure" }
    ],
    "Rome": [
      { title: "Colosseum Tour", cost: 35, category: "History" },
      { title: "Vatican Museum", cost: 30, category: "Art" },
      { title: "Pasta Making Workshop", cost: 55, category: "Food" }
    ],
    "London": [
      { title: "London Eye Flight", cost: 45, category: "Viewing" },
      { title: "Tower Bridge Walk", cost: 20, category: "Sightseeing" }
    ],
    "Bali": [
      { title: "Ubud Monkey Forest", cost: 10, category: "Nature" },
      { title: "Surfing at Kuta", cost: 30, category: "Adventure" }
    ]
  };

  // API Routes
  app.get("/api/search/cities", (req, res) => {
    res.json(DUMMY_CITIES);
  });

  app.get("/api/search/activities", (req, res) => {
    const city = req.query.city as string;
    if (city) {
      const foundCity = Object.keys(DUMMY_ACTIVITIES).find(k => k.toLowerCase() === city.toLowerCase());
      if (foundCity) {
        res.json(DUMMY_ACTIVITIES[foundCity]);
      } else {
        // Return some generic activities if city not explicitly mapped
        res.json([
          { title: `${city} City Tour`, cost: 30, category: "Sightseeing" },
          { title: "Local Market Dinner", cost: 45, category: "Food" },
          { title: "Walking Photography Trail", cost: 0, category: "Experience" }
        ]);
      }
    } else {
      res.json([]);
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
