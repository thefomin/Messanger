import { useState } from "react"
import { jwtDecode } from "jwt-decode"
import { createGStore } from "create-gstore"
import { publicFetchClient } from "../api/instance.api"

type Session = {
	userId: number
	email: string
	exp: number
	iat: number
}

const TOKEN_KEY = "token"

let refreshTokenPromise: Promise<string | null> | null = null

export const useSession = createGStore(() => {
	const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))

	const login = (token: string) => {
		localStorage.setItem(TOKEN_KEY, token)
		setToken(token)
	}

	const logout = () => {
		localStorage.removeItem(TOKEN_KEY)
		setToken(null)
	}

	const session = token ? jwtDecode<Session>(token) : null
	console.log("session " + JSON.stringify(session))
	const refreshToken = async () => {
		console.log("refreshToken called, current token:", token)
		if (!token) {
			console.log("No token, returning null")
			return null
		}

		const session = jwtDecode<Session>(token)
		const now = Date.now() / 1000
		console.log("Current time (s):", now, "Token exp:", session.exp)
		const EXPIRY_BUFFER = 30
		if (session.exp - EXPIRY_BUFFER < now) {
			console.log("Token expired, attempting refresh")
			if (!refreshTokenPromise) {
				console.log("Starting refresh token request")
				refreshTokenPromise = publicFetchClient
					.POST("/auth/refresh")
					.then((r) => {
						console.log("Refresh response:", r)
						return r.data?.accessToken ?? null
					})
					.then((newToken) => {
						console.log("New token from refresh:", newToken)
						if (newToken) {
							login(newToken)
							return newToken
						} else {
							console.log("Refresh returned no token, logging out")
							logout()
							return null
						}
					})
					.catch((err) => {
						console.error("Refresh request failed:", err)
						logout()
						return null
					})
					.finally(() => {
						refreshTokenPromise = null
					})
			} else {
				console.log("Refresh already in progress, waiting")
			}

			const newToken = await refreshTokenPromise
			console.log("Returning token after refresh:", newToken)
			return newToken
		} else {
			console.log("Token not expired, returning existing token")
			return token
		}
	}

	return { refreshToken, login, logout, session, token }
})
