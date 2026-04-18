import type { Request, Response } from "express";
import { Types } from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { fetchWithRetry } from "./fetchWithRetry.js";

export function message() {
  return async (req: Request, res: Response) => {
    console.log(
      "[POST /message] Incoming request body:",
      JSON.stringify(req.body, null, 2),
    );
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
    const systemPrompt = process.env.SYSTEM_PROMPT;
    if (!systemPrompt) {
      console.log("Check env variable!!!!");
      return res
        .status(400)
        .json({ error: "Undefined Env variable: SYSTEM_PROMPT" });
    }
    console.log("[POST /message] Using model:", model);
    console.log("[POST /message] Using system prompt:", systemPrompt);

    if (!apiKey) {
      console.log("Check env variable!!!!");
      return res
        .status(400)
        .json({ error: "Undefined Env variable: GEMINI_API_KEY" });
    }

    const { conversationId, message } = req.body;
    console.log(
      "[POST /message] Extracted fields — conversationId:",
      conversationId,
      "| message:",
      message,
    );

    if (!message) {
      console.error(
        "[POST /message] Validation failed: message content is missing.",
      );
      return res.status(400).json({ error: "Message content is required." });
    }

    try {
      let conversation;
      if (conversationId && Types.ObjectId.isValid(conversationId)) {
        console.info(
          "[POST /message] Valid conversationId found:",
          conversationId,
        );
        conversation = await Conversation.findById(conversationId);
        console.log(
          "[POST /message] Conversation lookup result:",
          conversation ? `found (_id: ${conversation._id})` : "not found in DB",
        );
      } else if (conversationId) {
        console.warn(
          "[POST /message] Provided conversationId is not a valid ObjectId:",
          conversationId,
        );
      }
      if (!conversation) {
        console.warn(
          "Warning: no conversation found as no session id found in db, creating a new conversation",
        );
        conversation = await Conversation.create({});
        console.log({
          message: "created conversation",
          data: conversation,
        });
      }
      const newMessage = await Message.create({
        conversationId: conversation._id,
        role: "user",
        content: message,
      });
      console.log(
        "[POST /message] User message stored with id:",
        newMessage._id,
      );
      console.log(
        "[POST /message] Fetching message history for conversationId:",
        conversation._id,
      );
      const historyDocs = await Message.find({
        conversationId: conversation._id,
      })
        .sort({ createdAt: 1 })
        .lean();
      console.log(
        "[POST /message] History retrieved — total messages:",
        historyDocs.length,
      );

      // Map history to Gemini format: { role: "user" | "model", parts: [{ text: "" }] }
      // Note: Gemini uses "model" instead of "assistant"
      const contents = historyDocs.map((msg) => ({
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));
      console.log({
        message: "history",
        data: contents,
      });

      //call for gemini
      console.log("[POST /message] Calling Gemini via fetchWithRetry...");
      const result = await fetchWithRetry(contents, systemPrompt);
      console.log(
        "[POST /message] Raw result type from Gemini:",
        typeof result,
      );
      console.log({
        message: "response from ai",
        data: result,
      });

      const aiContent = result || "I'm sorry, I couldn't process that request.";
      const usedFallback = !result;
      console.log("[POST /message] aiContent extracted:", aiContent);
      if (usedFallback)
        console.warn(
          "[POST /message] ⚠️ Fell back to default response — no valid candidates in Gemini result",
        );
      //   // 5. Save AI Response
      const savedAiMessage = await Message.create({
        conversationId: conversation._id,
        role: "ai",
        content: aiContent,
      });
      console.log({
        message: "saved message from ai",
        data: savedAiMessage,
      });
      //   // 6. Return response
      console.log(
        "[POST /message] ✅ Response sent — sessionId:",
        conversation._id,
        "| savedAiMessage id:",
        savedAiMessage._id,
      );
      res.json({
        message: savedAiMessage,
        sessionId: conversation._id,
      });
    } catch (error) {
      console.error("[POST /message] ❌ Unhandled error:", error);
      res.status(500).json({ error: "Failed to get response from AI agent." });
    }
  };
}
