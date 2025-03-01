// routes/game.ts
import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Destination from "../models/destination";

const router = express.Router();
router.get("/start", async (req, res) => {
  try {
    // Fetch 10 random destinations for the test
    const destinations = await Destination.aggregate([{ $sample: { size: 10 } }]);

    // Fetch 50 random cities to use as distractors
    const distractorCities = await Destination.aggregate([
      { $sample: { size: 50 } },
      { $project: { city: 1, _id: 0 } }
    ]);

    // Function to pick 3 random incorrect answers
    const getDistractors = (correctCity: string) => {
      return distractorCities
        .map(d => d.city)
        .filter(city => city !== correctCity) // Avoid correct answer
        .sort(() => Math.random() - 0.5) // Shuffle
        .slice(0, 3);
    };

    // Structure the game data
    const gameData = destinations.map(dest => ({
      id: dest._id, // ID of the city object (used for verification)
      options: [dest.city, ...getDistractors(dest.city)].sort(() => Math.random() - 0.5), // Shuffle options
      funFact: dest.fun_fact[0], // Fun fact
      clue: dest.clues[0], // Hint for the player
    }));
    console.log(gameData)

    res.json(gameData); // Send full test as structured data

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post(
  "/submit-answer",
  [
    body("questionId").isMongoId().withMessage("Invalid question ID format"),
    body("selectedCity").trim().escape().notEmpty().withMessage("City name is required"),
  ],
  async (req: Request, res: Response): Promise<any> => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { questionId, selectedCity } = req.body;

      // Find the correct answer from the database
      const correctAnswer = await Destination.findById(questionId);

      if (!correctAnswer) {
        return res.status(404).json({ error: "Question not found" });
      }

      const isCorrect = correctAnswer.city === selectedCity;

      res.json({ correct: isCorrect, correctCity: correctAnswer.city });

    } catch (error) {
      console.error("Error in submit-answer:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
