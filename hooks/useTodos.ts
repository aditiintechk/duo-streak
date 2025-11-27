'use client';

import { useState, useEffect } from 'react';
import { playCompletionSound, playUncompleteSound } from '@/lib/sounds';
import { triggerConfetti } from '@/lib/confetti';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  assignedTo: 'me' | 'partner' | 'both';
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/todos', {
        credentials: 'include', // Required for cookies to work on iOS
      });
      if (!res.ok) throw new Error('Failed to fetch todos');
      const data = await res.json();
      setTodos(data.todos);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const toggleTodo = async (id: string) => {
    // Optimistic update - update UI immediately
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const wasCompleted = todo.completed;
    const newCompleted = !wasCompleted;

    // Update UI immediately
    setTodos(prevTodos =>
      prevTodos.map(t =>
        t.id === id ? { ...t, completed: newCompleted } : t
      )
    );

    // Play sound feedback and confetti
    if (newCompleted) {
      playCompletionSound();
      triggerConfetti();
    } else {
      playUncompleteSound();
    }

    // Sync with server in background
    try {
      const res = await fetch(`/api/todos/${id}/toggle`, { 
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to toggle todo');
      
      // Update with server response to ensure consistency
      const data = await res.json();
      if (data.todo) {
        setTodos(prevTodos =>
          prevTodos.map(t =>
            t.id === id ? {
              ...t,
              completed: data.todo.completed,
            } : t
          )
        );
      }
    } catch (err: any) {
      // Revert on error
      setTodos(prevTodos =>
        prevTodos.map(t =>
          t.id === id ? { ...t, completed: wasCompleted } : t
        )
      );
      setError(err.message);
    }
  };

  const createTodo = async (text: string, assignedTo: 'me' | 'partner' | 'both') => {
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text, assignedTo }),
      });
      if (!res.ok) throw new Error('Failed to create todo');
      
      // Add the new todo from response
      const data = await res.json();
      if (data.todo) {
        setTodos(prevTodos => [...prevTodos, data.todo]);
      } else {
        // Fallback: refetch if response doesn't include todo
        await fetchTodos();
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateTodo = async (id: string, text: string) => {
    // Optimistic update
    const previousTodos = todos;
    setTodos(prevTodos =>
      prevTodos.map(t =>
        t.id === id ? { ...t, text } : t
      )
    );

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Failed to update todo');
      
      // Update with server response
      const data = await res.json();
      if (data.todo) {
        setTodos(prevTodos =>
          prevTodos.map(t =>
            t.id === id ? {
              ...t,
              text: data.todo.text,
            } : t
          )
        );
      }
    } catch (err: any) {
      // Revert on error
      setTodos(previousTodos);
      setError(err.message);
      throw err;
    }
  };

  const deleteTodo = async (id: string) => {
    // Optimistic update
    const todoToDelete = todos.find(t => t.id === id);
    setTodos(prevTodos => prevTodos.filter(t => t.id !== id));

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete todo');
      // Success - already removed from UI
    } catch (err: any) {
      // Revert on error
      if (todoToDelete) {
        setTodos(prevTodos => [...prevTodos, todoToDelete].sort((a, b) => 
          a.id.localeCompare(b.id)
        ));
      }
      setError(err.message);
    }
  };

  return { todos, loading, error, toggleTodo, createTodo, updateTodo, deleteTodo, refetch: fetchTodos };
}
