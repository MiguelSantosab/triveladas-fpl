import { CONFIG } from '../config.js';

// Função auxiliar para chamar a Serverless Function na Vercel (/api/fpl)
async function fetchFPL(endpoint) {
    const url = `/api/fpl?endpoint=${encodeURIComponent(endpoint)}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Erro ao carregar endpoint: ${endpoint}`, error);
        throw error;
    }
}

export async function getLeagueStandings(leagueId = CONFIG.LEAGUE_ID) {
    const endpoint = `leagues-classic/${leagueId}/standings/`;
    const data = await fetchFPL(endpoint);
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
    return await fetchFPL('bootstrap-static/');
}

export async function getManagerHistory(entryId) {
    return await fetchFPL(`entry/${entryId}/history/`);
}

export async function getManagerPicks(entryId, eventId) {
    return await fetchFPL(`entry/${entryId}/event/${eventId}/picks/`);
}