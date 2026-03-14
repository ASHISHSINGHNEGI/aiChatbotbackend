import type mongoose from "mongoose";
import Message from "../models/Message.js";

export function history() {
  return async (req, res) => {
    const { sessionId } = req.params;
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
