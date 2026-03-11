import { Button } from "@/shared/ui/kit"
import { Send } from "lucide-react"

interface ChatInputProps {
	placeholder: string
	connected: boolean
	onChange:
		| React.ChangeEventHandler<HTMLInputElement, HTMLInputElement>
		| undefined
	text: string
	onKeyPress: React.KeyboardEventHandler<HTMLInputElement> | undefined
	onClick: () => void
}

export const ChatInput = ({
	placeholder,
	connected,
	text,
	onChange,
	onKeyPress,
	onClick,
}: ChatInputProps) => {
	return (
		<div className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:w-[78%] w-[95%] bg-white p-2 rounded-full pl-4 items-center z-10">
			<div className="flex flex-row items-center">
				<input
					className="flex-1 rounded ring-0 outline-0 p-1 placeholder:text-foreground/30 placeholder:font-medium text-black"
					type="text"
					placeholder={placeholder}
					value={text}
					onChange={onChange}
					onKeyDown={onKeyPress}
					disabled={!placeholder}
				/>
				<Button
					className="bg-blue-500 text-white rounded-full disabled:opacity-50"
					onClick={onClick}
					disabled={!connected || !text.trim()}
				>
					<Send width={28} />
				</Button>
			</div>
		</div>
	)
}
