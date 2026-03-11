import { cn } from "@/lib/utils"

interface MessageDto {
	ciphertext: string
	createdAt: string | Date
}

interface MessageProps {
	msg: MessageDto
	isMyMessage: boolean
}

export const Message = ({ msg, isMyMessage }: MessageProps) => {
	return (
		<div
			className={cn(
				"mb-1 relative flex",
				isMyMessage ? "justify-end pr-2" : "justify-start pl-2",
			)}
		>
			<div className="relative max-w-[75%]">
				{/* iMessage хвостик */}
				<svg
					className={cn(
						"absolute bottom-0 w-[11px] h-[17px] mb-1.5",
						isMyMessage ? "-right-[8px]" : "-left-[8px] scale-x-[-1]",
					)}
					viewBox="0 0 11 17"
					fill="none"
				>
					<path
						d="M11 17C11 17 7.5 14 5.5 10C3.5 6 0 0 0 0L0 17L11 17Z"
						fill={isMyMessage ? "#eeffde" : "white"}
					/>
				</svg>

				<div
					className={cn(
						"py-[6px] px-3 flex items-end gap-[6px]  wrap-break-word mb-1.5",
						isMyMessage
							? "bg-[#eeffde] text-black rounded-[18px] rounded-br-[4px] "
							: "bg-white text-black rounded-[18px] rounded-bl-[4px]",
					)}
				>
					<span className="leading-[1.3] wrap-break-word max-w-45">
						{msg.ciphertext}
					</span>
					<span
						className={cn(
							"text-[12px] whitespace-nowrap flex items-center gap-[3px] shrink-0 translate-y-[1px]",
							isMyMessage ? "text-[#4fae4e]" : "text-muted-foreground",
						)}
					>
						{new Date(msg.createdAt).toLocaleTimeString(undefined, {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
				</div>
			</div>
		</div>
	)
}
