// routes/challenge.ts
import express from "express";
import Challenge from "../models/challenge";
import Destination from "../models/destination";
import { Username } from "../models/username";

const router = express.Router();


router.post("/create", async (req, res): Promise<any> => {
  try {
    const { username, questions, score } = req.body;

    // Validate request data
    if (!username || !questions || !Array.isArray(questions) || score === undefined) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Check if username already exists
    const existingUser = await Username.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Save username to the usernames collection
    const newUser = new Username({ username });
    await newUser.save();

    // Save challenge to the challenges collection
    const challenge = new Challenge({ username, questions, score });
    await challenge.save();

    res.status(201).json({ challengeId: challenge._id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/:challengeId", async (req, res): Promise<any> => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId);

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    // Extract the questionIds from the challenge
    const questionIds = challenge.questions.map(q => q.questionId);

    // Fetch the 10 destinations that match these questionIds
    const destinations = await Destination.find({ _id: { $in: questionIds } }).limit(10);

    // Map each destination with its correctness status
    const results = destinations.map(destination => {
      const question = challenge.questions.find(q => q.questionId.equals(destination._id));
      return {
        ...destination.toObject(),
        correct: question ? question.correct : false, // Default false if no match
      };
    });

    res.json({ challenger: { username: challenge.username, score: challenge.score }, questions: results });
  } catch (error) {
    console.error("Error fetching challenge:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router