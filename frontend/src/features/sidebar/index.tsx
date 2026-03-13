import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { PathParams, ROUTES } from "@/shared/model"
import { cn } from "@/shared/lib"
import { useGetChatList } from "./use-users-list"
import { ChatUserDto } from "../chats/model/chats.types"
import { useChatsSubscription } from "../chats/model/use-chats-subscription"
import { WebSocketEventType } from "../chats/model/websocket.types"
import { useDebounce } from "use-debounce"

export const Sidebar = () => {
	const { recipientId } = useParams<PathParams[typeof ROUTES.RECIPIENT_ID]>()
	const { chats } = useGetChatList()
	console.log("chats " + JSON.stringify(chats))
	const [mode, setMode] = useState<"chats" | "search">("chats")
	const [searchQuery, setSearchQuery] = useState("")
	const [debouncedQuery] = useDebounce(searchQuery, 300)
	const [searchResults, setSearchResults] = useState<ChatUserDto[]>([])

	const { send } = useChatsSubscription({
		onSearchResult: (users) => setSearchResults(users),
	})

	useEffect(() => {
		if (debouncedQuery.trim()) {
			send(WebSocketEventType.SEARCH_USERS, {
				username: debouncedQuery,
				limit: 20,
			})
			setMode("search")
		} else {
			setMode("chats")
			setSearchResults([])
		}
	}, [debouncedQuery, send])

	const handleFocus = () => {
		if (searchQuery.trim()) setMode("search")
	}

	const handleBlur = () => {
		if (!searchQuery.trim()) setMode("chats")
	}

	return (
		<div className="min-h-screen flex justify-center border-x min-w-100 border-x-muted-foreground/40">
			<div className="w-full max-w-md flex flex-col">
				{/* Поиск */}
				<div className="px-4 pb-2 h-15.25 py-2">
					<div className="flex items-center gap-2 bg-muted-foreground/10 rounded-full px-3 py-2">
						<Search className="w-5 h-5 text-[#8e8e93]" />
						<input
							type="text"
							placeholder="Поиск"
							className="bg-transparent outline-none w-full text-base text-foreground placeholder:text-[#8e8e93]"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onFocus={handleFocus}
							onBlur={handleBlur}
						/>
					</div>
				</div>

				{/* Список чатов или результаты поиска */}
				<div className="flex-1 overflow-y-auto p-2 text-black">
					{mode === "chats"
						? // Существующий список чатов
							chats.map((chat) => (
								<Link
									key={chat.id}
									to={`/${chat.userId}`}
									className={cn(
										"flex gap-2.5 p-2.25 rounded-[12px] hover:bg-muted-foreground/10 transition-colors items-start",
										Number(recipientId) === chat.userId
											? "bg-[#3390ec] hover:bg-[#3390ec]"
											: "",
									)}
								>
									{/* Аватар */}
									{chat.avatar ? (
										<img
											src={chat.avatar}
											alt={chat.name}
											className="w-13.5 h-13.5 rounded-full object-cover flex-shrink-0"
										/>
									) : (
										<div
											className={`w-13.5 h-13.5 bg-[linear-gradient(#fff_-300%,#d95574)] rounded-full flex items-center justify-center flex-shrink-0 leading-5`}
										>
											<span className="text-[22px] font-bold text-white">
												{chat.avatarLetter || chat.name[0]}
											</span>
										</div>
									)}

									{/* Контент чата */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between">
											<span
												className={cn(
													"font-semibold text-[15px] truncate",
													Number(recipientId) === chat.userId
														? "text-white"
														: "text-black",
												)}
											>
												{chat.name}
											</span>
											<span
												className={cn(
													"text-sm",
													Number(recipientId) === chat.userId
														? "text-white"
														: "text-[#8e8e93]",
												)}
											>
												{chat.time}
											</span>
										</div>
										<div className="flex items-center mt-0.5">
											<span
												className={cn(
													"text-[#8e8e93] text-base truncate",
													Number(recipientId) === chat.userId
														? "text-white"
														: "text-[#8e8e93]",
												)}
											>
												{chat.lastMessage}
											</span>
										</div>
									</div>
								</Link>
							))
						: // Результаты поиска пользователей
							searchResults.map((user) => (
								<Link
									key={user.id}
									to={`/${user.id}`}
									className="flex gap-2.5 p-2.25 rounded-[12px] hover:bg-muted-foreground/10 transition-colors items-start"
								>
									{/* Аватар (заглушка) */}
									<div className="w-13.5 h-13.5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
										<span className="text-[22px] font-bold text-white">
											{user.username[0].toUpperCase()}
										</span>
									</div>
									{/* Имя пользователя */}
									<div className="flex-1 min-w-0">
										<span className="font-semibold text-[15px]">
											{user.username}
										</span>
									</div>
								</Link>
							))}
				</div>
			</div>
		</div>
	)
}
