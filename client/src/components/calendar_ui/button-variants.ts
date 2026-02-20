import { cva } from "class-variance-authority"

export const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                depth: "bg-white dark:bg-gray-900 dark:text-gray-100 shadow-[0_4px_0_0_rgb(229,231,235),0_4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_0_0_rgb(0,0,0),0_4px_6px_-1px_rgba(0,0,0,0.5)] border border-gray-200 dark:border-gray-800 active:shadow-[0_0_0_0_rgb(229,231,235),inset_0_2px_4px_rgba(0,0,0,0.1)] dark:active:shadow-[0_0_0_0_rgb(0,0,0),inset_0_2px_4px_rgba(0,0,0,0.5)] active:translate-y-[4px] data-[selected=true]:shadow-[inset_0_2px_4px_rgba(0,0,0,0.15),inset_0_-1px_0_rgba(255,255,255,0.5)] dark:data-[selected=true]:shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),inset_0_-1px_0_rgba(255,255,255,0.1)] data-[selected=true]:translate-y-[2px] data-[selected=true]:bg-gray-50 dark:data-[selected=true]:bg-gray-800 data-[selected=true]:border-gray-300 dark:data-[selected=true]:border-gray-700 data-[selected=true]:text-gray-900 dark:data-[selected=true]:text-gray-50 transition-all duration-150 ease-out",
                dark: "bg-zinc-900 text-white dark:shadow-[0_4px_0_0_rgb(64,64,64),0_4px_6px_-1px_rgba(0,0,0,0.5)] border border-zinc-800 active:shadow-[0_0_0_0_rgb(64,64,64),inset_0_2px_4px_rgba(0,0,0,0.5)] active:translate-y-[4px] data-[selected=true]:shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),inset_0_-1px_0_rgba(255,255,255,0.1)] data-[selected=true]:translate-y-[2px] data-[selected=true]:bg-zinc-950 transition-all duration-150 ease-out",
                "neo-brutalist": "border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none data-[selected=true]:bg-yellow-400 data-[selected=true]:translate-x-[2px] data-[selected=true]:translate-y-[2px] data-[selected=true]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all",
                macos: "bg-white/70 backdrop-blur-md border border-white/20 shadow-sm text-slate-800 hover:bg-white/90 active:scale-95 transition-all data-[selected=true]:bg-blue-500 data-[selected=true]:text-white data-[selected=true]:border-transparent data-[selected=true]:shadow-inner",
                hacker: "bg-black border border-green-500 text-green-500 font-mono shadow-[0_0_5px_rgba(34,197,94,0.5)] hover:bg-green-500/10 hover:shadow-[0_0_15px_rgba(34,197,94,0.7)] active:bg-green-500/20 data-[selected=true]:bg-green-500 data-[selected=true]:text-black data-[selected=true]:shadow-[0_0_20px_rgba(34,197,94,1)] transition-all",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)
