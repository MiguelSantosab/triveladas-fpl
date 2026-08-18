export function renderGeralTable(leagueData) {
  const sorted = [...leagueData].sort((a, b) => b.totalPts - a.totalPts);
  const tbody = document.querySelector('#table-geral tbody');
  
  tbody.innerHTML = sorted.map((m, i) => `
    <tr>
      <td><strong>${i + 1}</strong></td>
      <td>${m.name}</td>
      <td><span style="color:#666">${m.team}</span></td>
      <td>${m.currentGW}</td>
      <td><strong>${m.totalPts}</strong></td>
    </tr>
  `).join('');
}

export function renderCurrentGWTable(leagueData) {
  const sorted = [...leagueData].sort((a, b) => b.currentGW - a.currentGW);
  const N = sorted.length;
  const cutoffIdx = Math.floor(N / 2);
  const cutoffScore = sorted[cutoffIdx - 1]?.currentGW;

  const tbody = document.querySelector('#table-gw tbody');
  tbody.innerHTML = sorted.map((m, i) => {
    const exempt = i < cutoffIdx || m.currentGW === cutoffScore;
    return `
      <tr>
        <td><strong>${i + 1}</strong></td>
        <td>${m.name}</td>
        <td><strong>${m.currentGW}</strong></td>
        <td><span style="color:${exempt ? '#059669' : '#dc2626'}; font-weight:600;">${exempt ? '0,00 €' : '0,50 €'}</span></td>
      </tr>
    `;
  }).join('');
}