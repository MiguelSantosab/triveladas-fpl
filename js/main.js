import { fetchLeagueStandings } from './api/fplService.js';
import { calculateCostsMatrix, calculateMiniLeague } from './domain/calculations.js';
import { renderGeralTable, renderCurrentGWTable } from './ui/renderGeral.js';
import { renderFinanceSection } from './ui/renderFinance.js';

let state = {
    leagueData: [],
    costsMatrix: {}
};

// 1. Definido IMEDIATAMENTE no topo para o onclick do HTML nunca falhar
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

    // Mostrar a aba clicada
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.style.display = 'block';
        targetTab.classList.add('active');
    }

    // Ativar o botão clicado
    if (btn) {
        btn.classList.add('active');
    }
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
                : '<tr><td colspan="4" style="text-align:center;color:#999;">A decorrer</td></tr>';
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
    renderFinanceSection(state.leagueData, state.costsMatrix, updateUI);
}

async function init() {
    const loader = document.getElementById('loading-indicator');
    try {
        state.leagueData = await fetchLeagueStandings();
        state.costsMatrix = calculateCostsMatrix(state.leagueData);
        if (loader) loader.style.display = 'none';
        updateUI();
    } catch (err) {
        if (loader) {
            loader.innerText = 'Modo offline / Erro na API FPL. As abas continuam ativas.';
            loader.style.color = '#dc2626';
        }
        console.error('Erro na API:', err);
    }
}

// Inicializa a API
init();