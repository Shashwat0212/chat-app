import mongoose from "mongoose";
const chatSchema = new mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
  recieved: Boolean,
});

export default mongoose.model("messagecontents", chatSchema);
