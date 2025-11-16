import mongoose, { Schema, Document } from 'mongoose';

export interface ITodo extends Document {
  text: string;
  userId: mongoose.Types.ObjectId;
  assignedTo: 'me' | 'partner' | 'both';
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new Schema<ITodo>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: String,
      enum: ['me', 'partner', 'both'],
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Todo || mongoose.model<ITodo>('Todo', TodoSchema);

