import { useEffect, useState } from "react";

export function useTheme() {
    const [dark, setDark] = useState(() => {
        if (typeof window === "undefined") return false;
        const t = localStorage.getItem("theme");
        return t === "dark" || (!t && window.matchMedia("(prefers-color-scheme: dark)").matches);
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        localStorage.setItem("theme", dark ? "dark" : "light");
    }, [dark]);

    return { dark, toggle: () => setDark((d) => !d) };
}