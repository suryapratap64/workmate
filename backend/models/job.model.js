import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  prize: { type: String, required: true },
  location: { type: String, required: true },
  verified: { type: Boolean, default: false },
  images: { type: [String], default: [] },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  applicants: [
    {
      worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },
      coverLetter: { type: String, default: "" },
      status: {
        type: String,
        enum: ["applied", "accepted", "rejected"],
        default: "applied",
      },
      appliedAt: { type: Date, default: Date.now },
    },
  ],
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Job", jobSchema);
