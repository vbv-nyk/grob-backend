import request from "supertest";

describe("Game API", () => {
  it("should return 10 random destinations", async () => {
    const response = await request("http://localhost:4000").get("/game/start");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(10);
    expect(response.body[0]).toHaveProperty("city");
    expect(response.body[0]).toHaveProperty("country");
  });

  it("should return 50 random city names", async () => {
    const response = await request("http://localhost:4000").get("/game/cities");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(50);
    expect(typeof response.body[0]).toBe("string");
  });
});
