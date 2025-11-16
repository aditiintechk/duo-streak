import mongoose, { Schema, Document } from 'mongoose';

export interface IHabitCompletion extends Document {
  habitId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HabitCompletionSchema = new Schema<IHabitCompletion>(
  {
    habitId: {
      type: Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completed: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one completion per habit per user per day
HabitCompletionSchema.index({ habitId: 1, userId: 1, date: 1 }, { unique: true });

export default mongoose.models.HabitCompletion || mongoose.model<IHabitCompletion>('HabitCompletion', HabitCompletionSchema);

