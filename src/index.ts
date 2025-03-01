// index.ts (Updated)
import fs from 'fs';
import http from "http";
import rateLimit from "express-rate-limit";
import https from 'https';
import express, { Express, Request, Response } from 'express';
import dotenv from "dotenv";
import { initializeMongoDB } from './mongodb/intialize';
import gameRouter from "./routes/game";
import challengeRouter from "./routes/challenge";
import cors from "cors"

dotenv.config();
initializeMongoDB();

const privateKey = fs.readFileSync('./privkey1.pem', 'utf8');
const certificate = fs.readFileSync('./cert1.pem', 'utf8');
const ca = fs.readFileSync('./chain1.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate, ca: ca };
const app = express();
app.use(cors())

app.use(express.json());
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 10, // Allow 10 requests per minute per IP
    message: "Too many requests, please try again later.",
});

app.use('/game', limiter, gameRouter);
app.use('/challenge', challengeRouter);

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(4000, () => console.log('HTTP Server running on port 4000'));
httpsServer.listen(3000, () => console.log('HTTPS Server running on port 3000'));

export default httpServer