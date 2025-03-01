import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import gameRouter from '../routes/game';
import Destination from '../models/destination';

// Mock data for destinations
const mockDestinations = [
  {
    _id: new mongoose.Types.ObjectId(),
    city: 'Paris',
    country: 'France',
    fun_fact: ['The Eiffel Tower was originally built as a temporary structure'],
    clues: ['This city is known as the City of Light']
  },
  {
    _id: new mongoose.Types.ObjectId(),
    city: 'Tokyo',
    country: 'Japan',
    fun_fact: ['This city has the most Michelin-starred restaurants in the world'],
    clues: ['This city hosted the Olympics twice']
  },
  {
    _id: new mongoose.Types.ObjectId(),
    city: 'New York',
    country: 'USA',
    fun_fact: ['Over 800 languages are spoken in this city'],
    clues: ['This city is home to the Statue of Liberty']
  }
];

// Create additional mock cities for distractors (50 total required by the code)
const cityNames = [
  'London', 'Berlin', 'Madrid', 'Rome', 'Moscow', 'Beijing', 'Sydney', 'Cairo',
  'Dubai', 'Mumbai', 'Singapore', 'Rio de Janeiro', 'Mexico City', 'Toronto',
  'Los Angeles', 'Chicago', 'Barcelona', 'Amsterdam', 'Istanbul', 'Seoul',
  'Bangkok', 'Vienna', 'Prague', 'Athens', 'Dublin', 'Copenhagen', 'Oslo',
  'Helsinki', 'Stockholm', 'Warsaw', 'Budapest', 'Lisbon', 'Brussels', 'Zurich',
  'Geneva', 'Monaco', 'Vancouver', 'Montreal', 'Quebec', 'Ottawa', 'Miami',
  'San Francisco', 'Seattle', 'Denver', 'Dallas', 'Austin', 'Boston', 'Atlanta'
];

const createMockCities = () => {
  return cityNames.map(city => ({
    _id: new mongoose.Types.ObjectId(),
    city: city,
    country: 'Country',
    fun_fact: ['Fun fact about ' + city],
    clues: ['Clue about ' + city]
  }));
};

describe('Game Routes', () => {
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
    app.use('/game', gameRouter);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections before each test
    await mongoose.connection.db?.dropDatabase();
    
    // Insert mock data
    await Destination.insertMany([...mockDestinations, ...createMockCities()]);
  });

  describe('GET /game/start', () => {
    it('should return 10 random destinations with required fields', async () => {
      const response = await request(app).get('/game/start');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(10);
      
      // Check structure of each game data object
      response.body.forEach((item: any) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('options');
        expect(item).toHaveProperty('funFact');
        expect(item).toHaveProperty('clue');
        
        // Options should be an array of 4 cities
        expect(Array.isArray(item.options)).toBe(true);
        expect(item.options.length).toBe(4);
        
        // Each option should be a string
        item.options.forEach((option: any) => {
          expect(typeof option).toBe('string');
        });
      });
    });

    it('should handle server errors', async () => {
      // Mock Destination.aggregate to throw an error
      const originalAggregate = Destination.aggregate;
      Destination.aggregate = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get('/game/start');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal Server Error');
      
      // Restore the original method
      Destination.aggregate = originalAggregate;
    });
  });

  describe('POST /game/submit-answer', () => {
    it('should correctly verify a right answer', async () => {
      const destination = mockDestinations[0];
      
      const response = await request(app)
        .post('/game/submit-answer')
        .send({
          questionId: destination._id.toString(),
          selectedCity: destination.city
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('correct', true);
      expect(response.body).toHaveProperty('correctCity', destination.city);
    });

    it('should correctly identify a wrong answer', async () => {
      const destination = mockDestinations[0];
      
      const response = await request(app)
        .post('/game/submit-answer')
        .send({
          questionId: destination._id.toString(),
          selectedCity: 'WrongCity'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('correct', false);
      expect(response.body).toHaveProperty('correctCity', destination.city);
    });

    it('should handle non-existent question IDs', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .post('/game/submit-answer')
        .send({
          questionId: nonExistentId,
          selectedCity: 'SomeCity'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Question not found');
    });

    it('should validate the input data', async () => {
      // Test with invalid mongoID
      const badIdResponse = await request(app)
        .post('/game/submit-answer')
        .send({
          questionId: 'not-a-mongo-id',
          selectedCity: 'Paris'
        });

      expect(badIdResponse.status).toBe(400);
      expect(badIdResponse.body).toHaveProperty('errors');
      
      // Test with missing city
      const missingCityResponse = await request(app)
        .post('/game/submit-answer')
        .send({
          questionId: new mongoose.Types.ObjectId().toString(),
          selectedCity: ''
        });

      expect(missingCityResponse.status).toBe(400);
      expect(missingCityResponse.body).toHaveProperty('errors');
    });

    it('should handle server errors', async () => {
      // Mock Destination.findById to throw an error
      const originalFindById = Destination.findById;
      Destination.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/game/submit-answer')
        .send({
          questionId: new mongoose.Types.ObjectId().toString(),
          selectedCity: 'Paris'
        });
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal Server Error');
      
      // Restore the original method
      Destination.findById = originalFindById;
    });
  });
});