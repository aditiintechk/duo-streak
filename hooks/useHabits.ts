'use client'

import { useState, useEffect, useCallback } from 'react'
import { playCompletionSound, playUncompleteSound } from '@/lib/sounds'
import { triggerConfetti } from '@/lib/confetti'

interface Habit {
	id: string
	title: string
	streak: number
	completed: boolean
	owner: 'me' | 'partner' | 'shared'
	sharedCompletion?: {
		user: boolean
		partner: boolean
	}
}

export function useHabits(filter: 'my' | 'partner' | 'shared' = 'my') {
	const [habits, setHabits] = useState<Habit[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchHabits = useCallback(
		async (showLoading = true) => {
			try {
				if (showLoading) {
					setLoading(true)
				}
				const res = await fetch(`/api/habits?filter=${filter}`, {
					credentials: 'include', // Required for cookies to work on iOS
				})
				if (!res.ok) throw new Error('Failed to fetch habits')
				const data = await res.json()
				setHabits(data.habits)
				setError(null)
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: 'An unknown error occurred'
				setError(errorMessage)
			} finally {
				if (showLoading) {
					setLoading(false)
				}
			}
		},
		[filter]
	)

	useEffect(() => {
		fetchHabits()
	}, [fetchHabits])

	const toggleHabit = async (id: string) => {
		// Optimistic update - update UI immediately
		const habit = habits.find((h) => h.id === id)
		if (!habit) return

		const wasCompleted = habit.completed
		const newCompleted = !wasCompleted

		// Update UI immediately
		setHabits((prevHabits) =>
			prevHabits.map((h) => {
				if (h.id !== id) return h

				// For shared habits, update the user's completion status
				if (h.owner === 'shared' && h.sharedCompletion) {
					return {
						...h,
						completed: newCompleted,
						sharedCompletion: {
							...h.sharedCompletion,
							user: newCompleted,
						},
					}
				}

				return {
					...h,
					completed: newCompleted,
				}
			})
		)

		// Play sound feedback and confetti
		if (newCompleted) {
			playCompletionSound()
			triggerConfetti()
		} else {
			playUncompleteSound()
		}

		// Sync with server in background (without showing loading)
		try {
			const res = await fetch(`/api/habits/${id}/toggle`, {
				method: 'POST',
				credentials: 'include',
			})
			if (!res.ok) throw new Error('Failed to toggle habit')

			// Refetch to get updated streaks and shared completion status
			// Do this silently in the background without showing loading
			await fetchHabits(false)
		} catch (err) {
			// Revert on error
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to toggle habit'
			setHabits((prevHabits) =>
				prevHabits.map((h) => {
					if (h.id !== id) return h

					if (h.owner === 'shared' && h.sharedCompletion) {
						return {
							...h,
							completed: wasCompleted,
							sharedCompletion: {
								...h.sharedCompletion,
								user: wasCompleted,
							},
						}
					}

					return {
						...h,
						completed: wasCompleted,
					}
				})
			)
			setError(errorMessage)
		}
	}

	const createHabit = async (
		title: string,
		owner: 'me' | 'partner' | 'shared'
	) => {
		try {
			const res = await fetch('/api/habits', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ title, owner }),
			})
			if (!res.ok) throw new Error('Failed to create habit')

			// Add the new habit from response
			const data = await res.json()
			if (data.habit) {
				setHabits((prevHabits) => [...prevHabits, data.habit])
			} else {
				// Fallback: refetch if response doesn't include habit
				await fetchHabits(false)
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to create habit'
			setError(errorMessage)
			throw err
		}
	}

	const updateHabit = async (id: string, title: string) => {
		// Optimistic update
		const previousHabits = habits
		setHabits((prevHabits) =>
			prevHabits.map((h) => (h.id === id ? { ...h, title } : h))
		)

		try {
			const res = await fetch(`/api/habits/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ title }),
			})
			if (!res.ok) throw new Error('Failed to update habit')

			// Update with server response
			const data = await res.json()
			if (data.habit) {
				setHabits((prevHabits) =>
					prevHabits.map((h) =>
						h.id === id
							? {
									...h,
									title: data.habit.title,
							  }
							: h
					)
				)
			}
		} catch (err) {
			// Revert on error
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to update habit'
			setHabits(previousHabits)
			setError(errorMessage)
			throw err
		}
	}

	const deleteHabit = async (id: string) => {
		// Optimistic update
		const habitToDelete = habits.find((h) => h.id === id)
		setHabits((prevHabits) => prevHabits.filter((h) => h.id !== id))

		try {
			const res = await fetch(`/api/habits/${id}`, {
				method: 'DELETE',
				credentials: 'include',
			})
			if (!res.ok) throw new Error('Failed to delete habit')
			// Success - already removed from UI
		} catch (err) {
			// Revert on error
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to delete habit'
			if (habitToDelete) {
				setHabits((prevHabits) =>
					[...prevHabits, habitToDelete].sort((a, b) =>
						a.id.localeCompare(b.id)
					)
				)
			}
			setError(errorMessage)
		}
	}

	return {
		habits,
		loading,
		error,
		toggleHabit,
		createHabit,
		updateHabit,
		deleteHabit,
		refetch: fetchHabits,
	}
}
