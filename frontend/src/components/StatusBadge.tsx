type Props = {
    status: string;
};

function StatusBadge({ status }: Props) {
    const s = status.toLowerCase();

    const style: React.CSSProperties = (() => {
        const base: React.CSSProperties = {
            padding: "2px 10px",
            borderRadius: 2,
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            display: "inline-block",
        };
        if (s === "active" || s === "approved") {
            return { ...base, background: "#000", color: "#fff" };
        }
        if (s === "cancelled") {
            return { ...base, background: "#fff", color: "#999", border: "1px solid #e8e8e8" };
        }
        if (s === "completed") {
            return { ...base, background: "#f4f4f4", color: "#666" };
        }
        return { ...base, background: "#f4f4f4", color: "#000" };
    })();

    return <span style={style}>{status}</span>;
}

export default StatusBadge;
