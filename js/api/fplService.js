import { LEAGUE_ID } from '../config.js';

// Usar proxy CORS para contornar bloqueio do browser
const PROXY = 'https://corsproxy.io/?';
const BASE_URL = 'https://fantasy.premierleague.com/api';

export async function fetchLeagueStandings() {
  const standingsUrl = `${PROXY}${encodeURIComponent(`${BASE_URL}/leagues-classic/${LEAGUE_ID}/standings/`)}`;
  
  const res = await fetch(standingsUrl);
  if (!res.ok) throw new Error('Não foi possível aceder à Liga FPL');
  
  const data = await res.json();
  const results = data.standings?.results || [];

  // Mapeia os managers mesmo sem histórico de jornadas ainda
  const managers = await Promise.all(
    results.map(async (entry) => {
      let historyData = [];
      try {
        const histUrl = `${PROXY}${encodeURIComponent(`${BASE_URL}/entry/${entry.entry}/history/`)}`;
        const histRes = await fetch(histUrl);
        if (histRes.ok) {
          const histJson = await histRes.json();
          historyData = histJson.current || [];
        }
      } catch (e) {
        historyData = [];
      }

      // Se a época ainda não começou, define 0 pontos e histórico vazio seguro
      const currentGWPoints = historyData.length > 0 ? historyData[historyData.length - 1].points : 0;
      const totalPoints = entry.total || 0;

      return {
        id: entry.entry,
        name: entry.player_name,
        team: entry.entry_name,
        currentGW: currentGWPoints,
        totalPts: totalPoints,
        history: historyData // Array vazio [] antes da GW1 arrancar
      };
    })
  );

  return managers;
}