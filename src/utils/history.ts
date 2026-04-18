import mongoose from "mongoose";
import type { Request, Response } from "express";
import Message from "../models/Message.js";

export function history() {
  return async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId!;
    console.log("[GET /history] Requested sessionId:", sessionId);

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      console.warn("[GET /history] Invalid sessionId format:", sessionId);
      return res.status(400).json({ error: "Invalid session ID" });
    }

    try {
      const messages = await Message.find({ conversationId: sessionId }).sort({
        createdAt: 1,
      });
      console.log(
        "[GET /history] ✅ Returning",
        messages.length,
        "messages for sessionId:",
        sessionId,
      );
      res.json(messages);
    } catch (error) {
      console.error("[GET /history] ❌ Error fetching history:", error);
      res.status(500).json({ error: "Failed to retrieve history." });
    }
  };
}
