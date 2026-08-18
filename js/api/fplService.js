import { CONFIG } from '../config.js';

export async function fetchLeagueStandings() {
  const proxy = 'https://corsproxy.io/?';
  const leagueUrl = `${proxy}${encodeURIComponent(`https://fantasy.premierleague.com/api/leagues-classic/${CONFIG.LEAGUE_ID}/standings/`)}`;
  
  const res = await fetch(leagueUrl);
  if (!res.ok) throw new Error('Falha ao obter classificação da liga');
  
  const data = await res.json();
  const standings = data.standings.results;

  const entriesPromises = standings.map(async (entry) => {
    const historyUrl = `${proxy}${encodeURIComponent(`https://fantasy.premierleague.com/api/entry/${entry.entry}/history/`)}`;
    const hRes = await fetch(historyUrl);
    const hData = await hRes.json();
    
    const gwPoints = Array(CONFIG.TOTAL_GWS).fill(null);
    if (hData.current) {
      hData.current.forEach(w => {
        gwPoints[w.event - 1] = w.points;
      });
    }

    return {
      id: entry.entry,
      name: entry.player_name,
      team: entry.entry_name,
      currentGW: entry.event_total,
      totalPts: entry.total,
      gwPoints
    };
  });

  return Promise.all(entriesPromises);
}