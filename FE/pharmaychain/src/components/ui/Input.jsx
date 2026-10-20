import { useId } from "react";
import { cn } from "../../lib/cn";

export function Input({ label, hint, error, required, className, ...props }) {
    const id = useId();
    return (
        <div className="space-y-1.5 text-left">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-text">
                    {label}
                    {required && <span className="ml-0.5 text-red-600">*</span>}
                </label>
            )}
            <input
                id={id}
                required={required}
                aria-invalid={!!error}
                className={cn(
                    "h-11 w-full rounded-md border bg-surface px-3 text-base text-text outline-none transition",
                    "focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-600/25",
                    error ? "border-red-600" : "border-border",
                    className
                )}
                {...props}
            />
            {error ? (
                <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
            ) : (
                hint && <p className="text-xs text-text-muted">{hint}</p>
            )}
        </div>
    );
}