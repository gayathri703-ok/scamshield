import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporterName: {
      type: String,
      required: true,
    },

    reporterEmail: {
      type: String,
      required: true,
    },

    institution: {
      type: String,
    },

    scamType: {
      type: String,
      required: true,
    },

    platform: {
      type: String,
      required: true,
    },

    scammerContact: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    screenshots: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["pending", "investigating", "verified", "resolved"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;