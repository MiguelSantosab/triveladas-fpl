/**
 * calculations.js - Regras de negócio e finanças da liga Triveladas no Bujão
 * 
 * Regras aplicadas:
 * - Taxa de Entrada: 10,00 € (gerida em renderFinance)
 * - Mensalidades: 2,00 € na 1.ª jornada de cada mês
 * - Taxa de Jornada: 1.ª metade da tabela paga 0,00 €; 2.ª metade paga 0,50 €.
 *   (Empates na linha de corte ficam ambos isentos)
 * - Mini-Ligas: 1-10, 11-20, 21-30 e 31-38.
 *   (O 1.º não paga; cada posição seguinte soma 0,50 € de multa. Apenas somadas após o fim do bloco)
 */

export function calculateAllFines(managers = [], histories = {}, customFines = {}, currentGW = 1) {
    const fines = {};

    if (!managers || !Array.isArray(managers)) return fines;

    // Inicializar estrutura para cada manager
    managers.forEach(m => {
        fines[m.entry] = {
            gwFines: 0,
            miniFines: 0,
            custom: 0,
            total: 0,
            gwBreakdown: []
        };
    });

    // 1. Taxa de Jornada (0,50 € para a 2.ª metade em cada GW decorrida)
    for (let gw = 1; gw <= currentGW; gw++) {
        const gwScores = [];

        managers.forEach(m => {
            const hist = histories[m.entry]?.current?.find(h => h.event === gw);
            if (hist) {
                gwScores.push({ entry: m.entry, points: hist.points });
            }
        });

        if (gwScores.length > 0) {
            // Ordenar por pontos descendentes
            gwScores.sort((a, b) => b.points - a.points);

            const totalPlayers = gwScores.length;
            const halfIndex = Math.ceil(totalPlayers / 2); // Linha de corte (ex: 5.º lugar em 9 equipas)
            const cutoffPoints = gwScores[halfIndex - 1]?.points;

            gwScores.forEach((player, idx) => {
                const rank = idx + 1;
                let fee = 0;

                // Paga 0.50€ se estiver na 2.ª metade E com menos pontos que a linha de corte
                if (rank > halfIndex && player.points < cutoffPoints) {
                    fee = 0.50;
                }

                if (fines[player.entry]) {
                    fines[player.entry].gwFines += fee;
                    fines[player.entry].gwBreakdown.push({
                        gw: gw,
                        points: player.points,
                        fine: fee
                    });
                }
            });
        }
    }

    // 2. Mini-Ligas (SÓ somam ao total quando o bloco tiver terminado por completo)
    const miniIntervals = [
        { start: 1, end: 10 },
        { start: 11, end: 20 },
        { start: 21, end: 30 },
        { start: 31, end: 38 }
    ];

    miniIntervals.forEach(mini => {
        // Verifica se a mini-liga já terminou
        if (currentGW > mini.end) {
            const miniScores = managers.map(m => {
                const history = histories[m.entry]?.current || [];
                let points = 0;
                history.forEach(gw => {
                    if (gw.event >= mini.start && gw.event <= mini.end) {
                        points += gw.points;
                    }
                });
                return { entry: m.entry, points: points };
            }).sort((a, b) => b.points - a.points);

            // 1.º = 0.00 €, 2.º = 0.50 €, 3.º = 1.00 €, etc.
            miniScores.forEach((player, idx) => {
                const fine = idx * 0.50;
                if (fines[player.entry]) {
                    fines[player.entry].miniFines += fine;
                }
            });
        }
    });

    // 3. Somatório total
    managers.forEach(m => {
        const id = m.entry;
        const manualSum = (customFines && customFines[id])
            ? Object.values(customFines[id]).reduce((acc, val) => acc + (Number(val) || 0), 0)
            : 0;

        fines[id].custom = manualSum;
        fines[id].total = fines[id].gwFines + fines[id].miniFines + manualSum;
    });

    return fines;
}

export function calculateMiniLeague(managers = [], histories = {}, startGW = 1, endGW = 10) {
    if (!managers || !Array.isArray(managers)) return [];

    return managers.map(m => {
        const history = histories[m.entry]?.current || [];
        let points = 0;

        history.forEach(gw => {
            if (gw.event >= startGW && gw.event <= endGW) {
                points += gw.points;
            }
        });

        return {
            entry: m.entry,
            player_name: m.player_name,
            entry_name: m.entry_name,
            points: points
        };
    }).sort((a, b) => b.points - a.points);
}

export function calculateMonthlyWinners(managers, histories) {
    return [];
}