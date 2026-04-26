import { useEffect, useMemo, useState } from "react";
import { getAllServiceRequests, updateServiceRequestStatus, notifyCompanies, type ServiceRequest } from "../api/serviceRequests";


const pageStyle: React.CSSProperties = { maxWidth: 960, margin: "0 auto", padding: "48px 32px" };

const statusLabel: Record<string, string> = {
    pending: "Новая",
    reviewed: "Рассмотрено",
};

const statusStyle = (status: string): React.CSSProperties => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 2,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    background: status === "pending" ? "#000" : "#f0f0f0",
    color: status === "pending" ? "#fff" : "#999",
});

function AdminServiceRequestsPage() {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");
    const [sort, setSort] = useState<"new" | "old">("new");
    const [q, setQ] = useState("");

    async function load() {
        try {
            setLoading(true);
            setError(null);
            setRequests(await getAllServiceRequests());
        } catch {
            setError("Не удалось загрузить заявки");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function markReviewed(id: number) {
        await updateServiceRequestStatus(id, "reviewed");
        setRequests(prev => prev.map(r => r.request_id === id ? { ...r, status: "reviewed" } : r));
    }

    async function markPending(id: number) {
        await updateServiceRequestStatus(id, "pending");
        setRequests(prev => prev.map(r => r.request_id === id ? { ...r, status: "pending" } : r));
    }

    async function handleNotify(id: number) {
        try {
            const { notified } = await notifyCompanies(id);
            alert(`Уведомление отправлено ${notified} компаниям`);
        } catch {
            alert("Не удалось отправить уведомления");
        }
    }

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        let list = requests.filter(r => {
            if (filter !== "all" && r.status !== filter) return false;
            if (query) {
                const text = `${r.service_name} ${r.user?.Name ?? ""} ${r.comment ?? ""}`.toLowerCase();
                if (!text.includes(query)) return false;
            }
            return true;
        });
        return list.sort((a, b) =>
            sort === "old" ? a.request_id - b.request_id : b.request_id - a.request_id
        );
    }, [requests, filter, q, sort]);

    const pendingCount = requests.filter(r => r.status === "pending").length;

    if (loading) return <div style={pageStyle}><span style={{ color: "#999", fontSize: 14 }}>Загрузка...</span></div>;
    if (error) return (
        <div style={pageStyle}>
            <span style={{ fontSize: 14, color: "#000" }}>{error}</span>
            <button onClick={load} style={{ marginLeft: 16, fontSize: 13, cursor: "pointer", background: "none", border: "none", textDecoration: "underline", fontFamily: "inherit" }}>
                Повторить
            </button>
        </div>
    );

    return (
        <div style={pageStyle}>
            <div style={{ marginBottom: 8 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", margin: 0 }}>
                    Заявки на услуги
                </h1>
            </div>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 32 }}>
                {pendingCount > 0
                    ? <><b style={{ color: "#000" }}>{pendingCount}</b> новых заявок</>
                    : "Новых заявок нет"}
            </p>

            <div style={{ position: "relative", marginBottom: 16 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.35, pointerEvents: "none" }}>
                    <circle cx="6" cy="6" r="4.5" stroke="#000" strokeWidth="1.3" />
                    <path d="M9.5 9.5L12 12" stroke="#000" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <input
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    placeholder="Поиск по услуге, пользователю, комментарию..."
                    style={{ width: "100%", padding: "10px 12px 10px 34px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#fafafa", color: "#000" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.background = "#fff"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "#fafafa"; }}
                />
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {(["all", "pending", "reviewed"] as const).map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        style={{
                            padding: "7px 16px",
                            border: "1px solid",
                            borderColor: filter === s ? "#000" : "#e8e8e8",
                            borderRadius: 2,
                            background: filter === s ? "#000" : "#fff",
                            color: filter === s ? "#fff" : "#666",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            letterSpacing: "0.2px",
                        }}
                    >
                        {s === "all" ? "Все" : statusLabel[s]}
                    </button>
                ))}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
                <button
                    onClick={() => setSort(sort === "new" ? "old" : "new")}
                    style={{
                        width: 160, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                        padding: "6px 14px", borderRadius: 20, boxSizing: "border-box",
                        border: "1px solid #000", background: "#000", color: "#fff",
                        fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                    }}
                >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        {sort === "new"
                            ? <path d="M5.5 1v9M2 7l3.5 3.5L9 7" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            : <path d="M5.5 10V1M2 4L5.5.5 9 4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        }
                    </svg>
                    {sort === "new" ? "Сначала новые" : "Сначала старые"}
                </button>

            </div>

            {(q || filter !== "all") && (
                <p style={{ fontSize: 12, color: "#bbb", marginBottom: 20 }}>
                    Найдено: {filtered.length} из {requests.length}
                </p>
            )}

            {filtered.length === 0 ? (
                <p style={{ fontSize: 14, color: "#999" }}>Заявок нет</p>
            ) : (
                <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 160px 1fr", gap: 16, padding: "0 0 10px", borderBottom: "1px solid #000" }}>
                        {["Услуга / пользователь", "Дата", "Статус", ""].map(h => (
                            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</span>
                        ))}
                    </div>

                    {filtered.map((req) => (
                        <div
                            key={req.request_id}
                            style={{ display: "grid", gridTemplateColumns: "1fr 140px 160px 1fr", gap: 16, alignItems: "start", padding: "16px 0", borderBottom: "1px solid #e8e8e8" }}
                        >
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#000", marginBottom: 3 }}>
                                    {req.service_name}
                                </div>
                                {req.user && (
                                    <div style={{ fontSize: 12, color: "#999" }}>
                                        {req.user.Name}{req.user.Email ? ` · ${req.user.Email}` : ""}
                                    </div>
                                )}
                                {req.comment && (
                                    <div style={{ fontSize: 12, color: "#666", marginTop: 6, padding: "6px 10px", background: "#fafafa", borderRadius: 2, borderLeft: "2px solid #e8e8e8" }}>
                                        {req.comment}
                                    </div>
                                )}
                                {req.responses && req.responses.length > 0 && (
                                    <div style={{ marginTop: 8 }}>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>
                                            Откликнулись:
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                            {req.responses.map(r => (
                                                <span key={r.response_id} style={{ fontSize: 11, padding: "2px 8px", background: "#f0f0f0", borderRadius: 2, color: "#333" }}>
                                                    {r.company?.Name ?? `Компания #${r.company_id}`}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ fontSize: 12, color: "#999", paddingTop: 2 }}>
                                {new Date(req.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
                            </div>

                            <div style={{ paddingTop: 2 }}>
                                <span style={statusStyle(req.status)}>{statusLabel[req.status]}</span>
                            </div>

                            <div style={{ paddingTop: 2, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {req.status === "pending" ? (
                                    <div style={{ position: "relative" }} title={(req.responses?.length ?? 0) === 0 ? "Нет откликов — всё равно можно закрыть" : undefined}>
                                        <button
                                            onClick={() => markReviewed(req.request_id)}
                                            style={{
                                                padding: "5px 12px", borderRadius: 2, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                                border: (req.responses?.length ?? 0) > 0 ? "1px solid #000" : "1px solid #ccc",
                                                background: "#fff",
                                                color: (req.responses?.length ?? 0) > 0 ? "#000" : "#aaa",
                                            }}
                                            onMouseEnter={e => {
                                                const has = (req.responses?.length ?? 0) > 0;
                                                e.currentTarget.style.background = has ? "#000" : "#f5f5f5";
                                                e.currentTarget.style.color = has ? "#fff" : "#666";
                                            }}
                                            onMouseLeave={e => {
                                                const has = (req.responses?.length ?? 0) > 0;
                                                e.currentTarget.style.background = "#fff";
                                                e.currentTarget.style.color = has ? "#000" : "#aaa";
                                            }}
                                        >
                                            Рассмотрено
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => markPending(req.request_id)}
                                        style={{ padding: "5px 12px", border: "1px solid #e8e8e8", borderRadius: 2, background: "#fff", color: "#999", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.color = "#999"; }}
                                    >
                                        Вернуть
                                    </button>
                                )}
                                {req.status === "pending" && (
                                    <button
                                        onClick={() => handleNotify(req.request_id)}
                                        style={{ padding: "5px 12px", border: "1px solid #e8e8e8", borderRadius: 2, background: "#fff", color: "#555", fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.color = "#555"; }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                                            <path d="M9 1.5A5.25 5.25 0 0 0 3.75 6.75c0 2.625-.75 3.75-1.5 4.5h13.5c-.75-.75-1.5-1.875-1.5-4.5A5.25 5.25 0 0 0 9 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                                            <path d="M7.5 15a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                        </svg>
                                        Разослать компаниям
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminServiceRequestsPage;
