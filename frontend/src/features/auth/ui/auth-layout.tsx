import React from "react"

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/shared/ui/kit"

interface AuthLayoutProps {
	form: React.ReactNode
	title: React.ReactNode
	description?: React.ReactNode
	footer?: React.ReactNode
	// AuthSocial?: React.ReactNode
}

export function AuthLayout({
	form,
	title,
	description,
	footer,
}: AuthLayoutProps) {
	return (
		<div className="flex grow flex-row items-stretch justify-center">
			<Card className="bg-transparent flex min-h-[500px] w-full sm:max-w-[400px] gap-16 rounded-3xl border-0 shadow-none sm:gap-6">
				<CardHeader className="flex flex-col ">
					<CardTitle className="text-4xl font-semibold">{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<div className="flex h-auto flex-col gap-5 sm:h-full">
					<CardContent>{form}</CardContent>
					<CardFooter className="flex h-full flex-col">
						{footer ? footer : null}
					</CardFooter>
					{/* {AuthSocial ? (
						<CardContent>{AuthSocial}</CardContent>
					) : null} */}
				</div>
			</Card>
		</div>
	)
}
