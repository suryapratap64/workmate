import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  type: {
    type: String,
    enum: ["deposit", "withdraw", "payout"],
    required: true,
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

export const Payment = mongoose.model("Payment", paymentSchema);
