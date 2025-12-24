import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  role: "user" | "model"; // Gemini specific: 'user' is the human, 'model' is the AI
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
    index: true, // Indexed for fast history retrieval
  },
  role: {
    type: String,
    enum: ["user", "model"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IMessage>("Message", MessageSchema);
