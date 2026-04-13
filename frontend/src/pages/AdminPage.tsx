import { Link } from "react-router-dom";

const sections = [
    { to: "/admin/users", label: "Пользователи", desc: "Просмотр и удаление аккаунтов" },
    { to: "/admin/analytics", label: "Аналитика", desc: "Активные бронирования и статистика" },
    { to: "/admin/service-requests", label: "Заявки на услуги", desc: "Запросы пользователей на новые услуги" },
];

function AdminPage() {
    return (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 32px" }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 8 }}>
                Администратор
            </h1>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 40 }}>
                Управление платформой
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 560 }}>
                {sections.map((s) => (
                    <Link
                        key={s.to}
                        to={s.to}
                        style={{
                            padding: "24px",
                            border: "1px solid #e8e8e8",
                            borderRadius: 4,
                            textDecoration: "none",
                            display: "block",
                            transition: "border-color 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "#000")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "#e8e8e8")}
                    >
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#000", marginBottom: 6, letterSpacing: "-0.3px" }}>
                            {s.label}
                        </div>
                        <div style={{ fontSize: 12, color: "#999" }}>
                            {s.desc}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default AdminPage;
