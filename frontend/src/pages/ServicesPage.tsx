import { useEffect, useState } from "react";
import { api } from "../api";

type Service = {
    ServiceID: number;
    Title: string;
};

function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newTitle, setNewTitle] = useState("");
    const [creating, setCreating] = useState(false);

    async function loadServices() {
        try {
            setLoading(true);
            const res = await api.get<Service[]>("/services");
            setServices(res.data);
        } catch (err: any) {
            console.log("SERVICES ERROR", err.response?.status, err.response?.data);
            setError("Не удалось загрузить услуги");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadServices();
    }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!newTitle.trim()) return;

        try {
            setCreating(true);
            await api.post("/services", { title: newTitle });
            setNewTitle("");
            await loadServices();
        } catch (err: any) {
            console.log("CREATE SERVICE ERROR", err.response?.status, err.response?.data);
            alert("Ошибка создания услуги (нужно быть админом)");
        } finally {
            setCreating(false);
        }
    }

    if (loading) return <p style={{ margin: 20 }}>Загрузка...</p>;
    if (error) return <p style={{ margin: 20, color: "red" }}>{error}</p>;

    return (
        <div style={{ maxWidth: 600, margin: "40px auto" }}>
            <h1>Услуги</h1>

            <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
                <h3>Добавить услугу (для админа)</h3>
                <input
                    type="text"
                    placeholder="Название услуги"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                />
                <button type="submit" disabled={creating} style={{ marginLeft: 8 }}>
                    Создать
                </button>
            </form>

            {services.length === 0 ? (
                <p>Нет услуг</p>
            ) : (
                <ul>
                    {services.map((s) => (
                        <li key={s.ServiceID}>{s.Title}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ServicesPage;
