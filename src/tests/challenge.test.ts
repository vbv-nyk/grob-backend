// tests/challenge.test.ts
import request from "supertest";
import app from "../index";
import mongoose from "mongoose";
import Challenge from "../models/challenge";

describe("Challenge API", () => {

  it("should create a new challenge", async () => {
    const newChallenge = {
      username: "testUser",
      questions: [
        { questionId: new mongoose.Types.ObjectId(), correct: true },
        { questionId: new mongoose.Types.ObjectId(), correct: false },
      ],
      score: 10,
    };

    const response = await request("http://localhost:4000").post("/challenge/create").send(newChallenge);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("challengeId");
  });
});
