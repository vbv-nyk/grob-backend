import request from "supertest";
import app from "../index";
import mongoose from "mongoose";
import Challenge from "../models/challenge";
import dotenv from "dotenv";
import Destination from "../models/destination";
dotenv.config();

jest.setTimeout(30000); // ✅ Increase Jest timeout to 30 seconds

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

    const response = await request("http://localhost:4000")
      .post("/challenge/create")
      .send(newChallenge);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("challengeId");
  });
});

describe("GET /challenge/:challengeId", () => {
  let challengeId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.TEST_DB_URL as string);
    }

    // ✅ Ensure database connection before proceeding
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Small delay for stability

    // ✅ Create mock destinations with required fields
    const destination1 = await Destination.create({
      name: "Paris",
      country: "France",
      city: "Paris",
    });

    const destination2 = await Destination.create({
      name: "Tokyo",
      country: "Japan",
      city: "Tokyo",
    });

    // ✅ Create a challenge with these destinations
    const challenge = await Challenge.create({
      username: "testUser",
      questions: [
        { questionId: destination1._id, correct: true },
        { questionId: destination2._id, correct: false },
      ],
      score: 10,
    });

    challengeId = challenge._id.toString();
  });

  it("should return challenge destinations with correct field", async () => {
    const response = await request("http://localhost:4000").get(`/challenge/${challengeId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // Check if response includes `correct` field
    response.body.forEach((destination: any) => {
      expect(destination).toHaveProperty("correct");
      expect(typeof destination.correct).toBe("boolean");
    });
  });

  it("should return 404 for a non-existent challenge", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await request("http://localhost:4000").get(`/challenge/${fakeId}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Challenge not found" });
  });
});
