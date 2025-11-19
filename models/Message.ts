import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  relatedHabitId?: mongoose.Types.ObjectId;
  relatedTodoId?: mongoose.Types.ObjectId;
  parentMessageId?: mongoose.Types.ObjectId; // For replies
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    relatedHabitId: {
      type: Schema.Types.ObjectId,
      ref: 'Habit',
      default: null,
    },
    relatedTodoId: {
      type: Schema.Types.ObjectId,
      ref: 'Todo',
      default: null,
    },
    parentMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
MessageSchema.index({ receiverId: 1, read: 1, createdAt: -1 });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

