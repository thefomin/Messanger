import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"

import { queryClient } from "@/shared/api/query-client"

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<Toaster position="bottom-right" duration={6000} />
			{children}
		</QueryClientProvider>
	)
}
