'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckSquare2, ListTodo, Settings, MessageSquare } from 'lucide-react'
import { useMessages } from '@/hooks/useMessages'

export default function Navigation() {
	const pathname = usePathname()
	const { unreadCount, fetchMessages } = useMessages()

	// Listen for message updates
	useEffect(() => {
		const handleMessagesUpdated = () => {
			fetchMessages()
		}
		window.addEventListener('messagesUpdated', handleMessagesUpdated)
		return () => {
			window.removeEventListener('messagesUpdated', handleMessagesUpdated)
		}
	}, [fetchMessages])

	const navItems = [
		{ href: '/', label: 'Habits', icon: CheckSquare2 },
		{ href: '/todo', label: 'To-Do', icon: ListTodo },
		{ href: '/messages', label: 'Messages', icon: MessageSquare },
		{ href: '/settings', label: 'Settings', icon: Settings },
	]

	return (
		<nav className='fixed bottom-0 left-0 right-0 z-50 border-t border-(--border) bg-(--card-bg)/80 backdrop-blur-md shadow-lg sm:top-0 sm:bottom-auto sm:border-b sm:border-t-0 sm:shadow-sm'>
			<div className='mx-auto flex max-w-4xl items-center justify-around px-3 py-2 sm:justify-start sm:gap-6 sm:px-6 sm:py-2'>
				{navItems.map((item) => {
					const isActive = pathname === item.href
					const isMessages = item.href === '/messages'
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:flex-row sm:gap-1.5 relative ${
								isActive
									? 'bg-(--accent)/10 text-(--accent) scale-105'
									: 'text-(--text-secondary) hover:bg-(--border)/50 hover:text-(--foreground)'
							}`}
						>
							<item.icon className='h-4 w-4 sm:h-3.5 sm:w-3.5' />
							<span>{item.label}</span>
							{isMessages && unreadCount > 0 && (
								<span className='absolute -top-1 -right-1 h-5 w-5 rounded-full bg-(--accent) text-white text-[10px] flex items-center justify-center font-bold'>
									{unreadCount > 9 ? '9+' : unreadCount}
								</span>
							)}
						</Link>
					)
				})}
			</div>
		</nav>
	)
}
