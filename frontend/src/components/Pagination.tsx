type Props = {
    page: number;
    totalPages: number;
    onPage: (p: number) => void;
};

function Pagination({ page, totalPages, onPage }: Props) {
    if (totalPages <= 1) return null;

    const btnStyle = (active: boolean, disabled: boolean): React.CSSProperties => ({
        padding: "5px 10px",
        border: "1px solid",
        borderColor: active ? "#000" : "#e8e8e8",
        borderRadius: 2,
        background: active ? "#000" : "#fff",
        color: active ? "#fff" : disabled ? "#ccc" : "#000",
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
        minWidth: 32,
        textAlign: "center",
    });

    const pages: (number | "…")[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (page > 3) pages.push("…");
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
        if (page < totalPages - 2) pages.push("…");
        pages.push(totalPages);
    }

    return (
        <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 24 }}>
            <button
                onClick={() => onPage(page - 1)}
                disabled={page === 1}
                style={btnStyle(false, page === 1)}
            >
                ←
            </button>

            {pages.map((p, i) =>
                p === "…" ? (
                    <span key={`e${i}`} style={{ padding: "5px 6px", fontSize: 12, color: "#999" }}>…</span>
                ) : (
                    <button key={p} onClick={() => onPage(p)} style={btnStyle(p === page, false)}>
                        {p}
                    </button>
                )
            )}

            <button
                onClick={() => onPage(page + 1)}
                disabled={page === totalPages}
                style={btnStyle(false, page === totalPages)}
            >
                →
            </button>
        </div>
    );
}

export default Pagination;
