import { useEffect, useState } from "react";
import { searchArchitects, getArchitectSummary } from "../api/wikipedia";
import ArchitectCard from "../components/Architect";

export default function ArchitectsPage() {
    const [architects, setArchitects] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                // случайный запрос, чтобы каждый раз приходили разные данные
                const queries = [
                    "famous architects",
                    "modern architects",
                    "renaissance architects",
                    "female architects",
                    "brutalist architects",
                    "architectural designers",
                    "landscape architects"
                ];

                const query = queries[Math.floor(Math.random() * queries.length)];

                // 1. ищем архитекторов
                const results = await searchArchitects(query);

                // 2. берём топ-5 страниц
                const top = (results || []).slice(0, 5);

                // 3. получаем детали
                const fullData = await Promise.all(
                    top.map(item => getArchitectSummary(item.title))
                );

                setArchitects(fullData.filter(Boolean));
            } catch (err) {
                console.error(err);
                setError("Не удалось загрузить архитекторов.");
            }
        }

        load();
    }, []);

    if (error) {
        return <div className="grid">{error}</div>;
    }

    return (
        <div className="grid">
            {architects.map((a) => (
                <ArchitectCard
                    key={a.pageid || a.title || a.extract || Math.random()}
                    architect={a}
                />
            ))}
        </div>
    );
}
