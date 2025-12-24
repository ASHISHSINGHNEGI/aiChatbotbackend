import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  sessionId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true, // Indexed for fast lookups by session
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);
