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

// Jornadas que correspondem à 1.ª jornada de cada mês (Mensalidade de 2,00 €)
export const MONTHLY_FEE_GWS = [1, 5, 9, 14, 18, 22, 26, 30, 34];

/**
 * Calcula a matriz de custos (multas/taxas) por jornada para cada jogador (GW1 a GW38).
 * @param {Array} leagueData - Lista de managers com o respetivo histórico.
 * @returns {Object} Dicionário com [managerId]: array de 38 posições (null se não jogada, número com valor em € se jogada).
 */
export function calculateCostsMatrix(leagueData) {
  const matrix = {};

  if (!leagueData || leagueData.length === 0) return matrix;

  // Inicializar arrays para cada jogador
  leagueData.forEach(m => {
    matrix[m.id] = new Array(38).fill(null);
  });

  // Determinar quantas jornadas já foram concluídas/têm dados
  const maxGWPlayed = Math.max(
    0,
    ...leagueData.map(m => (Array.isArray(m.history) ? m.history.length : 0))
  );

  // Se a época ainda não começou, devolve tudo com null
  if (maxGWPlayed === 0) return matrix;

  // Calcular jornada a jornada (0 a maxGWPlayed - 1)
  for (let gwIndex = 0; gwIndex < maxGWPlayed; gwIndex++) {
    const currentGWNumber = gwIndex + 1;

    // Recolher as pontuações de todos os managers nesta GW específica
    const gwScores = leagueData.map(m => ({
      id: m.id,
      points: m.history && m.history[gwIndex] ? m.history[gwIndex].points : 0
    }));

    // Ordenar do maior para o menor número de pontos
    gwScores.sort((a, b) => b.points - a.points);

    // Calcular linha de corte (1.ª metade)
    const cutoffIdx = Math.floor(gwScores.length / 2);
    const cutoffPoints = gwScores[cutoffIdx - 1]?.points;

    // Verificar se esta jornada tem mensalidade associada
    const hasMonthlyFee = MONTHLY_FEE_GWS.includes(currentGWNumber);
    const monthlyFeeValue = hasMonthlyFee ? 2.00 : 0.00;

    // Atribuir os custos da jornada a cada manager
    gwScores.forEach((entry, rankIndex) => {
      // Isento da taxa se estiver na 1.ª metade ou se tiver os mesmos pontos que o último da 1.ª metade
      const isExemptFromGWTax = rankIndex < cutoffIdx || entry.points === cutoffPoints;
      const gwTax = isExemptFromGWTax ? 0.00 : 0.50;

      // Custo final da jornada para o jogador
      matrix[entry.id][gwIndex] = gwTax + monthlyFeeValue;
    });
  }

  return matrix;
}

/**
 * Calcula a classificação e as multas acumuladas para um bloco específico de mini-liga.
 * @param {Array} leagueData - Lista de managers.
 * @param {number} startGW - Jornada de início (ex.: 1).
 * @param {number} endGW - Jornada de fim (ex.: 10).
 * @returns {Array} Lista ordenada por pontos no bloco com as respetivas multas.
 */
export function calculateMiniLeague(leagueData, startGW, endGW) {
  if (!leagueData || leagueData.length === 0) return [];

  // Verificar se a mini-liga já começou
  const hasStarted = leagueData.some(m => m.history && m.history.length >= startGW);
  if (!hasStarted) return [];

  const results = leagueData.map(m => {
    let blockPoints = 0;

    if (Array.isArray(m.history)) {
      for (let g = startGW - 1; g < endGW && g < m.history.length; g++) {
        if (m.history[g]) {
          blockPoints += m.history[g].points;
        }
      }
    }

    return {
      id: m.id,
      name: m.name,
      team: m.team,
      pts: blockPoints,
      fine: 0.00
    };
  });

  // Ordenar por pontos decrescentes
  results.sort((a, b) => b.pts - a.pts);

  // Verificar se a mini-liga já terminou completamente
  const isCompleted = leagueData.every(m => m.history && m.history.length >= endGW);

  // Se o bloco terminou, atribui as multas: 1.º = 0,00 €, 2.º = 0,50 €, 3.º = 1,00 €, etc.
  if (isCompleted) {
    results.forEach((m, index) => {
      m.fine = index * 0.50;
    });
  }

  return results;
}