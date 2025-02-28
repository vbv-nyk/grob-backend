// routes/challenge.ts
import express from "express";
import Challenge from "../models/challenge";

const router = express.Router();

router.post("/create", async (req, res) : Promise<any> => {
  try {
    const { username, questions, score } = req.body;
    if (!username || !questions || !Array.isArray(questions) || score === undefined) {
      return res.status(400).json({ error: "Invalid request data" });
    }
    
    const challenge = new Challenge({ username, questions, score });
    console.log(challenge)
    await challenge.save();
    res.status(201).json({ challengeId: challenge._id });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:challengeId", async (req, res) : Promise<any> => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId);
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router