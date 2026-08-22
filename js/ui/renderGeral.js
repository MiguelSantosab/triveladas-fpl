// js/ui/renderGeral.js

export function renderGeral(standings = [], finesData = {}, currentGW = 1) {
    // 1. Tabela de Classificação Geral
    const geralTbody = document.querySelector('#table-geral tbody');
    if (geralTbody) {
        geralTbody.innerHTML = standings.map((manager, index) => `
            <tr>
                <td style="text-align: center; font-weight: bold;">${manager.rank || (index + 1)}</td>
                <td><strong>${manager.player_name || 'Manager'}</strong></td>
                <td style="color: #666;">${manager.entry_name || 'Equipa'}</td>
                <td style="text-align: center; font-weight: 600;">${manager.event_total !== undefined ? manager.event_total : 0}</td>
                <td style="text-align: center; font-weight: bold; color: #0284c7;">${manager.total !== undefined ? manager.total : 0}</td>
            </tr>
        `).join('');
    }

    // 2. Tabela de Gameweek Atual
    const gwTbody = document.querySelector('#table-gw tbody');
    if (gwTbody) {
        // Ordenar managers pelos pontos da jornada atual
        const sortedGW = [...standings].sort((a, b) => (b.event_total || 0) - (a.event_total || 0));
        const half = Math.ceil(sortedGW.length / 2);

        gwTbody.innerHTML = sortedGW.map((m, index) => {
            const isSecondHalf = (index + 1) > half;
            const fee = isSecondHalf ? 0.50 : 0.00;

            return `
                <tr>
                    <td style="text-align: center; font-weight: bold;">${index + 1}</td>
                    <td><strong>${m.player_name || 'Manager'}</strong></td>
                    <td style="text-align: center; font-weight: 600;">${m.event_total !== undefined ? m.event_total : 0}</td>
                    <td style="text-align: center; font-weight: 600; color: ${fee > 0 ? '#dc2626' : '#059669'};">
                        ${fee.toFixed(2)} €
                    </td>
                </tr>
            `;
        }).join('');
    }
}