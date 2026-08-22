// js/ui/renderMatrix.js

export function renderMatrix(standings = [], histories = {}, currentGW = 1) {
    renderSubMatrix('matrix-part1', standings, histories, 1, 19);
    renderSubMatrix('matrix-part2', standings, histories, 20, 38);
}

function renderSubMatrix(tableId, standings, histories, startGW, endGW) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    if (!thead || !tbody) return;

    // Cabeçalho
    let headerHTML = '<tr><th style="padding: 6px; text-align: left;">Manager</th>';
    for (let gw = startGW; gw <= endGW; gw++) {
        headerHTML += `<th style="padding: 6px; text-align: center;">GW${gw}</th>`;
    }
    headerHTML += '</tr>';
    thead.innerHTML = headerHTML;

    // Linhas
    tbody.innerHTML = standings.map(manager => {
        const managerId = manager.entry;
        const managerName = manager.player_name || manager.entry_name || 'Manager';
        const teamHistory = histories[managerId]?.current || [];

        const pointsMap = {};
        teamHistory.forEach(item => {
            pointsMap[item.event] = item.points;
        });

        let rowHTML = `<tr><td style="padding: 6px; font-weight: 600;">${managerName}</td>`;
        for (let gw = startGW; gw <= endGW; gw++) {
            const pts = pointsMap[gw];
            rowHTML += `<td style="padding: 6px; text-align: center;">${pts !== undefined ? pts : '-'}</td>`;
        }
        rowHTML += '</tr>';
        return rowHTML;
    }).join('');
}