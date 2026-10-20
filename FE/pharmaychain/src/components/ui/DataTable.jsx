import { cn } from "../../lib/cn";

/** columns: [{ key, header, numeric?, render?(row) }] */
export function DataTable({ columns, rows, loading, empty = "Không có dữ liệu", compact }) {
    const cell = compact ? "h-10" : "h-12";
    return (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full text-sm">
                <thead className="sticky top-0 bg-bg-subtle border-b border-border">
                    <tr>
                        {columns.map((c) => (
                            <th key={c.key} className={cn("px-4 py-3 font-semibold text-text", c.numeric ? "text-right" : "text-left")}>
                                {c.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border text-text">
                    {loading && Array.from({ length: 5 }, (_, i) => (
                        <tr key={i}>
                            <td colSpan={columns.length} className="px-4 py-3">
                                <div className="h-4 animate-pulse rounded bg-bg-subtle" />
                            </td>
                        </tr>
                    ))}
                    {!loading && rows.length === 0 && (
                        <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-text-muted">{empty}</td></tr>
                    )}
                    {!loading && rows.map((row, i) => (
                        <tr key={row.id ?? i} className="hover:bg-primary-50 dark:hover:bg-primary-600/10 transition">
                            {columns.map((c) => (
                                <td key={c.key} className={cn("px-4", cell, c.numeric && "text-right tabular-nums")}>
                                    {c.render ? c.render(row) : row[c.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}