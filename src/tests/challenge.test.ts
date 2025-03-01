import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import challengeRouter from '../routes/challenge';
import Challenge from '../models/challenge';
import { Username } from '../models/username';

describe('Challenge Routes', () => {
    let app: express.Application;
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        // Set up MongoDB Memory Server
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();

        await mongoose.connect(uri);

        // Set up the express app
        app = express();
        app.use(express.json());
        app.use('/challenge', challengeRouter);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        // Clear all collections before each test
        await mongoose.connection.db?.dropDatabase();
    });

    describe('POST /challenge/create', () => {
        it('should create a new challenge and username', async () => {
            const mockChallenge = {
                username: 'testUser',
                questions: [
                    {
                        id: new mongoose.Types.ObjectId(),
                        options: ['Option1', 'Option2', 'Option3', 'Option4'],
                        funFact: 'Fun fact',
                        clue: 'Clue',
                        correct: null
                    }
                ],
                score: 100
            };

            const response = await request(app)
                .post('/challenge/create')
                .send(mockChallenge);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('challengeId');

            // Verify the challenge was saved
            const challenge = await Challenge.findById(response.body.challengeId);
            expect(challenge).toBeTruthy();
            expect(challenge?.username).toBe(mockChallenge.username);
            expect(challenge?.score).toBe(mockChallenge.score);

            // Verify the username was saved
            const username = await Username.findOne({ username: mockChallenge.username });
            expect(username).toBeTruthy();
        });

        it('should return 400 for invalid request data', async () => {
            const invalidChallenge = {
                username: 'testUser',
                questions: 'not an array',
                score: 'not a number'
            };

            const response = await request(app)
                .post('/challenge/create')
                .send(invalidChallenge);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid request data');
        });

        it('should return 400 if username already exists', async () => {
            const mockUsername = 'testUser';
            await new Username({ username: mockUsername }).save();

            const mockChallenge = {
                username: mockUsername,
                questions: [
                    {
                        id: new mongoose.Types.ObjectId(),
                        options: ['Option1', 'Option2', 'Option3', 'Option4'],
                        funFact: 'Fun fact',
                        clue: 'Clue',
                        correct: null
                    }
                ],
                score: 100
            };

            const response = await request(app)
                .post('/challenge/create')
                .send(mockChallenge);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Username already taken');
        });

        it('should handle server errors', async () => {
            // Mock Username.findOne to throw an error
            const originalFindOne = Username.findOne;
            Username.findOne = jest.fn().mockImplementation(() => {
                throw new Error('Database error');
            });

            const mockChallenge = {
                username: 'testUser',
                questions: [
                    {
                        id: new mongoose.Types.ObjectId(),
                        options: ['Option1', 'Option2', 'Option3', 'Option4'],
                        funFact: 'Fun fact',
                        clue: 'Clue',
                        correct: null
                    }
                ],
                score: 100
            };

            const response = await request(app)
                .post('/challenge/create')
                .send(mockChallenge);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal Server Error');

            // Restore the original method
            Username.findOne = originalFindOne;
        });
    });

    describe('GET /challenge/:challengeId', () => {
        it('should return the challenge details', async () => {
            const mockChallenge = {
                username: 'testUser',
                questions: [
                    {
                        _id: new mongoose.Types.ObjectId().toString(),
                        id: new mongoose.Types.ObjectId().toString(),
                        options: ['Option1', 'Option2', 'Option3', 'Option4'],
                        funFact: 'Fun fact',
                        clue: 'Clue',
                        correct: null
                    }
                ],
                score: 100
            };

            const challenge = await new Challenge(mockChallenge).save();

            const response = await request(app)
                .get(`/challenge/${challenge._id}`);

            console.log(response.body.questions, mockChallenge.questions)
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('challenger');
            expect(response.body.challenger.username).toBe(mockChallenge.username);
            expect(response.body.challenger.score).toBe(mockChallenge.score);
            expect(response.body).toHaveProperty('questions');
            expect(response.body.questions).toEqual(mockChallenge.questions);
        });

        it('should return 404 if challenge not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();

            const response = await request(app)
                .get(`/challenge/${nonExistentId}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Challenge not found');
        });

        it('should handle server errors', async () => {
            // Mock Challenge.findById to throw an error
            const originalFindById = Challenge.findById;
            Challenge.findById = jest.fn().mockImplementation(() => {
                throw new Error('Database error');
            });

            const nonExistentId = new mongoose.Types.ObjectId().toString();

            const response = await request(app)
                .get(`/challenge/${nonExistentId}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal Server Error');

            // Restore the original method
            Challenge.findById = originalFindById;
        });
    });
});