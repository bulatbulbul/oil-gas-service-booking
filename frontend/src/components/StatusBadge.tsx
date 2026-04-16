import { BOOKING_STATUS_LABELS } from "../types";

type Props = {
    status: string;
};

const STATUS_TEXT: Record<string, string> = {
    ...BOOKING_STATUS_LABELS,
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
        if (s === "requested") {
            return { ...base, background: "#e8f0fe", color: "#1a56db" };
        }
        if (s === "approved") {
            return { ...base, background: "#e6f4ea", color: "#1e7e34" };
        }
        if (s === "completed") {
            return { ...base, background: "#f1f3f4", color: "#5f6368" };
        }
        if (s === "rejected") {
            return { ...base, background: "#fce8e6", color: "#c0392b" };
        }
        if (s === "cancelled") {
            return { ...base, background: "#f4f4f4", color: "#9aa0a6" };
        }
        return { ...base, background: "#f4f4f4", color: "#000" };
    })();

    return <span style={style}>{STATUS_TEXT[s] ?? status}</span>;
}

export default StatusBadge;
