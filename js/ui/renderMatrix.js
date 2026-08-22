// js/ui/renderMatrix.js

export function renderMatrix(standings = [], histories = {}, currentGW = 1) {
    renderSubMatrix('matrix-part1', standings, histories, 1, 19, currentGW);
    renderSubMatrix('matrix-part2', standings, histories, 20, 38, currentGW);
}

function renderSubMatrix(tableId, standings, histories, startGW, endGW, currentGW) {
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

    // Calcular multas para cada GW
    const gwFees = {};
    for (let gw = startGW; gw <= Math.min(endGW, currentGW); gw++) {
        const gwScores = standings.map(m => {
            // Se for a GW atual, usa o event_total ao vivo; caso contrário, histórico
            let pts = 0;
            if (gw === currentGW && m.event_total !== undefined) {
                pts = m.event_total;
            } else {
                const hist = histories[m.entry]?.current?.find(h => h.event === gw);
                pts = hist ? hist.points : 0;
            }
            return { entry: m.entry, points: pts };
        }).sort((a, b) => b.points - a.points);

        const half = Math.ceil(gwScores.length / 2);
        const cutoffPoints = gwScores[half - 1]?.points;

        gwScores.forEach((p, idx) => {
            if (!gwFees[p.entry]) gwFees[p.entry] = {};
            const isSecondHalf = (idx + 1) > half && p.points < cutoffPoints;
            gwFees[p.entry][gw] = isSecondHalf ? 0.50 : 0.00;
        });
    }

    // Renderizar Linhas
    tbody.innerHTML = standings.map(manager => {
        const managerId = manager.entry;
        const managerName = manager.player_name || manager.entry_name || 'Manager';

        let rowHTML = `<tr><td style="padding: 6px; font-weight: 600;">${managerName}</td>`;
        for (let gw = startGW; gw <= endGW; gw++) {
            if (gw > currentGW) {
                rowHTML += `<td style="padding: 6px; text-align: center; color: #aaa;">-</td>`;
            } else {
                const fee = gwFees[managerId]?.[gw] ?? 0;
                rowHTML += `<td style="padding: 6px; text-align: center; color: ${fee > 0 ? '#dc2626' : '#059669'}; font-weight: 600;">${fee.toFixed(2)} €</td>`;
            }
        }
        rowHTML += '</tr>';
        return rowHTML;
    }).join('');
}