import { useSearch } from "../hooks/useSearch";

const pageStyle: React.CSSProperties = { maxWidth: 960, margin: "0 auto", padding: "48px 32px" };

const statusBoxStyle = (isError: boolean): React.CSSProperties => ({
    padding: "10px 16px",
    border: `1px solid ${isError ? "#000" : "#e8e8e8"}`,
    borderRadius: 2,
    fontSize: 13,
    color: "#000",
    background: "#fafafa",
    marginBottom: 16,
});

function SearchServicesPage() {
    const {
        query,
        results,
        filteredServices,
        showSuggestions,
        loading,
        servicesLoading,
        error,
        message,
        onQueryChange,
        selectSuggestion,
        setShowSuggestions,
        handleSearch,
        handleBook,
    } = useSearch();

    return (
        <div style={pageStyle}>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", marginBottom: 8 }}>
                Поиск услуги
            </h1>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 36 }}>
                Найдите услугу и выберите компанию для бронирования
            </p>

            <form onSubmit={handleSearch} style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", gap: 8, position: "relative" }}>
                    <div style={{ flex: 1, position: "relative" }}>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => onQueryChange(e.target.value)}
                            placeholder={servicesLoading ? "Загрузка услуг..." : "Название услуги..."}
                            onFocus={() => query.trim() && setShowSuggestions(filteredServices.length > 0)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            disabled={servicesLoading}
                            style={{
                                width: "100%",
                                padding: "11px 14px",
                                border: "1px solid #000",
                                borderRadius: 2,
                                fontSize: 14,
                                fontFamily: "inherit",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />

                        {showSuggestions && filteredServices.length > 0 && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    right: 0,
                                    background: "#fff",
                                    border: "1px solid #000",
                                    borderTop: "none",
                                    borderRadius: "0 0 2px 2px",
                                    maxHeight: 240,
                                    overflowY: "auto",
                                    zIndex: 20,
                                }}
                            >
                                {filteredServices.map((svc) => (
                                    <div
                                        key={svc.ServiceID}
                                        onMouseDown={() => selectSuggestion(svc.Title)}
                                        style={{
                                            padding: "10px 14px",
                                            fontSize: 13,
                                            color: "#000",
                                            cursor: "pointer",
                                            borderBottom: "1px solid #f4f4f4",
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "#f4f4f4")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                                    >
                                        {svc.Title}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || servicesLoading}
                        style={{
                            padding: "11px 28px",
                            background: "#000",
                            color: "#fff",
                            border: "none",
                            borderRadius: 2,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: loading ? "default" : "pointer",
                            fontFamily: "inherit",
                            opacity: loading ? 0.5 : 1,
                            letterSpacing: "0.2px",
                            flexShrink: 0,
                        }}
                    >
                        {loading ? "Поиск..." : "Найти"}
                    </button>
                </div>
            </form>

            {error && <div style={statusBoxStyle(true)}>{error}</div>}
            {message && <div style={statusBoxStyle(false)}>{message}</div>}

            {results.length > 0 && (
                <div>
                    <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #000" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#000" }}>
                            Компании, предоставляющие «{query}»
                        </span>
                        <span style={{ fontSize: 13, color: "#666", marginLeft: 10 }}>
                            {results.length} результатов
                        </span>
                    </div>

                    {results.map((company) => (
                        <div
                            key={company.CompanyServiceID}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "16px 0",
                                borderBottom: "1px solid #e8e8e8",
                                gap: 16,
                            }}
                        >
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: "#000" }}>
                                    {company.Name}
                                </div>
                                <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                                    ID компании: {company.CompanyID}
                                </div>
                            </div>
                            <button
                                onClick={() => handleBook(company)}
                                style={{
                                    padding: "8px 20px",
                                    background: "#000",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 2,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    flexShrink: 0,
                                    letterSpacing: "0.2px",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                            >
                                Забронировать
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchServicesPage;
