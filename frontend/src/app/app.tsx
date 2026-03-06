import { Outlet } from "react-router-dom"

export function App() {
	return (
		<main className="flex min-h-screen min-w-screen items-center justify-center">
			<Outlet />
		</main>
	)
}
