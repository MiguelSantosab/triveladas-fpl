import { fetchLeagueStandings } from './api/fplService.js';
import { calculateCostsMatrix, calculateMiniLeague } from './domain/calculations.js';
import { renderGeralTable, renderCurrentGWTable } from './ui/renderGeral.js';
import { renderFinanceSection } from './ui/renderFinance.js';
import { renderHistoryStats } from './ui/renderHistory.js';

// 1. REGISTO IMEDIATO DAS ABAS (Funciona sempre, mesmo offline)
window.switchTab = function (tabId, btn) {
  // Esconder todas as abas
  document.querySelectorAll('.tab-content').forEach(el => {
    el.style.display = 'none';
    el.classList.remove('active');
  });

  // Remover estado ativo dos botões
  document.querySelectorAll('nav button').forEach(el => {
    el.classList.remove('active');
  });

  // Ativar aba pretendida
  const target = document.getElementById(tabId);
  if (target) {
    target.style.display = 'block';
    target.classList.add('active');
  }

  // Ativar botão clicado
  if (btn) {
    btn.classList.add('active');
  }
};

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
        : '<tr><td colspan="4" style="text-align:center;color:#888;">Pré-Época / A decorrer</td></tr>';
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

// 2. INICIALIZAÇÃO SEGURA
async function init() {
  // Renderiza imediatamente as abas estáticas (ex: histórico de campeões)
  renderHistoryStats();
  renderMatrixSection();
  renderMiniTables();

  const loader = document.getElementById('loading-indicator');
  try {
    state.leagueData = await fetchLeagueStandings();
    state.costsMatrix = calculateCostsMatrix(state.leagueData);
    if (loader) loader.style.display = 'none';
    updateUI();
  } catch (err) {
    if (loader) {
      loader.innerHTML = '<span style="color:#d97706;">⚠️ Liga em fase de pré-época ou a aguardar dados da Fantasy. As abas estão disponíveis.</span>';
    }
    console.warn('API FPL:', err);
    updateUI();
  }
}

init();