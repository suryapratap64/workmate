import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { Worker } from "../models/worker.model.js";
import { Client } from "../models/client.model.js";

const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/workmate";

async function run() {
  await mongoose.connect(MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to DB");

  const workerResult = await Worker.updateMany(
    { email: "" },
    { $set: { email: null } }
  );
  console.log(
    "Workers updated:",
    workerResult.modifiedCount || workerResult.nModified || workerResult
  );

  const clientResult = await Client.updateMany(
    { email: "" },
    { $set: { email: null } }
  );
  console.log(
    "Clients updated:",
    clientResult.modifiedCount || clientResult.nModified || clientResult
  );

  await mongoose.disconnect();
  console.log("Done");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
