import { Link } from "react-router-dom";

function HomePage() {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 24px",
            }}
        >
            <div style={{ maxWidth: 560, width: "100%" }}>
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 40,
                    }}
                >
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            background: "#000",
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: "0.5px",
                        }}
                    >
                        OG
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "#000", letterSpacing: "-0.3px" }}>
                        OilGas Booking
                    </span>
                </div>

                <h1
                    style={{
                        fontSize: 48,
                        fontWeight: 700,
                        color: "#000",
                        lineHeight: 1.1,
                        letterSpacing: "-2px",
                        marginBottom: 20,
                    }}
                >
                    Бронирование услуг нефтегазовых компаний
                </h1>

                <p
                    style={{
                        fontSize: 16,
                        color: "#666",
                        lineHeight: 1.7,
                        marginBottom: 40,
                        maxWidth: 480,
                    }}
                >
                    Платформа для поиска и бронирования профессиональных услуг:
                    бурение, геологоразведка, диагностика, техническое обслуживание и многое другое.
                </p>

                <div style={{ display: "flex", gap: 12 }}>
                    <Link
                        to="/login"
                        style={{
                            padding: "12px 28px",
                            background: "#000",
                            color: "#fff",
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: 14,
                            borderRadius: 2,
                            letterSpacing: "0.2px",
                        }}
                    >
                        Войти
                    </Link>
                    <Link
                        to="/register"
                        style={{
                            padding: "12px 28px",
                            background: "#fff",
                            color: "#000",
                            textDecoration: "none",
                            fontWeight: 500,
                            fontSize: 14,
                            borderRadius: 2,
                            border: "1px solid #000",
                            letterSpacing: "0.2px",
                        }}
                    >
                        Зарегистрироваться
                    </Link>
                </div>

                <div
                    style={{
                        marginTop: 64,
                        paddingTop: 40,
                        borderTop: "1px solid #e8e8e8",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 32,
                    }}
                >
                    {[
                        { num: "31", label: "Тип услуг" },
                        { num: "18", label: "Компаний" },
                        { num: "7", label: "Специалистов" },
                    ].map((item) => (
                        <div key={item.label}>
                            <div
                                style={{
                                    fontSize: 28,
                                    fontWeight: 700,
                                    color: "#000",
                                    letterSpacing: "-1px",
                                    lineHeight: 1,
                                    marginBottom: 4,
                                }}
                            >
                                {item.num}
                            </div>
                            <div style={{ fontSize: 12, color: "#999", fontWeight: 500 }}>
                                {item.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HomePage;
