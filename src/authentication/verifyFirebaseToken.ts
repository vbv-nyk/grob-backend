import { NextFunction, Request, Response } from "express";
import admin from "./initializeFirebase";

const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const authHeader = req.headers['authorization']
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }
        // Assuming the token is in the format: "Bearer <token>"
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token missing from Authorization header' });
        }
        next()
    } catch (error) {
        console.error("Error verifying token", error);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

export default verifyFirebaseToken;