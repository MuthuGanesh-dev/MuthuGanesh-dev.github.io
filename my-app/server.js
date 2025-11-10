import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// API endpoint to save projects
app.post("/api/projects", async (req, res) => {
  try {
    const { projects } = req.body;
    const filePath = path.join(__dirname, "public", "projects.json");

    await fs.writeFile(
      filePath,
      JSON.stringify({ projects }, null, 2),
      "utf-8"
    );

    res.json({ success: true, message: "Projects saved successfully" });
  } catch (error) {
    console.error("Error saving projects:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to save projects" });
  }
});

// API endpoint to get projects
app.get("/api/projects", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "public", "projects.json");
    const data = await fs.readFile(filePath, "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading projects:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load projects" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API Server running on http://localhost:${PORT}`);
  console.log(`📁 Projects will be saved to: public/projects.json`);
});
