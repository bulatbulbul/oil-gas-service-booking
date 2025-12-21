import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

type Booking = {
    BookingID: number;
    Status: string;
    Description?: string | null;
    UserID?: number | null;
};

function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate(); // <-- вот здесь

    async function loadBookings() {
        try {
            setLoading(true);
            const res = await api.get<Booking[]>("/bookings");
            setBookings(res.data);
        } catch (err: any) {
            console.log("BOOKINGS ERROR", err.response?.status, err.response?.data);
            setError("Не удалось загрузить бронирования");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadBookings();
    }, []);

    if (loading) return <p style={{ margin: 20 }}>Загрузка...</p>;
    if (error) return <p style={{ margin: 20, color: "red" }}>{error}</p>;

    return (
        <div style={{ maxWidth: 700, margin: "40px auto" }}>
            <h1>Бронирования</h1>
            {bookings.length === 0 ? (
                <p>Нет бронирований</p>
            ) : (
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Статус</th>
                        <th>Описание</th>
                        <th>UserID</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {bookings.map((b) => (
                        <tr key={b.BookingID}>
                            <td>{b.BookingID}</td>
                            <td>{b.Status}</td>
                            <td>{b.Description || "—"}</td>
                            <td>{b.UserID ?? "—"}</td>
                            <td>
                                <button onClick={() => navigate(`/bookings/${b.BookingID}`)}>
                                    Открыть
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default BookingsPage;
