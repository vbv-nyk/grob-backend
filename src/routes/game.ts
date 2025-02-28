// routes/game.ts
import express from "express";
import Destination from "../models/destination";
import mongoose from "mongoose";

const router = express.Router();

router.get("/start", async (req, res) => {
  try {
    const destinations = await Destination.aggregate([{ $sample: { size: 10 } }]);
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }

});

// Fetch a larger pool of city names for distractors
router.get("/cities", async (req, res) => {
  try {
    const cities = await Destination.aggregate([
      { $sample: { size: 50 } },
      { $project: { city: 1, _id: 0 } } // Only return city names
    ]);
    res.json(cities.map(c => c.city));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});



export default router;