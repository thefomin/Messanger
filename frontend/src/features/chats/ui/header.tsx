interface HeaderProps {
	username: string
}

export const ChatHeader = ({ username }: HeaderProps) => {
	const displayName = username || "Unknown"
	const initials = displayName.slice(0, 2).toUpperCase()

	return (
		<div className="w-full py-2.5 px-5.75 border-b border-b-muted-foreground/35 flex flex-row gap-3 items-center h-14 z-10 bg-white">
			{/* <AvatarImage src="https://github.com/shadcn.png" /> */}
			<div className="text-white font-bold h-10 w-10 bg-[linear-gradient(#fff_-300%,#d95574)] rounded-full items-center flex justify-center">
				{initials}
			</div>
			<div className="text-lg h-10 flex items-center font-bold text-black">
				{displayName}
			</div>
		</div>
	)
}
