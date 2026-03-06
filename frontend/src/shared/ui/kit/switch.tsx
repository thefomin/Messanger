import * as SwitchPrimitive from "@radix-ui/react-switch"
import * as React from "react"

import { cn } from "@/shared/lib"

function Switch({
	className,
	...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
	return (
		<SwitchPrimitive.Root
			data-slot="switch"
			className={cn(
				"peer data-[state=unchecked]:bg-foreground/70 focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[26px] w-[42px] shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#5FBC5C]",
				className,
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				className={cn(
					"pointer-events-none block h-5.25 w-5.25 rounded-full bg-white ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-4px)] data-[state=checked]:bg-white data-[state=unchecked]:translate-x-[calc(0%+1.5px)] data-[state=unchecked]:bg-white",
				)}
			/>
		</SwitchPrimitive.Root>
	)
}

export { Switch }
