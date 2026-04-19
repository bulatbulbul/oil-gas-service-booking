import { Link } from "react-router-dom";

const sections = [
    { to: "/admin/users",            label: "Пользователи",     desc: "Просмотр и удаление аккаунтов" },
    { to: "/admin/analytics",        label: "Аналитика",        desc: "Бронирования, услуги и динамика" },
    { to: "/admin/service-requests", label: "Заявки на услуги", desc: "Запросы пользователей на новые услуги" },
    { to: "/admin/companies",        label: "Фото компаний",    desc: "Изменение логотипов компаний" },
    { to: "/admin/bookings",         label: "Все заявки",       desc: "Бронирования всех пользователей" },
];

function AdminPage() {
    return (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "72px 32px" }}>
            <h1 style={{ fontSize: 13, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 48 }}>
                Панель управления
            </h1>

            <div>
                {sections.map((s, i) => (
                    <Link
                        key={s.to}
                        to={s.to}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "24px 0",
                            borderTop: i === 0 ? "1px solid #000" : "1px solid #e8e8e8",
                            borderBottom: i === sections.length - 1 ? "1px solid #000" : "none",
                            textDecoration: "none",
                            color: "inherit",
                            transition: "padding-left 0.2s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.paddingLeft = "12px")}
                        onMouseLeave={e => (e.currentTarget.style.paddingLeft = "0px")}
                    >
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", color: "#000", marginBottom: 4 }}>
                                {s.label}
                            </div>
                            <div style={{ fontSize: 12, color: "#999" }}>
                                {s.desc}
                            </div>
                        </div>
                        <span style={{ fontSize: 20, color: "#ccc" }}>→</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default AdminPage;
