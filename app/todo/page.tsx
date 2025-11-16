'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Navigation from '@/components/Navigation';
import TodoItem from '@/components/TodoItem';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  assignedTo: 'me' | 'partner' | 'both';
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: '1',
      text: 'Plan weekend getaway',
      completed: false,
      assignedTo: 'both',
    },
    {
      id: '2',
      text: 'Buy groceries',
      completed: true,
      assignedTo: 'me',
    },
    {
      id: '3',
      text: 'Schedule dentist appointment',
      completed: false,
      assignedTo: 'partner',
    },
    {
      id: '4',
      text: 'Organize closet together',
      completed: false,
      assignedTo: 'both',
    },
    {
      id: '5',
      text: 'Review budget',
      completed: false,
      assignedTo: 'both',
    },
  ]);

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-16 sm:pb-0 sm:pt-14">
      <Navigation />
      
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Todo List</h1>
          <button className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-[var(--accent-dark)] hover:shadow-md">
            <Plus className="h-3.5 w-3.5" />
            New Todo
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 rounded-xl bg-[var(--card-bg)] p-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--text-secondary)]">Progress</span>
            <span className="font-semibold text-[var(--foreground)]">
              {Math.round((completedCount / totalCount) * 100)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--partner-color)] transition-all"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              id={todo.id}
              text={todo.text}
              completed={todo.completed}
              assignedTo={todo.assignedTo}
              onToggle={() => toggleTodo(todo.id)}
            />
          ))}
        </div>

      </main>
    </div>
  );
}

