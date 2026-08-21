import { CONFIG } from '../config.js';

export async function fetchWithCORS(url) {
    // 1. Tentar os proxies
    for (const proxy of CONFIG.API.PROXIES) {
        try {
            const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (e) {
            console.warn(`Proxy ${proxy} falhou, a tentar o próximo...`);
        }
    }

    // 2. Tentar direto como último recurso
    try {
        const response = await fetch(url);
        if (response.ok) return await response.json();
    } catch (e) {
        console.error(`Erro ao carregar URL: ${url}`, e);
    }

    throw new Error(`Falha total ao obter dados de: ${url}`);
}

export async function getLeagueStandings(leagueId = CONFIG.LEAGUE_ID) {
    const url = `${CONFIG.API.FPL_BASE}/leagues-classic/${leagueId}/standings/`;
    const data = await fetchWithCORS(url);
    console.log("Dados recebidos da Liga:", data);

    if (!data.standings) {
        data.standings = { results: [] };
    }

    // Se a liga ainda não começou, usar as inscrições (new_entries)
    const hasStandings = data.standings.results && data.standings.results.length > 0;
    const newEntries = (data.new_entries && data.new_entries.results) ? data.new_entries.results : [];

    if (!hasStandings && newEntries.length > 0) {
        data.standings.results = newEntries.map((entry, index) => ({
            id: entry.id || index + 1,
            event_total: 0,
            player_name: entry.player_first_name 
                ? `${entry.player_first_name} ${entry.player_last_name}` 
                : (entry.player_name || 'Manager'),
            rank: index + 1,
            last_rank: index + 1,
            rank_sort: index + 1,
            total: 0,
            entry: entry.entry,
            entry_name: entry.entry_name
        }));
    }

    return data;
}

export async function getBootstrapStatic() {
    const url = `${CONFIG.API.FPL_BASE}/bootstrap-static/`;
    return await fetchWithCORS(url);
}

export async function getManagerHistory(entryId) {
    const url = `${CONFIG.API.FPL_BASE}/entry/${entryId}/history/`;
    return await fetchWithCORS(url);
}