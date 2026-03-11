import { useEffect, useState, RefObject } from "react"

export const useCurrentScrollDay = (
	containerRef: React.RefObject<HTMLDivElement | null>,
	deps: any[] = [],
) => {
	const [currentDay, setCurrentDay] = useState<string>("")

	useEffect(() => {
		const container = containerRef.current
		if (!container) return

		const handleScroll = () => {
			const children = Array.from(container.children) as HTMLDivElement[]
			for (const child of children) {
				const date = child.dataset?.date
				if (!date) continue
				const rect = child.getBoundingClientRect()
				if (rect.top >= 0) {
					setCurrentDay(date)
					break
				}
			}
		}

		container.addEventListener("scroll", handleScroll)
		handleScroll()

		return () => container.removeEventListener("scroll", handleScroll)
	}, deps)

	return currentDay
}
