// routes/users.ts
import express from "express";
const router = express.Router();

router.post("/register", (req, res) => {
  res.send("User registered");
});

router.get("/:username", (req, res) => {
  res.send("User profile data");
});

export default router;