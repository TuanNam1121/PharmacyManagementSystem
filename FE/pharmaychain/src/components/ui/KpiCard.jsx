import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "./Card";
import { cn } from "../../lib/cn";

export function KpiCard({ icon: Icon, label, value, delta }) {
    const up = delta >= 0;
    return (
        <Card>
            <div className="flex size-11 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-600/25 dark:text-primary-400">
                <Icon size={20} aria-hidden />
            </div>
            <p className="mt-4 font-heading text-3xl font-bold tabular-nums text-text">{value}</p>
            <p className="mt-1 text-sm text-text-muted">{label}</p>
            {delta != null && (
                <p className={cn("mt-3 inline-flex items-center gap-1 text-xs font-semibold",
                    up ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400")}>
                    {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(delta)}% so với hôm qua
                </p>
            )}
        </Card>
    );
}