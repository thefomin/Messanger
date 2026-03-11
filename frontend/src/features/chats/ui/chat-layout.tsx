import { Sidebar } from "@/features/sidebar"

interface ChatLayoutProps {
	header: React.ReactNode
	messages: React.ReactNode
	input: React.ReactNode
	recipientId: string | undefined
}

export const ChatLayout = ({
	header,
	messages,
	input,
	recipientId,
}: ChatLayoutProps) => {
	if (!recipientId) {
		return (
			<>
				<Sidebar />
				<div className="flex flex-col h-screen sm:w-3/5 w-full rounded relative items-center justify-center text-white border-r border-r-[#383838]">
					<div className="background_chat"></div>
				</div>
			</>
		)
	}
	return (
		<>
			<Sidebar />
			<div className="flex flex-col h-screen sm:w-3/5 w-full rounded relative items-center justify-center text-white border-r border-r-[#383838]">
				{header}
				{messages}

				{input}

				<div className="background_chat"></div>
			</div>
		</>
	)
}
