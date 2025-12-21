import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

type BookingCreateRequest = {
    user_id?: number;
    description?: string;
    status?: string;
};

function NewBookingPage() {
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("requested");
    const [userId, setUserId] = useState<string>(""); // только для админа
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const payload: BookingCreateRequest = {
            description: description || undefined,
            status: status || undefined,
        };

        if (userId.trim() !== "") {
            payload.user_id = Number(userId);
        }

        try {
            setCreating(true);
            await api.post("/bookings", payload);
            navigate("/bookings");
        } catch (err: any) {
            console.log("CREATE BOOKING ERROR", err.response?.status, err.response?.data);
            setError("Ошибка создания бронирования (нужно быть авторизованным, для user_id — админом)");
        } finally {
            setCreating(false);
        }
    }

    return (
        <div style={{ maxWidth: 500, margin: "40px auto" }}>
            <h1>Новое бронирование</h1>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 10 }}>
                    <label>Описание</label>
                    <br />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        style={{ width: "100%" }}
                    />
                </div>

                <div style={{ marginBottom: 10 }}>
                    <label>Статус</label>
                    <br />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="requested">requested</option>
                        <option value="active">active</option>
                        <option value="completed">completed</option>
                        <option value="">(не указывать)</option>
                    </select>
                </div>

                <div style={{ marginBottom: 10 }}>
                    <label>User ID (опционально, для админа)</label>
                    <br />
                    <input
                        type="number"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="Если оставить пустым, возьмет текущего пользователя"
                    />
                </div>

                <button type="submit" disabled={creating}>
                    Создать
                </button>
            </form>
            {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
        </div>
    );
}

export default NewBookingPage;
