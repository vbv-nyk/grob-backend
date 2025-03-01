import mongoose from "mongoose";

const ChallengeSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    questions: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Destination", required: true }, // City ID
        options: { type: [String], required: true }, // 4 shuffled answer choices
        funFact: { type: String, required: true }, // Fun fact about the city
        clue: { type: String, required: true }, // Clue for the player
        correct: { type: Boolean, default: null }, // Stores user's answer correctness
      },
    ],
    score: { type: Number, required: true },
  },
  { timestamps: true }
);


const Challenge = mongoose.model("Challenge", ChallengeSchema);
export default Challenge;
