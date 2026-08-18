import { LEAGUE_ID } from '../config.js';

const PROXY = 'https://corsproxy.io/?';
const BASE_URL = 'https://fantasy.premierleague.com/api';

// Função auxiliar com timeout de 5 segundos
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function fetchLeagueStandings() {
  const standingsUrl = `${PROXY}${encodeURIComponent(`${BASE_URL}/leagues-classic/${LEAGUE_ID}/standings/`)}`;
  
  const res = await fetchWithTimeout(standingsUrl);
  if (!res.ok) throw new Error('Não foi possível aceder à Liga FPL');
  
  const data = await res.json();
  const results = data.standings?.results || [];

  const managers = await Promise.all(
    results.map(async (entry) => {
      let historyData = [];
      try {
        const histUrl = `${PROXY}${encodeURIComponent(`${BASE_URL}/entry/${entry.entry}/history/`)}`;
        const histRes = await fetchWithTimeout(histUrl, {}, 3000);
        if (histRes.ok) {
          const histJson = await histRes.json();
          historyData = histJson.current || [];
        }
      } catch (e) {
        historyData = [];
      }

      const currentGWPoints = historyData.length > 0 ? historyData[historyData.length - 1].points : 0;
      const totalPoints = entry.total || 0;

      return {
        id: entry.entry,
        name: entry.player_name,
        team: entry.entry_name,
        currentGW: currentGWPoints,
        totalPts: totalPoints,
        history: historyData
      };
    })
  );

  return managers;
}