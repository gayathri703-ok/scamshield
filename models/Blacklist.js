import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema(
  {
    scammerContact: {
      type: String,
      required: true,
    },

    scamType: {
      type: String,
      required: true,
    },

    platform: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Blacklist = mongoose.model(
  "Blacklist",
  blacklistSchema
);

export default Blacklist;