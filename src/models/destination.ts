import mongoose from 'mongoose'
const DestinationSchema = new mongoose.Schema({
  city: { type: String, required: true },
  country: { type: String, required: true },
  clues: { type: [String], required: true },
  fun_fact: { type: [String], required: true },
  trivia: { type: [String], required: true },
});

const Destination = mongoose.model("Destination", DestinationSchema, "destinations");
export default Destination;

