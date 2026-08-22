export function renderGeral(standings = [], finesData = {}, currentGW = 1) {
    const tbody = document.getElementById('table-geral-body');
    if (!tbody) {
        console.warn("Elemento #table-geral-body não foi encontrado no DOM.");
        return;
    }

    tbody.innerHTML = '';

    if (!standings || standings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">Nenhum manager encontrado na liga.</td></tr>`;
        return;
    }

    standings.forEach((manager, index) => {
        const tr = document.createElement('tr');
        
        // Proteção contra finesData nulo/indefinido
        const fineObj = (finesData && finesData[manager.entry]) ? finesData[manager.entry] : { total: 0 };
        const fineValue = fineObj.total || 0;
        
        const rank = manager.rank || (index + 1);
        const playerName = manager.player_name || 'Manager';
        const teamName = manager.entry_name || 'Equipa';
        const gwPoints = manager.event_total !== undefined ? manager.event_total : 0;
        const totalPoints = manager.total !== undefined ? manager.total : 0;

        tr.innerHTML = `
            <td class="text-center font-bold">${rank}</td>
            <td>
                <div class="manager-cell">
                    <span class="team-name font-bold">${teamName}</span>
                    <span class="player-name text-muted text-sm">${playerName}</span>
                </div>
            </td>
            <td class="text-center font-semibold">${gwPoints}</td>
            <td class="text-center font-bold text-primary">${totalPoints}</td>
            <td class="text-center font-semibold ${fineValue > 0 ? 'text-danger' : 'text-success'}">
                ${Number(fineValue).toFixed(2)}€
            </td>
        `;

        tbody.appendChild(tr);
    });
}