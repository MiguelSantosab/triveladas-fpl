// js/ui/renderMini.js
import { MANUAL_ADJUSTMENTS } from '../domain/manualAdjustments.js';

export function renderMiniLeagues(standings = [], histories = {}, currentGW = 1) {
    const miniIntervals = [
        { id: 'mini-1', start: 1, end: 10 },
        { id: 'mini-2', start: 11, end: 20 },
        { id: 'mini-3', start: 21, end: 30 },
        { id: 'mini-4', start: 31, end: 38 }
    ];

    miniIntervals.forEach(mini => {
        const table = document.getElementById(mini.id);
        if (!table) return;

        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        if (currentGW < mini.start) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #888; padding: 8px;">Por iniciar</td></tr>`;
            return;
        }

        const miniScores = standings.map(manager => {
            const managerId = manager.entry;
            const managerName = manager.player_name || manager.entry_name || 'Manager';
            const teamHistory = histories[managerId]?.current || [];

            let points = 0;
            teamHistory.forEach(gw => {
                if (gw.event >= mini.start && gw.event <= mini.end) {
                    let gwPoints = gw.points;

                    // Procura se existe ajuste manual para este jogador nesta exata jornada
                    const adjustment = MANUAL_ADJUSTMENTS.find(
                        adj => adj.playerId === managerId && adj.gameweek === gw.event
                    );
                    
                    if (adjustment) {
                        gwPoints += adjustment.pointsAdjustment; // Subtrai os 40 pontos na GW 4
                    }

                    points += gwPoints;
                }
            });

            return {
                id: managerId,
                name: managerName,
                points: points
            };
        });

        miniScores.sort((a, b) => b.points - a.points);

        tbody.innerHTML = miniScores.map((item, index) => {
            const pos = index + 1;
            const fine = index * 0.50;

            return `
                <tr>
                    <td style="text-align: center; font-weight: bold; padding: 6px;">${pos}</td>
                    <td style="padding: 6px;">${item.name}</td>
                    <td style="text-align: center; font-weight: 600; padding: 6px;">${item.points}</td>
                    <td style="text-align: center; font-weight: 600; padding: 6px; color: ${fine > 0 ? '#dc2626' : '#059669'};">
                        ${fine.toFixed(2)} €
                    </td>
                </tr>
            `;
        }).join('');
    });
}