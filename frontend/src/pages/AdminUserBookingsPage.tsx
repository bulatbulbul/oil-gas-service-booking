import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";

type Booking = {
    BookingID: number;
    Status: string;
    Description?: string | null;
    UserID?: number | null;
};

function AdminUserBookingsPage() {
    const { id } = useParams<{ id: string }>();
    const userId = Number(id);

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        try {
            setLoading(true);
            setError(null);

            const res = await api.get("/bookings", {
                params: { user_id: userId },
            });

            const data = Array.isArray(res.data) ? res.data : [];
            setBookings(data);
        } catch (err: any) {
            console.log("ADMIN USER BOOKINGS ERROR", err.response?.status, err.response?.data);
            setError("Не удалось загрузить бронирования пользователя");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!Number.isNaN(userId)) {
            load();
        }
    }, [userId]);

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
                    padding: 20,
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.1)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: 12,
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: 20,
                            fontWeight: 600,
                            color: "#111827",
                        }}
                    >
                        Бронирования пользователя #{userId}
                    </h2>
                    <Link
                        to="/admin/analytics"
                        style={{
                            fontSize: 13,
                            color: "#2563eb",
                            textDecoration: "none",
                        }}
                    >
                        ← К аналитике
                    </Link>
                </div>

                {bookings.length === 0 ? (
                    <div
                        style={{
                            marginTop: 12,
                            fontSize: 14,
                            color: "#6b7280",
                        }}
                    >
                        У этого пользователя пока нет бронирований.
                    </div>
                ) : (
                    <div
                        style={{
                            marginTop: 8,
                            overflowX: "auto",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: 14,
                            }}
                        >
                            <thead>
                            <tr style={{ background: "#f9fafb" }}>
                                <th
                                    style={{
                                        borderBottom: "1px solid #e5e7eb",
                                        textAlign: "left",
                                        padding: 8,
                                        fontWeight: 500,
                                        color: "#4b5563",
                                        width: 80,
                                    }}
                                >
                                    ID
                                </th>
                                <th
                                    style={{
                                        borderBottom: "1px solid #e5e7eb",
                                        textAlign: "left",
                                        padding: 8,
                                        fontWeight: 500,
                                        color: "#4b5563",
                                        width: 140,
                                    }}
                                >
                                    Статус
                                </th>
                                <th
                                    style={{
                                        borderBottom: "1px solid #e5e7eb",
                                        textAlign: "left",
                                        padding: 8,
                                        fontWeight: 500,
                                        color: "#4b5563",
                                    }}
                                >
                                    Описание
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {bookings.map((b) => {
                                const { bg, text } = statusColor(b.Status);
                                return (
                                    <tr key={b.BookingID}>
                                        <td
                                            style={{
                                                borderBottom: "1px solid #f3f4f6",
                                                padding: 8,
                                                color: "#4b5563",
                                            }}
                                        >
                                            {b.BookingID}
                                        </td>
                                        <td
                                            style={{
                                                borderBottom: "1px solid #f3f4f6",
                                                padding: 8,
                                            }}
                                        >
                        <span
                            style={{
                                display: "inline-block",
                                padding: "2px 8px",
                                borderRadius: 999,
                                background: bg,
                                color: text,
                                fontSize: 12,
                                fontWeight: 500,
                            }}
                        >
                          {b.Status}
                        </span>
                                        </td>
                                        <td
                                            style={{
                                                borderBottom: "1px solid #f3f4f6",
                                                padding: 8,
                                                color: "#111827",
                                            }}
                                        >
                                            {b.Description || "Без описания"}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminUserBookingsPage;
