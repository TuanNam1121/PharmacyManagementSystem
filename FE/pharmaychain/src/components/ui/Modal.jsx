import { useEffect, useRef } from "react";

export function Modal({ open, onClose, title, children, footer }) {
    const ref = useRef(null);
    useEffect(() => {
        const d = ref.current;
        if (!d) return;
        if (open && !d.open) d.showModal();
        if (!open && d.open) d.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            onClose={onClose}
            className="m-auto w-full max-w-lg rounded-xl border border-border bg-surface p-0 text-text shadow-lg backdrop:bg-slate-900/50"
        >
            <div className="space-y-4 p-6">
                <h3 className="font-heading text-xl font-semibold">{title}</h3>
                {children}
            </div>
            {footer && <div className="flex justify-end gap-3 border-t border-border p-4 bg-bg-subtle">{footer}</div>}
        </dialog>
    );
}