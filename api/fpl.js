// api/fpl.js
export default async function handler(request, response) {
    const { endpoint } = request.query;

    if (!endpoint) {
        return response.status(400).json({ error: 'Endpoint em falta.' });
    }

    const fplUrl = `https://fantasy.premierleague.com/api/${endpoint}`;

    try {
        const res = await fetch(fplUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        if (!res.ok) {
            return response.status(res.status).json({ error: `FPL API erro: ${res.statusText}` });
        }

        const data = await res.json();
        
        // Cache opcional de 60s para evitar excesso de pedidos à FPL
        response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        return response.status(200).json(data);
    } catch (error) {
        return response.status(500).json({ error: 'Falha ao contactar a API da FPL.' });
    }
}