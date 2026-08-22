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
    showLoading(true);

    try {
        await loadAllData();
        renderAllSections();
    } catch (error) {
        console.error('Erro ao inicializar app:', error);
    } finally {
        showLoading(false);
    }
}

async function loadAllData() {
    const [bootstrap, standings] = await Promise.all([
        getBootstrapStatic(),
        getLeagueStandings(CONFIG.LEAGUE_ID)
    ]);

    appState.bootstrap = bootstrap;
    appState.standings = standings;

    const currentEvent = bootstrap?.events?.find(e => e.is_current) 
                      || bootstrap?.events?.filter(e => e.finished).pop() 
                      || bootstrap?.events?.find(e => e.is_next)
                      || { id: 1 };

    appState.currentGW = currentEvent ? currentEvent.id : 1;
    const managers = standings?.standings?.results || [];

    if (managers.length > 0) {
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
    }

    const customFines = (typeof getCustomFines === 'function') ? getCustomFines() : {};
    appState.finesData = calculateAllFines(managers, appState.histories, customFines, appState.currentGW);
    appState.monthlyData = calculateMonthlyWinners(managers, appState.histories);
}

function renderAllSections() {
    const managers = appState.standings?.standings?.results || [];

    // Renderiza todas as tabelas logo no arranque
    renderGeral(managers, appState.finesData, appState.currentGW);
    renderMiniLeagues(managers, appState.histories, appState.currentGW);
    renderMatrix(managers, appState.histories, appState.currentGW);
    renderFinance(managers, appState.finesData, appState.monthlyData, () => {
    const customFines = (typeof getCustomFines === 'function') ? getCustomFines() : {};
    appState.finesData = calculateAllFines(managers, appState.histories, customFines, appState.currentGW);
    renderFinance(managers, appState.finesData, appState.monthlyData, null, appState.currentGW);
}, appState.currentGW);
    };


function showLoading(isLoading) {
    const loader = document.getElementById('loading-indicator');
    if (loader) {
        loader.style.display = isLoading ? 'block' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', init);