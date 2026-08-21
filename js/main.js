import { CONFIG } from './config.js';
import { getLeagueStandings, getBootstrapStatic, getManagerHistory } from './api/fplService.js';
import { calculateAllFines, calculateMonthlyWinners } from './domain/calculations.js';
import { getCustomFines } from './domain/storage.js';
import { renderGeral } from './ui/renderGeral.js';
import { renderMiniLeagues } from './ui/renderMini.js';
import { renderMatrix } from './ui/renderMatrix.js';
import { renderFinance } from './ui/renderFinance.js';

let appState = {
    bootstrap: null,
    standings: null,
    currentGW: 1,
    histories: {},
    finesData: null,
    monthlyData: null
};

async function init() {
    setupNavigation();
    showLoading(true);

    try {
        await loadAllData();
        renderActiveView('geral');
        showToast('Dados carregados com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar app:', error);
        showToast('Erro ao carregar dados da FPL.', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadAllData() {
    // 1. Carregar Bootstrap (Info Geral) e Standings da Liga
    const [bootstrap, standings] = await Promise.all([
        getBootstrapStatic(),
        getLeagueStandings(CONFIG.LEAGUE_ID)
    ]);

    appState.bootstrap = bootstrap;
    appState.standings = standings;

    // Descobrir a jornada atual
    const currentEvent = bootstrap.events.find(e => e.is_current);
    appState.currentGW = currentEvent ? currentEvent.id : 0;

    // Atualizar badge da GW no header
    const gwBadge = document.getElementById('current-gw-badge');
    if (gwBadge) {
        gwBadge.textContent = appState.currentGW > 0 ? `GW ${appState.currentGW}` : 'Pré-Época';
    }

    const managers = standings.standings.results || [];

    // 2. Só tenta ir buscar o histórico se já tiver começado alguma GW
    if (appState.currentGW > 0) {
        const historyPromises = managers.map(m => 
            getManagerHistory(m.entry)
                .then(hist => ({ id: m.entry, hist }))
                .catch(err => {
                    console.warn(`Não foi possível carregar histórico do manager ${m.entry}`, err);
                    return { id: m.entry, hist: { current: [] } };
                })
        );

        const historyResults = await Promise.all(historyPromises);
        historyResults.forEach(res => {
            appState.histories[res.id] = res.hist;
        });
    } else {
        // Pré-época: histórico vazio por defeito
        managers.forEach(m => {
            appState.histories[m.entry] = { current: [] };
        });
    }

    // 3. Cálculos de Multas e Mensalidades
    const customFines = getCustomFines();
    appState.finesData = calculateAllFines(managers, appState.histories, customFines, appState.currentGW);
    appState.monthlyData = calculateMonthlyWinners(managers, appState.histories);
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            const viewTarget = item.getAttribute('data-view');
            renderActiveView(viewTarget);
        });
    });

    const refreshBtn = document.getElementById('btn-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => init());
    }
}

function renderActiveView(viewName) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));

    const activeSection = document.getElementById(`view-${viewName}`);
    if (activeSection) {
        activeSection.classList.add('active');
    }

    switch (viewName) {
        case 'geral':
            renderGeral(appState.standings.standings.results, appState.finesData, appState.currentGW);
            break;
        case 'mini':
            renderMiniLeagues(appState.standings.standings.results, appState.histories, appState.currentGW);
            break;
        case 'matrix':
            renderMatrix(appState.standings.standings.results, appState.histories, appState.currentGW);
            break;
        case 'finance':
            renderFinance(appState.standings.standings.results, appState.finesData, appState.monthlyData, () => {
                const customFines = getCustomFines();
                appState.finesData = calculateAllFines(appState.standings.standings.results, appState.histories, customFines, appState.currentGW);
                renderFinance(appState.standings.standings.results, appState.finesData, appState.monthlyData);
            });
            break;
    }
}

function showLoading(isLoading) {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.style.display = isLoading ? 'flex' : 'none';
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', init);