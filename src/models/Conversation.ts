import { model, Schema } from "mongoose";

const ConversationSchema = new Schema(
  {
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  { timestamps: true, _id: true }
);

export default model("Conversation", ConversationSchema);
