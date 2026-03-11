import { useParams } from "react-router-dom"
import { PathParams, ROUTES } from "@/shared/model"
import { useEffect, useRef, useState } from "react"
import { Message } from "./ui/message"
import { ChatInput } from "./ui/input"
import { ChatLayout } from "./ui/chat-layout"
import { DateSeparator, StickyDateSeparator } from "./ui/date-separator"
import { ChatHeader } from "./ui/header"
import { useChatData } from "./model/use-chat-data"
import { useCurrentScrollDay } from "./model/use-current-day-scroll"
import { useGetChatUser } from "./model/use-get-chat-user"

export function ChatPage() {
	const { recipientId } = useParams<PathParams[typeof ROUTES.RECIPIENT_ID]>()

	const [text, setText] = useState("")
	const messagesEndRef = useRef<HTMLDivElement | null>(null)
	const messagesContainerRef = useRef<HTMLDivElement | null>(null)
	const { messages, sendMessage, isConnected, isMyMessage } = useChatData({
		recipientId: Number(recipientId),
	})
	const { user } = useGetChatUser(recipientId!)
	console.log("user " + JSON.stringify(user))
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [messages])

	const currentDay = useCurrentScrollDay(messagesContainerRef, [messages])

	const handleSend = () => {
		if (!text.trim() || !isConnected) return
		sendMessage(text, "encryptedKeyPlaceholder")
		setText("")
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") handleSend()
	}

	let lastDate: string | null = null

	return (
		<ChatLayout
			recipientId={recipientId}
			header={<ChatHeader username={user?.username!} />}
			messages={
				<div
					ref={messagesContainerRef}
					className="relative overflow-y-auto no-scrollbar sm:w-[80%] h-full w-full items-center justify-center px-4 z-10"
				>
					<StickyDateSeparator currentDay={currentDay} />
					{messages.map((msg) => {
						const msgDate = new Date(msg.createdAt).toDateString()
						const showSeparator = lastDate !== msgDate
						lastDate = msgDate

						return (
							<div key={msg.id} data-date={msgDate}>
								{showSeparator && (
									<DateSeparator date={new Date(msg.createdAt)} />
								)}
								<Message msg={msg} isMyMessage={isMyMessage(msg)} />
							</div>
						)
					})}
					<div ref={messagesEndRef} />
					<div className="h-25 w-20"></div>
				</div>
			}
			input={
				<ChatInput
					text={text}
					connected={isConnected}
					placeholder={isConnected ? "Message" : "Connecting..."}
					onChange={(e) => setText(e.target.value)}
					onKeyPress={handleKeyPress}
					onClick={handleSend}
				/>
			}
		/>
	)
}

export const Component = ChatPage
