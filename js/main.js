import { fetchLeagueStandings } from './api/fplService.js';
import { calculateCostsMatrix, calculateMiniLeague } from './domain/calculations.js';
import { renderGeralTable, renderCurrentGWTable } from './ui/renderGeral.js';
import { renderFinanceSection } from './ui/renderFinance.js';
import { renderHistoryStats } from './ui/renderHistory.js';

let state = {
  leagueData: [],
  costsMatrix: {}
};

function renderMiniTables() {
  const blocks = [
    { id: 'mini-1', start: 1, end: 10 },
    { id: 'mini-2', start: 11, end: 20 },
    { id: 'mini-3', start: 21, end: 30 },
    { id: 'mini-4', start: 31, end: 38 }
  ];

  blocks.forEach(b => {
    const res = calculateMiniLeague(state.leagueData, b.start, b.end);
    const tbody = document.querySelector(`#${b.id} tbody`);
    if (tbody) {
      tbody.innerHTML = res.length
        ? res.map((m, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${m.name}</td>
              <td>${m.pts}</td>
              <td>${m.fine.toFixed(2)} €</td>
            </tr>
          `).join('')
        : '<tr><td colspan="4" style="text-align:center;color:#888;">Pré-Época</td></tr>';
    }
  });
}

function renderMatrixSection() {
  const renderSub = (tableId, start, end) => {
    const theadEl = document.querySelector(`#${tableId} thead`);
    const tbodyEl = document.querySelector(`#${tableId} tbody`);
    if (!theadEl || !tbodyEl) return;

    let thead = '<tr><th>Manager</th>';
    for (let g = start; g <= end; g++) thead += `<th>GW${g}</th>`;
    thead += '</tr>';
    theadEl.innerHTML = thead;

    let tbody = '';
    if (state.leagueData.length === 0) {
      tbody = `<tr><td colspan="${(end - start) + 2}" style="text-align:center;color:#888;">A aguardar arranque da época</td></tr>`;
    } else {
      state.leagueData.forEach(m => {
        tbody += `<tr><td><strong>${m.name}</strong></td>`;
        for (let g = start - 1; g < end; g++) {
          const val = state.costsMatrix[m.id] ? state.costsMatrix[m.id][g] : null;
          if (val === null) {
            tbody += `<td>-</td>`;
          } else {
            const isZero = val === 0;
            tbody += `<td class="${isZero ? 'matrix-cell-paid' : 'matrix-cell-fine'}">${val.toFixed(2)} €</td>`;
          }
        }
        tbody += `</tr>`;
      });
    }
    tbodyEl.innerHTML = tbody;
  };

  renderSub('matrix-part1', 1, 19);
  renderSub('matrix-part2', 20, 38);
}

function updateUI() {
  renderGeralTable(state.leagueData);
  renderCurrentGWTable(state.leagueData);
  renderMiniTables();
  renderMatrixSection();
  renderFinanceSection(state.leagueData, state.costsMatrix);
  renderHistoryStats();
}

async function init() {
  const loader = document.getElementById('loading-indicator');
  
  // Renderiza imediatamente o que é estático
  renderHistoryStats();
  renderMatrixSection();
  renderMiniTables();

  try {
    state.leagueData = await fetchLeagueStandings();
    state.costsMatrix = calculateCostsMatrix(state.leagueData);
    if (loader) loader.style.display = 'none';
    updateUI();
  } catch (err) {
    if (loader) {
      loader.innerHTML = '<span style="color:#d97706; font-size:0.9rem;">⚠️ Modo offline / Pré-época. Histórico e estatísticas disponíveis.</span>';
    }
    console.warn(err);
    updateUI();
  }
}

init();