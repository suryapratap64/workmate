import { Client } from "../models/client.model.js";
import { Worker } from "../models/worker.model.js";
import { Payment } from "../models/payment.model.js";
import mongoose from "mongoose";

// Get wallet balance and recent transactions for the authenticated user (clients use this)
export const getWallet = async (req, res) => {
  try {
    const { userId, userType } = req.user;
    if (userType !== "client") {
      return res
        .status(403)
        .json({ success: false, message: "Only clients have wallets" });
    }
    const client = await Client.findById(userId).select(
      "walletBalance firstName lastName"
    );
    if (!client)
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });

    const payments = await Payment.find({ user: client._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res
      .status(200)
      .json({
        success: true,
        wallet: { balance: client.walletBalance, currency: "INR" },
        transactions: payments,
      });
  } catch (error) {
    console.error("getWallet error", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Deposit funds into client wallet (simulate bank payment)
export const depositFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    const { userId, userType } = req.user;
    if (userType !== "client") {
      return res
        .status(403)
        .json({ success: false, message: "Only clients can deposit funds" });
    }
    if (!amount || Number(amount) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    const client = await Client.findById(userId);
    if (!client)
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });

    client.walletBalance = (client.walletBalance || 0) + Number(amount);
    await client.save();

    await Payment.create({
      user: client._id,
      type: "deposit",
      amount: Number(amount),
      currency: "INR",
      metadata: { source: "manual" },
    });

    return res
      .status(200)
      .json({
        success: true,
        wallet: { balance: client.walletBalance, currency: "INR" },
      });
  } catch (error) {
    console.error("depositFunds error", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Payout to worker when client approves worker for job (this is a simplified flow)
export const payoutToWorker = async (req, res) => {
  try {
    const { clientId, workerId, amount } = req.body;

    if (!clientId || !workerId || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "Missing parameters" });
    }

    const client = await Client.findById(clientId);
    const worker = await Worker.findById(workerId);
    if (!client || !worker) {
      return res
        .status(404)
        .json({ success: false, message: "Client or Worker not found" });
    }

    const parsed = Number(amount);
    if (client.walletBalance < parsed) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Insufficient funds in client wallet",
        });
    }

    // debit client
    client.walletBalance -= parsed;
    await client.save();

    // credit worker earnings and wallet
    worker.totalEarnings = (worker.totalEarnings || 0) + parsed;
    worker.walletBalance = (worker.walletBalance || 0) + parsed;
    await worker.save();

    // create payment records
    await Payment.create({
      user: client._id,
      type: "payout",
      amount: parsed,
      currency: "INR",
      metadata: { toWorker: worker._id },
    });

    return res
      .status(200)
      .json({
        success: true,
        message: "Payout successful",
        clientWallet: client.walletBalance,
        workerWallet: worker.walletBalance,
      });
  } catch (error) {
    console.error("payoutToWorker error", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
