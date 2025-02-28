// routes/leaderboard.ts
import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Leaderboard data");
});

export default router