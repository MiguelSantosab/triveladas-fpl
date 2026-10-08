// js/domain/manualAdjustments.js

export const MANUAL_ADJUSTMENTS = [
  {
    playerId: 6397607, 
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
    // Procura se existe ajuste correspondente ao ID da equipa (player.entry)
    const adjustment = MANUAL_ADJUSTMENTS.find(
      adj => player.entry === adj.playerId
    );

    if (adjustment) {
      return {
        ...player,
        total: player.total + adjustment.pointsAdjustment,
      };
    }

    return player;
  });
}