import { Link } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";

const pageStyle: React.CSSProperties = { maxWidth: 960, margin: "0 auto", padding: "48px 32px" };

function ProfilePage() {
    const { me, loading, error, handleLogout } = useProfile();

    if (loading) return <div style={pageStyle}><span style={{ color: "#999", fontSize: 14 }}>Загрузка...</span></div>;
    if (error) return <div style={pageStyle}><span style={{ color: "#000", fontSize: 14 }}>{error}</span></div>;

    const initials = me?.name?.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2) || "U";

    return (
        <div style={pageStyle}>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 40 }}>
                Профиль
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40, paddingBottom: 40, borderBottom: "1px solid #e8e8e8" }}>
                <div
                    style={{
                        width: 56,
                        height: 56,
                        background: "#000",
                        borderRadius: 2,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 18,
                        flexShrink: 0,
                        letterSpacing: "0.5px",
                    }}
                >
                    {initials}
                </div>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.4px", color: "#000" }}>
                        {me?.name || "Без имени"}
                    </div>
                    <div style={{ marginTop: 2, fontSize: 13, color: "#666" }}>
                        {me?.email || "Email не указан"}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                        {me?.role === "admin" ? "Администратор" : "Пользователь"}
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 16 }}>
                    Быстрый переход
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                        { to: "/bookings/my", label: "Мои брони" },
                        { to: "/companies", label: "Мои компании" },
                        { to: "/search", label: "Поиск услуги" },
                    ].map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            style={{
                                padding: "8px 16px",
                                border: "1px solid #e8e8e8",
                                borderRadius: 2,
                                fontSize: 13,
                                color: "#000",
                                textDecoration: "none",
                                fontWeight: 500,
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>

            <button
                onClick={handleLogout}
                style={{
                    padding: "10px 24px",
                    border: "1px solid #000",
                    borderRadius: 2,
                    background: "#fff",
                    color: "#000",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    letterSpacing: "0.2px",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f4f4f4")}
                onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
            >
                Выйти из аккаунта
            </button>
        </div>
    );
}

export default ProfilePage;
