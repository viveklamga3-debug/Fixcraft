import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("fixcraft.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS guides (
    id TEXT PRIMARY KEY,
    category_id TEXT,
    title TEXT NOT NULL,
    summary TEXT,
    difficulty TEXT,
    time_estimate TEXT,
    cost_estimate TEXT,
    image_url TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guide_id TEXT,
    step_number INTEGER,
    title TEXT,
    content TEXT,
    image_url TEXT,
    FOREIGN KEY (guide_id) REFERENCES guides(id)
  );

  CREATE TABLE IF NOT EXISTS diagnostic_questions (
    id TEXT PRIMARY KEY,
    category_id TEXT,
    question TEXT NOT NULL,
    step_number INTEGER NOT NULL,
    parent_option_id TEXT
  );

  CREATE TABLE IF NOT EXISTS diagnostic_options (
    id TEXT PRIMARY KEY,
    question_id TEXT,
    label TEXT NOT NULL,
    next_question_id TEXT,
    result_guide_id TEXT,
    FOREIGN KEY (question_id) REFERENCES diagnostic_questions(id)
  );
`);

// Seed Data
const seed = () => {
  const categoriesCount = db.prepare("SELECT count(*) as count FROM categories").get() as { count: number };
  if (categoriesCount.count > 0) return;

  const insertCategory = db.prepare("INSERT INTO categories (id, name, icon, description) VALUES (?, ?, ?, ?)");
  insertCategory.run("electronics", "Electronics", "Cpu", "Smartphones, laptops, and gadgets.");
  insertCategory.run("clothing", "Clothing", "Shirt", "Denim, zippers, and knitwear.");
  insertCategory.run("furniture", "Furniture", "Table", "Wooden chairs, tables, and upholstery.");
  insertCategory.run("appliances", "Appliances", "Zap", "Toasters, blenders, and washing machines.");
  insertCategory.run("bicycles", "Bicycles", "Bike", "Brakes, chains, and flat tires.");

  const insertGuide = db.prepare("INSERT INTO guides (id, category_id, title, summary, difficulty, time_estimate, cost_estimate, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  insertGuide.run("iphone-battery", "electronics", "iPhone Battery Replacement", "Give your old phone a new life with a fresh battery.", "Intermediate", "45 mins", "$25 - $40", "https://picsum.photos/seed/iphone/800/600");
  insertGuide.run("jeans-patch", "clothing", "Repairing a Hole in Jeans", "Classic sashiko-style patching for durable denim.", "Beginner", "30 mins", "$5", "https://picsum.photos/seed/jeans/800/600");
  insertGuide.run("bike-chain", "bicycles", "Cleaning and Lubing a Bike Chain", "Essential maintenance for a smooth ride.", "Beginner", "20 mins", "$10", "https://picsum.photos/seed/bike/800/600");

  const insertStep = db.prepare("INSERT INTO steps (guide_id, step_number, title, content) VALUES (?, ?, ?, ?)");
  insertStep.run("iphone-battery", 1, "Power Off", "Completely shut down the device before starting.");
  insertStep.run("iphone-battery", 2, "Remove Pentalobe Screws", "Use a specialized pentalobe screwdriver to remove the two screws at the bottom.");
  insertStep.run("iphone-battery", 3, "Open the Display", "Carefully apply heat and use a suction cup to lift the screen.");

  // Diagnostic Data
  const insertDiagQ = db.prepare("INSERT INTO diagnostic_questions (id, category_id, question, step_number) VALUES (?, ?, ?, ?)");
  insertDiagQ.run("q1-electronics", "electronics", "What is the main issue with your device?", 1);
  
  const insertDiagOpt = db.prepare("INSERT INTO diagnostic_options (id, question_id, label, result_guide_id) VALUES (?, ?, ?, ?)");
  insertDiagOpt.run("opt1-battery", "q1-electronics", "Battery drains too fast", "iphone-battery");
  insertDiagOpt.run("opt1-screen", "q1-electronics", "Screen is cracked", null);
};

seed();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  app.get("/api/guides", (req, res) => {
    const { category, q } = req.query;
    let query = "SELECT * FROM guides";
    const params: any[] = [];

    if (category || q) {
      query += " WHERE";
      if (category) {
        query += " category_id = ?";
        params.push(category);
      }
      if (q) {
        if (category) query += " AND";
        query += " (title LIKE ? OR summary LIKE ?)";
        params.push(`%${q}%`, `%${q}%`);
      }
    }

    const guides = db.prepare(query).all(...params);
    res.json(guides);
  });

  app.get("/api/guides/:id", (req, res) => {
    const guide = db.prepare("SELECT * FROM guides WHERE id = ?").get(req.params.id);
    if (!guide) return res.status(404).json({ error: "Guide not found" });
    
    const steps = db.prepare("SELECT * FROM steps WHERE guide_id = ? ORDER BY step_number ASC").all(req.params.id);
    res.json({ ...guide, steps });
  });

  app.get("/api/diagnostic/start", (req, res) => {
    const { category_id } = req.query;
    const question = db.prepare("SELECT * FROM diagnostic_questions WHERE category_id = ? AND step_number = 1").get(category_id);
    if (!question) return res.status(404).json({ error: "No diagnostic found for this category" });

    const options = db.prepare("SELECT * FROM diagnostic_options WHERE question_id = ?").all(question.id);
    res.json({ question, options });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
