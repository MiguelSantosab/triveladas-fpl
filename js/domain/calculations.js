import { CONFIG } from '../config.js';

export function calculateCostsMatrix(leagueData) {
  const N = leagueData.length;
  if (N === 0) return {};
  
  const cutoffIndex = Math.floor(N / 2);
  const matrix = {};
  leagueData.forEach(m => matrix[m.id] = Array(CONFIG.TOTAL_GWS).fill(null));

  for (let gw = 0; gw < CONFIG.TOTAL_GWS; gw++) {
    const gwScores = leagueData
      .map(m => ({ id: m.id, pts: m.gwPoints[gw] }))
      .filter(item => item.pts !== null);

    if (gwScores.length === 0) continue;

    gwScores.sort((a, b) => b.pts - a.pts);

    const cutoffScore = gwScores[cutoffIndex - 1] ? gwScores[cutoffIndex - 1].pts : null;
    const isMonthStart = CONFIG.START_OF_MONTH_GWS.includes(gw + 1);
    const baseCost = isMonthStart ? CONFIG.BASE_MONTHLY_FEE : 0.00;

    gwScores.forEach((item, rank) => {
      let fine = CONFIG.GW_FINE;
      if (rank < cutoffIndex || item.pts === cutoffScore) {
        fine = 0.00;
      }
      matrix[item.id][gw] = baseCost + fine;
    });
  }
  return matrix;
}

export function calculateMiniLeague(leagueData, startGW, endGW) {
  return leagueData.map(m => {
    let pts = 0;
    let played = false;
    for (let gw = startGW - 1; gw < endGW; gw++) {
      if (m.gwPoints[gw] !== null) {
        pts += m.gwPoints[gw];
        played = true;
      }
    }
    return { id: m.id, name: m.name, pts: played ? pts : null };
  })
  .filter(m => m.pts !== null)
  .sort((a, b) => b.pts - a.pts)
  .map((m, idx) => ({ ...m, fine: idx * CONFIG.MINI_LEAGUE_STEP }));
}