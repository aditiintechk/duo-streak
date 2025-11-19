import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/auth';

// GET - Fetch messages for the current user
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

    const user = await User.findById(userId);
    if (!user || !user.partnerId) {
      return NextResponse.json({
        messages: [],
        unreadCount: 0,
      });
    }

    // Get all messages where user is receiver
    const messages = await Message.find({
      receiverId: userId,
    })
      .populate('senderId', 'name email')
      .populate('relatedHabitId', 'title')
      .populate('relatedTodoId', 'text')
      .populate('parentMessageId', 'content senderId')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      read: false,
    });

    return NextResponse.json({
      messages: messages.map((msg) => ({
        id: msg._id.toString(),
        senderId: msg.senderId._id.toString(),
        senderName: (msg.senderId as any).name,
        content: msg.content,
        relatedHabitId: msg.relatedHabitId ? (msg.relatedHabitId as any)._id.toString() : null,
        relatedHabitTitle: msg.relatedHabitId ? (msg.relatedHabitId as any).title : null,
        relatedTodoId: msg.relatedTodoId ? (msg.relatedTodoId as any)._id.toString() : null,
        relatedTodoText: msg.relatedTodoId ? (msg.relatedTodoId as any).text : null,
        parentMessageId: msg.parentMessageId ? (msg.parentMessageId as any)._id.toString() : null,
        parentMessageContent: msg.parentMessageId ? (msg.parentMessageId as any).content : null,
        read: msg.read,
        createdAt: msg.createdAt,
      })),
      unreadCount,
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Send a message
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content, relatedHabitId, relatedTodoId, parentMessageId } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user || !user.partnerId) {
      return NextResponse.json(
        { error: 'No partner linked' },
        { status: 400 }
      );
    }

    // If replying, verify parent message exists and is for this user
    if (parentMessageId) {
      const parentMessage = await Message.findById(parentMessageId);
      if (!parentMessage) {
        return NextResponse.json(
          { error: 'Parent message not found' },
          { status: 404 }
        );
      }
      // Verify user is either sender or receiver of parent message
      const isSender = parentMessage.senderId.toString() === userId;
      const isReceiver = parentMessage.receiverId.toString() === userId;
      if (!isSender && !isReceiver) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    // Verify related habit/todo if provided
    if (relatedHabitId) {
      const Habit = (await import('@/models/Habit')).default;
      const habit = await Habit.findById(relatedHabitId);
      if (!habit) {
        return NextResponse.json(
          { error: 'Habit not found' },
          { status: 404 }
        );
      }
    }

    if (relatedTodoId) {
      const Todo = (await import('@/models/Todo')).default;
      const todo = await Todo.findById(relatedTodoId);
      if (!todo) {
        return NextResponse.json(
          { error: 'Todo not found' },
          { status: 404 }
        );
      }
    }

    // Create message - receiver is always the partner
    const message = await Message.create({
      senderId: userId,
      receiverId: user.partnerId,
      content: content.trim(),
      relatedHabitId: relatedHabitId || null,
      relatedTodoId: relatedTodoId || null,
      parentMessageId: parentMessageId || null,
      read: false,
    });

    // Populate for response
    await message.populate('senderId', 'name email');
    if (relatedHabitId) {
      await message.populate('relatedHabitId', 'title');
    }
    if (relatedTodoId) {
      await message.populate('relatedTodoId', 'text');
    }

    return NextResponse.json(
      {
        message: {
          id: message._id.toString(),
          senderId: (message.senderId as any)._id.toString(),
          senderName: (message.senderId as any).name,
          content: message.content,
          relatedHabitId: message.relatedHabitId ? (message.relatedHabitId as any)._id.toString() : null,
          relatedHabitTitle: message.relatedHabitId ? (message.relatedHabitId as any).title : null,
          relatedTodoId: message.relatedTodoId ? (message.relatedTodoId as any)._id.toString() : null,
          relatedTodoText: message.relatedTodoId ? (message.relatedTodoId as any).text : null,
          parentMessageId: message.parentMessageId ? message.parentMessageId.toString() : null,
          read: message.read,
          createdAt: message.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

