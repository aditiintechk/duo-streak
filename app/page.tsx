'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import Navigation from '@/components/Navigation'
import HabitCard from '@/components/HabitCard'

type TabType = 'my' | 'partner' | 'shared'

interface Habit {
	id: string
	title: string
	streak: number
	completed: boolean
	owner: 'me' | 'partner' | 'shared'
}

export default function Home() {
	const [activeTab, setActiveTab] = useState<TabType>('my')
	const [habits, setHabits] = useState<Habit[]>([
		{
			id: '1',
			title: 'Morning Meditation',
			streak: 7,
			completed: true,
			owner: 'me',
		},
		{
			id: '2',
			title: 'Read for 30 minutes',
			streak: 3,
			completed: false,
			owner: 'me',
		},
		{
			id: '3',
			title: 'Evening Walk',
			streak: 12,
			completed: true,
			owner: 'partner',
		},
		{
			id: '4',
			title: 'Drink 8 glasses of water',
			streak: 5,
			completed: true,
			owner: 'shared',
		},
		{
			id: '5',
			title: 'No phone before bed',
			streak: 9,
			completed: false,
			owner: 'shared',
		},
	])

	const filteredHabits = habits.filter((habit) => {
		if (activeTab === 'my') return habit.owner === 'me'
		if (activeTab === 'partner') return habit.owner === 'partner'
		return habit.owner === 'shared'
	})

	const toggleHabit = (id: string) => {
		setHabits((prev) =>
			prev.map((habit) =>
				habit.id === id
					? { ...habit, completed: !habit.completed }
					: habit
			)
		)
	}

	return (
		<div className='min-h-screen bg-[var(--background)] pb-16 sm:pb-0 sm:pt-14'>
			<Navigation />

			<main className='mx-auto max-w-4xl px-4 py-6 sm:px-6'>
				<div className='mb-4 flex items-center justify-between'>
					<h1 className='text-2xl font-bold text-[var(--foreground)]'>
						Habits
					</h1>
					<button className='flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-[var(--accent-dark)] hover:shadow-md'>
						<Plus className='h-3.5 w-3.5' />
						New Habit
					</button>
				</div>

				{/* Tabs */}
				<div className='mb-4 flex gap-2 overflow-x-auto pb-2'>
					{[
						{ id: 'my' as TabType, label: 'My Habits' },
						{ id: 'partner' as TabType, label: "Partner's" },
						{ id: 'shared' as TabType, label: 'Shared' },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
								activeTab === tab.id
									? 'bg-[var(--accent)] text-white shadow-md'
									: 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				{/* Habits Grid */}
				<div className='space-y-3'>
					{filteredHabits.length > 0 ? (
						filteredHabits.map((habit) => (
							<HabitCard
								key={habit.id}
								title={habit.title}
								streak={habit.streak}
								completed={habit.completed}
								owner={habit.owner}
								onToggle={() => toggleHabit(habit.id)}
							/>
						))
					) : (
						<div className='rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--card-bg)] p-8 text-center'>
							<div className='mb-2 text-2xl'>✨</div>
							<p className='text-sm font-medium text-[var(--foreground)] mb-1'>
								No habits yet
							</p>
							<p className='text-xs text-[var(--text-secondary)]'>
								Add one to get started on your journey together!
							</p>
						</div>
					)}
				</div>
			</main>
		</div>
	)
}
