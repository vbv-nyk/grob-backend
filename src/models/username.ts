import mongoose from "mongoose";

const UsernameSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true }
});

export const Username = mongoose.model("Username", UsernameSchema);
