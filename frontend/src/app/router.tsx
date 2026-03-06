import { createBrowserRouter } from "react-router-dom"

import { ROUTES } from "@/shared/model/routes"

import { App } from "./app"
import { Providers } from "./providers"
import { ProtectedRoute } from "./protected-route"

export const router = createBrowserRouter([
	{
		element: (
			<Providers>
				<App />
			</Providers>
		),
		// errorElement: <NotFound />,
		children: [
			{
				// loader: protectedLoader,

				Component: ProtectedRoute,
				children: [
					{
						path: ROUTES.HOME,
						lazy: () => import("@/features/chats/chats.page"),
					},
				],
			},

			{
				path: ROUTES.LOGIN,
				lazy: () => import("@/features/auth/pages/login.page"),
			},
			{
				path: ROUTES.REGISTER,
				lazy: () => import("@/features/auth/pages/register.page"),
			},
		],
	},
])
