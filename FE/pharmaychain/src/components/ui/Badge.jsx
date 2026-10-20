import { cn } from "../../lib/cn";

const tones = {
    success: "bg-green-100  text-green-800  dark:bg-green-500/15  dark:text-green-300",
    warning: "bg-amber-100  text-amber-800  dark:bg-amber-500/15  dark:text-amber-300",
    danger: "bg-red-100    text-red-800    dark:bg-red-500/15    dark:text-red-300",
    info: "bg-sky-100    text-sky-800    dark:bg-sky-500/15    dark:text-sky-300",
    rx: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
};

export function Badge({ tone = "info", icon: Icon, className, children }) {
    return (
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>
            {Icon ? <Icon size={12} aria-hidden /> : <span className="size-1.5 rounded-full bg-current" aria-hidden />}
            {children}
        </span>
    );
}