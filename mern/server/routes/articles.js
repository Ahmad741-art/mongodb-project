import express from "express";
import Article from "../models/Article.js";

const router = express.Router();

// GET all
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET one
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch { res.status(400).json({ message: "Invalid article ID" }); }
});

// POST
router.post("/", async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT
router.put("/:id", async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch { res.status(400).json({ message: "Invalid article ID" }); }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json({ message: "Article deleted" });
  } catch { res.status(400).json({ message: "Invalid article ID" }); }
});

export default router;
