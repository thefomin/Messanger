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
			<Card className="bg-foreground/4 hidden min-h-125 w-full max-w-90 flex-col justify-between rounded-3xl border-0 shadow-none sm:flex sm:max-h-max">
				<CardHeader>
					<CardTitle className="text-4xl font-semibold">{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<CardContent></CardContent>
				<CardFooter className="flex flex-col items-start justify-start">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="65"
						height="34"
						viewBox="0 0 65 34"
						fill="none"
					>
						<path
							d="M37.3055 33.8377H61.8857C64.6495 33.8377 66.037 30.4993 64.0874 28.5403L37.4904 1.81567C36.5188 0.83943 35.1982 0.290588 33.8209 0.290588H31.1772C29.7999 0.290588 28.4794 0.83943 27.5078 1.81567L0.910761 28.5403C-1.03882 30.4993 0.348676 33.8377 3.11244 33.8377H27.7879C28.6109 33.8377 29.4004 33.511 29.9828 32.9294L31.2298 31.6842C31.9574 30.9576 33.136 30.9576 33.8636 31.6842L35.1107 32.9294C35.6931 33.511 36.4825 33.8377 37.3055 33.8377Z"
							fill="white"
						/>
					</svg>
				</CardFooter>
			</Card>
			<Card className="bg-foreground/4 flex min-h-[500px] w-full max-w-[360px] gap-16 rounded-3xl border-0 shadow-none sm:gap-0">
				<CardHeader className="flex flex-col sm:hidden">
					<CardTitle className="text-4xl font-semibold">{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<div className="flex h-auto flex-col gap-4 sm:h-full">
					<CardContent className="">{form}</CardContent>
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
