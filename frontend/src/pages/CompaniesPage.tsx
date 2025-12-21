import { useEffect, useState } from "react";
import { api } from "../api";

type Company = {
    CompanyID: number;
    Name: string;
};

function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const res = await api.get<Company[]>("/companies");
                setCompanies(res.data);
            } catch (err: any) {
                console.log("COMPANIES ERROR", err.response?.status, err.response?.data);
                setError("Не удалось загрузить компании");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <p style={{ margin: 20 }}>Загрузка...</p>;
    if (error) return <p style={{ margin: 20, color: "red" }}>{error}</p>;

    return (
        <div style={{ maxWidth: 600, margin: "40px auto" }}>
            <h1>Компании</h1>
            {companies.length === 0 ? (
                <p>Нет компаний</p>
            ) : (
                <ul>
                    {companies.map((c) => (
                        <li key={c.CompanyID}>{c.Name}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CompaniesPage;
