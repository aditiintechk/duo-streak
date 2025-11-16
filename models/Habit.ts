import mongoose, { Schema, Document } from 'mongoose';

export interface IHabit extends Document {
  title: string;
  userId: mongoose.Types.ObjectId;
  owner: 'me' | 'partner' | 'shared';
  completions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema = new Schema<IHabit>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: String,
      enum: ['me', 'partner', 'shared'],
      required: true,
    },
    completions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'HabitCompletion',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema);

