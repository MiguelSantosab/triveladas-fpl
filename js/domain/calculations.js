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

    managers.forEach(m => {
        fines[m.entry] = {
            gwFines: 0,
            miniFines: 0,
            custom: 0,
            total: 0,
            gwBreakdown: []
        };
    });

    for (let gw = 1; gw <= currentGW; gw++) {
        const gwScores = [];

        managers.forEach(m => {
            let pts = 0;
            if (gw === currentGW && m.event_total !== undefined) {
                pts = m.event_total; // Pontos ao vivo na jornada corrente
            } else {
                const hist = histories[m.entry]?.current?.find(h => h.event === gw);
                pts = hist ? hist.points : 0;
            }
            gwScores.push({ entry: m.entry, points: pts });
        });

        if (gwScores.length > 0) {
            gwScores.sort((a, b) => b.points - a.points);

            // Math.floor garante que 4 ficam isentos e 5 pagam
            const freeCount = Math.floor(gwScores.length / 2);
            const cutoffPoints = gwScores[freeCount - 1]?.points;

            gwScores.forEach((player, idx) => {
                const rank = idx + 1;
                const fee = (rank > freeCount && player.points < cutoffPoints) ? 0.50 : 0.00;

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

    // Mini-Ligas (só somam quando o bloco termina)
    const miniIntervals = [
        { start: 1, end: 10 },
        { start: 11, end: 20 },
        { start: 21, end: 30 },
        { start: 31, end: 38 }
    ];

    miniIntervals.forEach(mini => {
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

            miniScores.forEach((player, idx) => {
                const fine = idx * 0.50;
                if (fines[player.entry]) {
                    fines[player.entry].miniFines += fine;
                }
            });
        }
    });

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