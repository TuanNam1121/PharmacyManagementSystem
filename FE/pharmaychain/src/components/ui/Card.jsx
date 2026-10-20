import { cn } from "../../lib/cn";

export function Card({ interactive, className, ...props }) {
    return (
        <div
            className={cn(
                "rounded-lg border border-border bg-surface p-6 shadow-sm",
                interactive && "transition duration-200 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                className
            )}
            {...props}
        />
    );
}