// routes/challenge.ts
import express from "express";
const router = express.Router();

router.post("/create", (req, res) => {
  res.send("Challenge created");
});

router.get("/:challengeId", (req, res) => {
  res.send("Challenge details");
});

export default router;
