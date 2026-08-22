// js/ui/renderMini.js

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

        // Se a mini-liga ainda não começou
        if (currentGW < mini.start) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #888; padding: 8px;">Por iniciar</td></tr>`;
            return;
        }

        // 1. Calcular pontos de cada manager dentro da janela da mini-liga
        const miniScores = standings.map(manager => {
            const managerId = manager.entry;
            const managerName = manager.player_name || manager.entry_name || 'Manager';
            const teamHistory = histories[managerId]?.current || [];

            // Somar apenas os pontos das GWs que pertencem a este intervalo
            let points = 0;
            teamHistory.forEach(gw => {
                if (gw.event >= mini.start && gw.event <= mini.end) {
                    points += gw.points;
                }
            });

            return {
                id: managerId,
                name: managerName,
                points: points
            };
        });

        // 2. Ordenar por pontos descendentes
        miniScores.sort((a, b) => b.points - a.points);

        // 3. Renderizar linhas com cálculo da multa (1º = 0€, 2º = 0.50€, 3º = 1.00€, etc.)
        tbody.innerHTML = miniScores.map((item, index) => {
            const pos = index + 1;
            const fine = index * 0.50; // Regra: 1º isento, cada posição seguinte soma 0.50€

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