import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema({
  contact: {
    type: String,
    required: true,
    unique: true
  },

  platform: {
    type: String
  },

  scamType: {
    type: String
  },

  reportCount: {
    type: Number,
    default: 1
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Blacklist = mongoose.model("Blacklist", blacklistSchema);

export default Blacklist;