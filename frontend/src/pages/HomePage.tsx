import { Link } from "react-router-dom";

function HomePage() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "0 16px",
            }}
        >
            <div
                style={{
                    maxWidth: 480,
                    width: "100%",
                    textAlign: "center",
                    background: "white",
                    borderRadius: 16,
                    padding: "32px 24px 28px",
                    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.25)",
                }}
            >
                <div
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: "999px",
                        margin: "0 auto 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#007bff",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 18,
                    }}
                >
                    OG
                </div>

                <h1
                    style={{
                        fontSize: 26,
                        fontWeight: 700,
                        marginBottom: 10,
                        color: "#1f2933",
                    }}
                >
                    OilGas Booking
                </h1>

                <p
                    style={{
                        fontSize: 15,
                        color: "#52606d",
                        marginBottom: 10,
                    }}
                >
                    Сервис бронирования услуг у нефтегазовых компаний.
                </p>



                <div
                    style={{
                        display: "flex",
                        gap: 12,
                        justifyContent: "center",
                        flexWrap: "wrap",
                    }}
                >
                    <Link
                        to="/login"
                        style={{
                            padding: "10px 24px",
                            borderRadius: 999,
                            background: "#007bff",
                            color: "white",
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: 14,
                        }}
                    >
                        Войти
                    </Link>
                    <Link
                        to="/register"
                        style={{
                            padding: "10px 24px",
                            borderRadius: 999,
                            border: "1px solid #cbd2d9",
                            color: "#102a43",
                            textDecoration: "none",
                            fontWeight: 500,
                            fontSize: 14,
                            background: "#f5f7fa",
                        }}
                    >
                        Регистрация
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
