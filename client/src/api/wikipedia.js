export async function searchArchitects(query) {
    const res = await fetch(`https://ru.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`);

    const data = await res.json();
    return data.query.search;
}

export async function getArchitectSummary(title) {
    const res = await fetch(`https://ru.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);

    return await res.json();
}