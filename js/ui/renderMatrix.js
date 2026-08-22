// js/ui/renderMatrix.js

export function renderMatrix(standings = [], histories = {}, currentGW = 1) {
    const table = document.getElementById('table-matrix');
    if (!table) {
        console.warn('Elemento #table-matrix não encontrado.');
        return;
    }

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    if (!thead || !tbody) return;

    // Se estiver em pré-época ou GW inválida, assume no mínimo GW 1
    const totalGWs = Math.max(1, currentGW);

    // 1. Gerar Cabeçalho (Manager | GW1 | GW2 | ... | Total | Média)
    let headerHTML = `
        <tr>
            <th class="sticky-col">Manager</th>
    `;
    for (let gw = 1; gw <= totalGWs; gw++) {
        headerHTML += `<th class="text-center">GW${gw}</th>`;
    }
    headerHTML += `
            <th class="text-center font-bold">Total</th>
            <th class="text-center font-bold">Média</th>
        </tr>
    `;
    thead.innerHTML = headerHTML;

    // 2. Gerar Linhas com Pontos de cada Manager por GW
    if (!standings || standings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${totalGWs + 3}" class="text-center">Sem dados disponíveis.</td></tr>`;
        return;
    }

    tbody.innerHTML = standings.map(manager => {
        const managerId = manager.entry;
        const managerName = manager.player_name || manager.entry_name || 'Manager';
        const teamHistory = histories[managerId]?.current || [];

        // Mapear pontos indexados pelo número da GW
        const pointsMap = {};
        teamHistory.forEach(item => {
            pointsMap[item.event] = item.points;
        });

        let rowHTML = `
            <tr>
                <td class="sticky-col font-semibold">${managerName}</td>
        `;

        let calculatedTotal = 0;
        let playedCount = 0;

        for (let gw = 1; gw <= totalGWs; gw++) {
            const points = pointsMap[gw];
            if (points !== undefined) {
                calculatedTotal += points;
                playedCount++;
                rowHTML += `<td class="text-center">${points}</td>`;
            } else {
                rowHTML += `<td class="text-center text-muted">-</td>`;
            }
        }

        const average = playedCount > 0 ? (calculatedTotal / playedCount).toFixed(1) : '0.0';
        const totalDisplay = manager.total !== undefined ? manager.total : calculatedTotal;

        rowHTML += `
                <td class="text-center font-bold text-primary">${totalDisplay}</td>
                <td class="text-center font-semibold text-muted">${average}</td>
            </tr>
        `;

        return rowHTML;
    }).join('');
}