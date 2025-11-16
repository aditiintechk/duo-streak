import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Habit from '@/models/Habit';
import HabitCompletion from '@/models/HabitCompletion';
import Todo from '@/models/Todo';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's partner
    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId);
    const partnerId = user?.partnerId?.toString();

    // Get date range for last 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get habits
    const habits = await Habit.find({ userId });
    const partnerHabits = partnerId
      ? await Habit.find({ userId: partnerId })
      : [];

    // Calculate weekly completion for user
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const youCompletions = await HabitCompletion.countDocuments({
        habitId: { $in: habits.map((h) => h._id) },
        userId,
        date: { $gte: date, $lt: nextDate },
        completed: true,
      });

      const partnerCompletions = partnerId
        ? await HabitCompletion.countDocuments({
            habitId: { $in: partnerHabits.map((h) => h._id) },
            userId: partnerId,
            date: { $gte: date, $lt: nextDate },
            completed: true,
          })
        : 0;

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      weeklyData.push({
        day: dayNames[date.getDay()],
        you: youCompletions,
        partner: partnerCompletions,
      });
    }

    // Calculate completion rates
    const totalHabits = habits.length;
    const completedToday = await HabitCompletion.countDocuments({
      habitId: { $in: habits.map((h) => h._id) },
      userId,
      date: { $gte: today },
      completed: true,
    });

    const partnerTotalHabits = partnerHabits.length;
    const partnerCompletedToday = partnerId
      ? await HabitCompletion.countDocuments({
          habitId: { $in: partnerHabits.map((h) => h._id) },
          userId: partnerId,
          date: { $gte: today },
          completed: true,
        })
      : 0;

    const yourRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    const partnerRate =
      partnerTotalHabits > 0
        ? Math.round((partnerCompletedToday / partnerTotalHabits) * 100)
        : 0;

    // Get shared streaks
    const sharedHabits = await Habit.find({ userId, owner: 'shared' });
    const sharedStreaks = await Promise.all(
      sharedHabits.map(async (habit) => {
        const completions = await HabitCompletion.find({
          habitId: habit._id,
          completed: true,
        })
          .sort({ date: -1 })
          .limit(30);

        let streak = 0;
        for (let i = 0; i < completions.length; i++) {
          const completionDate = new Date(completions[i].date);
          completionDate.setHours(0, 0, 0, 0);
          const expectedDate = new Date(today);
          expectedDate.setDate(expectedDate.getDate() - i);

          if (
            completionDate.getTime() === expectedDate.getTime() ||
            (i === 0 && completionDate.getTime() === today.getTime())
          ) {
            streak++;
          } else {
            break;
          }
        }

        return {
          habit: habit.title,
          streak,
          owner: 'both',
        };
      })
    );

    // Calculate this week's completion percentage
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const allCompletions = await HabitCompletion.countDocuments({
      habitId: { $in: habits.map((h) => h._id) },
      userId,
      date: { $gte: weekStart },
      completed: true,
    });
    const totalPossible = totalHabits * 7;
    const weekCompletion = totalPossible > 0 ? Math.round((allCompletions / totalPossible) * 100) : 0;

    return NextResponse.json({
      weeklyData,
      yourRate,
      partnerRate,
      sharedStreaks: sharedStreaks.sort((a, b) => b.streak - a.streak).slice(0, 3),
      weekCompletion,
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

