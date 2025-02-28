import request from "supertest";
import httpServer from "../index"; // Import the HTTP server instance

describe("Game API", () => {
  it("should return 10 random destinations", async () => {
    const response = await request("http://localhost:4000").get("/game/clue");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(10);
    expect(response.body[0]).toHaveProperty("city");
    expect(response.body[0]).toHaveProperty("country");
  });
});
