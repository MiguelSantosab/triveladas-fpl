// js/domain/manualAdjustments.js

export const MANUAL_ADJUSTMENTS = [
  {
    // Usa o nome exato ou o ID do jogador tal como vem da API / app
    playerID: 6397607, 
    gameweek: 4,
    pointsAdjustment: -40, // Valor a retirar (negativo)
    reason: "Esqueceu-se do wildcard"
  }
];

/**
 * Aplica os ajustes manuais aos dados dos jogadores/equipa
 */
export function applyAdjustments(standingsOrPlayers) {
  return standingsOrPlayers.map(player => {
    // Verifica se existe ajuste para este jogador
    const adjustment = MANUAL_ADJUSTMENTS.find(
      adj => player.name && player.name.toLowerCase() === adj.playerID.toLowerCase()
    );

    if (adjustment) {
      // Se a tua estrutura guarda os pontos por jornada num objeto/array ou no total geral:
      // Exemplo ajustando o total geral e/ou a jornada específica:
      return {
        ...player,
        total: player.total + adjustment.pointsAdjustment,
        // Se também guardares o breakdown por jornadas, podes ajustar aqui se necessário
      };
    }

    return player;
  });
}