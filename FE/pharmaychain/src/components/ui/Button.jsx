import { cn } from "../../lib/cn";

const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700",
    accent: "bg-accent-600 text-white hover:bg-accent-700",
    secondary: "border border-primary-600 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:border-primary-400 dark:hover:bg-primary-600/15",
    ghost: "text-text hover:bg-primary-50 dark:hover:bg-primary-600/15",
    danger: "bg-red-600 text-white hover:bg-red-700",
};
const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-5 text-sm",
    lg: "h-12 px-6 text-base",
};

export function Button({ variant = "primary", size = "md", className, ...props }) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition cursor-pointer",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
                "disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
}