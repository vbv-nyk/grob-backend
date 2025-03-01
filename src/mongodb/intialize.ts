const { MongoClient, ServerApiVersion } = require('mongodb');
import dotenv from "dotenv";
import mongoose, { Mongoose } from "mongoose";
dotenv.config();


const uri = process.env.RUNTIME === 'prod' ?
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.am3ap.mongodb.net/Cluster0?retryWrites=true&w=majority&appName=Cluster0` :
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.am3ap.mongodb.net/test?retryWrites=true&w=majority&appName=test`;


async function run() {
    try {
        await mongoose.connect(uri);
        console.log("[Server]: Connected to MongoDB")
    } catch {
        // Ensures that the client will close when you finish/error
        console.log("[Error]: Error connecting to MongoDB");
    }
}


export async function initializeMongoDB() {
    await run().catch(console.dir);
}