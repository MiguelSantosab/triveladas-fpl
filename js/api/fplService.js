import { CONFIG } from '../config.js';

export async function fetchWithCORS(url) {
    try {
        const response = await fetch(url);
        if (response.ok) return await response.json();
    } catch (e) {
        console.warn("Direct fetch failed, trying proxy...", e);
    }

    // Tentar Proxies se o fetch direto falhar por CORS
    for (const proxy of CONFIG.API.PROXIES) {
        try {
            const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            if (response.ok) return await response.json();
        } catch (e) {
            console.warn(`Proxy ${proxy} failed, trying next...`);
        }
    }
    throw new Error(`Falha ao obter dados de: ${url}`);
}

export async function getLeagueStandings(leagueId = CONFIG.LEAGUE_ID) {
    const url = `${CONFIG.API.FPL_BASE}/leagues-classic/${leagueId}/standings/`;
    const data = await fetchWithCORS(url);

    // Fallback: se a GW1 ainda não fechou e standings.results estiver vazio
    if (data && data.standings && (!data.standings.results || data.standings.results.length === 0)) {
        if (data.new_entries && data.new_entries.results && data.new_entries.results.length > 0) {
            data.standings.results = data.new_entries.results.map((entry, index) => ({
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

export async function getManagerPicks(entryId, eventId) {
    const url = `${CONFIG.API.FPL_BASE}/entry/${entryId}/event/${eventId}/picks/`;
    return await fetchWithCORS(url);
}