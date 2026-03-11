import React from "react"

export interface DateSeparatorProps {
	date: Date
	className?: string
}
const DateSeparator: React.FC<DateSeparatorProps> = ({ date, className }) => {
	return (
		<div className={`flex justify-center my-2 ${className || ""}`}>
			<span className="bg-[#19191950] text-white border-[#424242] text-[14px] font-light px-2 py-1 rounded-full">
				{date.toLocaleDateString(undefined, {
					weekday: "long",
					day: "numeric",
					month: "short",
				})}
			</span>
		</div>
	)
}

const StickyDateSeparator: React.FC<{ currentDay: string }> = ({
	currentDay,
}) => {
	if (!currentDay) return null

	return (
		<div className="sticky top-2 z-10 flex justify-center pointer-events-none">
			<DateSeparator date={new Date(currentDay)} />
		</div>
	)
}

export { DateSeparator, StickyDateSeparator }
