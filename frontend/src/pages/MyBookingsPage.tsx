import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

type Booking = {
    BookingID: number;
    Status: string;
    Description?: string | null;
    UserID?: number | null;
};

function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [sort, setSort] = useState<"new" | "old">("new");

    async function load() {
        try {
            setLoading(true);
            setError(null);

            const res = await api.get("/bookings/me");
            const data = Array.isArray(res.data) ? res.data : [];
            setBookings(data);
        } catch (err: any) {
            console.log("MY BOOKINGS ERROR", err.response?.status, err.response?.data);
            setError("Не удалось загрузить мои бронирования");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(bookingId: number) {
        if (!confirm(`Удалить бронирование #${bookingId}?`)) return;

        try {
            await api.delete(`/bookings/${bookingId}/me`);
            await load();
        } catch (err: any) {
            console.log("DELETE BOOKING ERROR", err.response?.status, err.response?.data);
            alert("Не удалось удалить бронирование");
        }
    }

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        let list = bookings;

        if (query) {
            list = list.filter((b) => {
                const text = `${b.BookingID} ${b.Status} ${b.Description ?? ""}`.toLowerCase();
                return text.includes(query);
            });
        }

        list = [...list].sort((a, b) =>
            sort === "new" ? b.BookingID - a.BookingID : a.BookingID - b.BookingID
        );

        return list;
    }, [bookings, q, sort]);

    function statusColor(status: string) {
        const s = status.toLowerCase();
        if (s.includes("requested") || s.includes("нов")) {
            return { bg: "#eff6ff", text: "#1d4ed8" };
        }
        if (s.includes("approved") || s.includes("подт")) {
            return { bg: "#ecfdf3", text: "#166534" };
        }
        if (s.includes("cancel") || s.includes("отмен")) {
            return { bg: "#fef2f2", text: "#b91c1c" };
        }
        return { bg: "#f3f4f6", text: "#374151" };
    }

    if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>;
    if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;

    return (
        <div
            style={{
                minHeight: "calc(100vh - 160px)",
                display: "flex",
                justifyContent: "center",
                padding: "32px 16px",
            }}
        >
            <div
                style={{
                    maxWidth: 900,
                    width: "100%",
                    background: "white",
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: 22,
                        fontWeight: 600,
                        color: "#111827",
                    }}
                >
                    Мои бронирования
                </h2>

                <div
                    style={{
                        marginTop: 12,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                    }}
                >
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Поиск по ID, статусу или описанию"
                        style={{
                            flex: 1,
                            minWidth: 260,
                            padding: "8px 10px",
                            border: "1px solid #d1d5db",
                            borderRadius: 10,
                            fontSize: 14,
                        }}
                    />

                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as "new" | "old")}
                        style={{
                            padding: "8px 10px",
                            borderRadius: 10,
                            border: "1px solid #d1d5db",
                            fontSize: 14,
                            minWidth: 170,
                        }}
                    >
                        <option value="new">Сначала новые</option>
                        <option value="old">Сначала старые</option>
                    </select>
                </div>

                <div
                    style={{
                        marginTop: 10,
                        color: "#6b7280",
                        fontSize: 13,
                    }}
                >
                    Найдено: {filtered.length} из {bookings.length}
                </div>

                {filtered.length === 0 ? (
                    <div
                        style={{
                            marginTop: 20,
                            fontSize: 14,
                            color: "#6b7280",
                        }}
                    >
                        У вас пока нет бронирований или текущий фильтр ничего не нашёл.
                    </div>
                ) : (
                    <div
                        style={{
                            marginTop: 16,
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                        }}
                    >
                        {filtered.map((b) => {
                            const { bg, text } = statusColor(b.Status);
                            return (
                                <div
                                    key={b.BookingID}
                                    style={{
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 12,
                                        padding: 12,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 12,
                                        alignItems: "flex-start",
                                        background: "#f9fafb",
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                                marginBottom: 4,
                                            }}
                                        >
                      <span
                          style={{
                              fontWeight: 600,
                              fontSize: 15,
                              color: "#111827",
                          }}
                      >
                        Бронирование #{b.BookingID}
                      </span>
                                            <span
                                                style={{
                                                    padding: "2px 8px",
                                                    borderRadius: 999,
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    background: bg,
                                                    color: text,
                                                }}
                                            >
                        {b.Status}
                      </span>
                                        </div>

                                        <div
                                            style={{
                                                marginTop: 4,
                                                fontSize: 14,
                                                color: "#4b5563",
                                            }}
                                        >
                                            {b.Description || "Без описания"}
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 8,
                                            minWidth: 120,
                                            alignItems: "flex-end",
                                        }}
                                    >
                                        <button
                                            onClick={() => handleDelete(b.BookingID)}
                                            style={{
                                                padding: "6px 12px",
                                                borderRadius: 8,
                                                border: "none",
                                                background: "#ef4444",
                                                color: "white",
                                                fontSize: 13,
                                                fontWeight: 500,
                                                cursor: "pointer",
                                            }}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyBookingsPage;
