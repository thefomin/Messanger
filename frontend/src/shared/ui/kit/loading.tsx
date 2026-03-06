import { Loader } from "lucide-react"

export function Loading() {
	return (
		<div className="flex items-center justify-center text-sm">
			<Loader className="mr-2 size-5 animate-spin" />
		</div>
	)
}
