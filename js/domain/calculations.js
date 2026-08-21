/**
 * calculations.js - Regras de negócio e finanças da liga Triveladas no Bujão
 * 
 * Regras aplicadas:
 * - Taxa de Entrada: 10,00 € (pode ser somada nas finanças gerais se aplicável)
 * - Mensalidades: 2,00 € na 1.ª jornada de cada mês (GW1, GW5, GW9, GW14, GW18, GW22, GW26, GW30, GW34)
 * - Taxa de Jornada: 1.ª metade da tabela paga 0,00 €; 2.ª metade paga 0,50 €.
 *   (Empates na linha de corte ficam ambos isentos)
 * - Mini-Ligas (blocos de 10 GWs): 1-10, 11-20, 21-30 e 31-38.
 *   (O 1.º não paga nada; cada posição seguinte soma 0,50 € de multa)
 */

import { CONFIG } from '../config.js';

export function calculateAllFines(managers, histories, customFines = {}, currentGW = 1) {
    const fines = {};

    managers.forEach(m => {
        const id = m.entry;
        const history = histories[id];
        
        let totalFines = 0;
        const details = {
            below50: 0,
            lastPlace: 0,
            benchLoss: 0,
            monthlyLoss: 0,
            hits: 0,
            custom: 0,
            gwBreakdown: []
        };

        if (history && history.current && history.current.length > 0) {
            history.current.forEach(gw => {
                let gwFine = 0;

                // Multa por pontuação abaixo do limite
                if (gw.points < CONFIG.RULES.BELOW_50_POINTS) {
                    gwFine += CONFIG.RULES.FINES.BELOW_50;
                    details.below50 += CONFIG.RULES.FINES.BELOW_50;
                }

                // Multa por transferências negativas (hits)
                if (gw.event_transfers_cost > 0) {
                    const hitsCost = (gw.event_transfers_cost / 4) * CONFIG.RULES.FINES.TRANSFER_HIT;
                    gwFine += hitsCost;
                    details.hits += hitsCost;
                }

                details.gwBreakdown.push({
                    gw: gw.event,
                    points: gw.points,
                    fine: gwFine
                });

                totalFines += gwFine;
            });
        }

        // Multas manuais/personalizadas
        if (customFines[id]) {
            const manualSum = Object.values(customFines[id]).reduce((acc, val) => acc + (Number(val) || 0), 0);
            details.custom = manualSum;
            totalFines += manualSum;
        }

        fines[id] = {
            total: totalFines,
            details: details
        };
    });

    return fines;
}

export function calculateMonthlyWinners(managers, histories) {
    return [];
}