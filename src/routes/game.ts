// routes/game.ts
import express from "express";
import Destination from "../models/DestinationSchema";
import mongoose from "mongoose";

const router = express.Router();

router.get("/clue", async (req, res) => {
  try {
    const destinations = await Destination.aggregate([{ $sample: { size: 10 } }]);
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/guess", (req, res) => {
  res.send("Guess submitted");
});

router.get("/next", (req, res) => {
  res.send("Next question");
});

export default router;