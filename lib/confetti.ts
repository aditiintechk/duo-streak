/**
 * Confetti utility for celebratory completion effects
 */

import confetti from 'canvas-confetti'

/**
 * Triggers a fun confetti celebration when completing a habit or todo
 */
export function triggerConfetti() {
	if (typeof window === 'undefined') return

	const duration = 200
	const end = Date.now() + duration

	// Create a colorful confetti burst
	const colors = ['#f97316', '#8b5cf6', '#22c55e', '#f59e0b', '#3b82f6']

	const frame = () => {
		confetti({
			particleCount: 3,
			angle: 60,
			spread: 55,
			origin: { x: 0, y: 0.6 },
			colors: colors,
		})
		confetti({
			particleCount: 3,
			angle: 120,
			spread: 55,
			origin: { x: 1, y: 0.6 },
			colors: colors,
		})

		if (Date.now() < end) {
			requestAnimationFrame(frame)
		}
	}

	frame()

	// Also do a center burst for extra celebration
	setTimeout(() => {
		confetti({
			particleCount: 50,
			spread: 70,
			origin: { x: 0.5, y: 0.5 },
			colors: colors,
			gravity: 0.8,
			ticks: 100,
		})
	}, 100)
}

/**
 * Triggers a smaller, subtle confetti for less significant completions
 */
export function triggerSubtleConfetti() {
	if (typeof window === 'undefined') return

	const colors = ['#f97316', '#22c55e']

	confetti({
		particleCount: 30,
		spread: 60,
		origin: { x: 0.5, y: 0.7 },
		colors: colors,
		gravity: 1,
		ticks: 60,
	})
}
