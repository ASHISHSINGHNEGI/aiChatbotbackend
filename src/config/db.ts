// lib/mongoose.ts or utils/db.ts
import mongoose from "mongoose";

declare global {
  var mongoose:
    | {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
      }
    | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Reset if connection exists but is disconnected
if (cached.conn && cached.conn.readyState === 0) {
  console.log("🔄 Connection disconnected, resetting cache");
  cached.conn = null;
  cached.promise = null;
}

export async function connect(): Promise<mongoose.Connection> {
  const MONGODB_URI = process.env.MONGO_URI as string;
  const dbName = process.env.DB_NAME;

  if (!cached) {
    throw new Error("Global mongoose cache is undefined");
  }

  if (cached.conn) {
    console.log("🚀 Using cached MongoDB connection");
    return cached.conn;
  }

  if (!dbName) {
    throw new Error("Db name Invalid");
  }

  if (!cached.promise) {
    if (!MONGODB_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    console.log("✨ Creating new MongoDB connection promise");
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName,
        serverSelectionTimeoutMS: 30000, // Reduce from 30s to 10s
        socketTimeoutMS: 45000,
        // bufferCommands: false, // ← CRITICAL: Disable buffering
        maxPoolSize: 5, // Limit connection pool
        minPoolSize: 1,
      })
      .then((mongoose) => {
        console.log("✅ Connected to MongoDB");
        cached.conn = mongoose.connection;
        return mongoose.connection;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        // Reset promise on error to allow future retries
        cached.promise = null;
        throw err;
      });
  }

  console.log("⏳ Awaiting existing MongoDB connection promise");
  return await cached.promise;
}

export async function disconnect(): Promise<void> {
  if (!cached) {
    return;
  }

  if (cached.conn) {
    await cached.conn.close();
    cached.conn = null;
  }
  cached.promise = null;
  console.log("🛑 Disconnected from MongoDB");
}
