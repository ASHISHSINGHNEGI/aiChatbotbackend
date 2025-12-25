import { Router } from "express";
import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { fetchWithRetry } from "../utils/fetchWithRetry.js";

const router = Router();
const SYSTEM_PROMPT = `
You are a helpful and professional AI support agent for "GadgetStore", an e-commerce platform.
Your goal is to assist customers with their inquiries using the following information:
- Shipping: Free shipping on orders over $50. Standard delivery takes 3-5 business days.
- Returns: We have a 30-day return policy for unused items in original packaging.
- Support Hours: Our team is available from 9 AM to 6 PM EST, Monday through Friday.
- Contact: For technical issues, customers can reach out to support@gadgetstore.com.
Always be polite, concise, and helpful.
`;

router.post("/message", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";

  if (!apiKey) {
    console.log("Check env variable!!!!");
    return res.status(400).json({ error: "Undefined Env variable: GEMINI_API_KEY" });
  }

  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  console.log({
    GEMINI_URL,
  });
  const { conversationId, message } = req.body;

  if (!message) {
    console.error("Message content is required.");
    return res.status(400).json({ error: "Message content is required." });
  }

  try {
    let conversation;
    //   // 1. Validate or Create Conversation
    if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
      console.info("valid sessionId found in body");
      conversation = await Conversation.findById(conversationId);
    }
    if (!conversation) {
      console.warn(
        "Warning: no conversation found as no session id found in db, creating a new conversation"
      );
      conversation = await Conversation.create({});
      console.log({
        message: "created conversation",
        data: conversation,
      });
    }
    //   // 2. Save User Message
    const newMessage = await Message.create({
      conversationId: conversation._id,
      role: "user",
      content: message,
    });
    console.log("message store successfully with id: ", newMessage._id);
    //   // 3. Retrieve history for LLM context
    const historyDocs = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

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
    // 4. payload for Gemini API with System Instruction
    const payload = {
      contents: contents,
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
    };
    console.log({
      message: "payload to ai",
      data: payload,
    });
    //call for gemini
    const result = await fetchWithRetry(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log({
      message: "response from ai",
    });

    const aiContent =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't process that request.";
    console.log({ aiContent });
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
    res.json({
      message: savedAiMessage,
      sessionId: conversation._id,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to get response from AI agent." });
  }
});

router.get("/history/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    return res.status(400).json({ error: "Invalid session ID" });
  }

  try {
    const messages = await Message.find({ conversationId: sessionId }).sort({
      createdAt: 1,
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve history." });
  }
});

export default router;
