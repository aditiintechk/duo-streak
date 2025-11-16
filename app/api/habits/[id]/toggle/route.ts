import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Habit from '@/models/Habit';
import HabitCompletion from '@/models/HabitCompletion';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: habitId } = await params;
    const habit = await Habit.findById(habitId);

    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }

    // Check if user can toggle this habit
    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId);
    const partnerId = user?.partnerId?.toString();
    const habitPartnerId = habit.partnerId?.toString();

    const isOwner = habit.userId.toString() === userId;
    const isShared = habit.owner === 'shared';
    
    // For shared habits, both creator and partner can toggle
    if (isShared) {
      const isCreator = habit.userId.toString() === userId;
      const isPartner = habitPartnerId === userId;
      if (!isCreator && !isPartner) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    } else if (!isOwner) {
      // For non-shared habits, only owner can toggle
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if completion exists for today
    const existingCompletion = await HabitCompletion.findOne({
      habitId,
      userId,
      date: { $gte: today, $lt: tomorrow },
    });

    if (existingCompletion) {
      // Toggle completion
      existingCompletion.completed = !existingCompletion.completed;
      await existingCompletion.save();
    } else {
      // Create new completion
      await HabitCompletion.create({
        habitId,
        userId,
        date: today,
        completed: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Toggle habit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

