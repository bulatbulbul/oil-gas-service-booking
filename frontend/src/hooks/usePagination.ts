import { useState, useMemo } from "react";

export function usePagination<T>(items: T[], pageSize = 10) {
    const [page, setPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [items, page, pageSize]);

    function goTo(p: number) {
        setPage(Math.min(Math.max(1, p), totalPages));
    }

    useMemo(() => {
        if (page > totalPages) setPage(1);
    }, [totalPages]);

    return { paged, page, totalPages, goTo };
}
