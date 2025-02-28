import mongoose from "mongoose";

const ChallengeSchema = new mongoose.Schema({
  username: { type: String, required: true },
  questions: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Destination", required: true },
      correct: { type: Boolean, required: true },
    },
  ],
  score: { type: Number, required: true },
}, { timestamps: true });

const Challenge = mongoose.model("Challenge", ChallengeSchema);
export default Challenge;
