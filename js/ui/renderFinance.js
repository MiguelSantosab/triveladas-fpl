// js/ui/renderFinance.js
import { getSavedPayments, savePayment } from '../domain/storage.js';

// Função auxiliar para calcular mensalidades (2€ por mês iniciado)
function calculateMonthlyFees(currentGW = 1) {
    // Lista com as primeiras GWs de cada mês (Agosto a Maio)
    const monthStartGWs = [1, 3, 6, 10, 13, 19, 24, 28, 31, 35];
    
    // Conta quantos meses já arrancaram até à GW atual
    const monthsElapsed = monthStartGWs.filter(gw => currentGW >= gw).length;
    
    return monthsElapsed * 2.0; // 2.00 € por mês
}

export function renderFinance(standings = [], finesData = {}, monthlyData = null, onUpdateCallback = null, currentGW = 1) {
    const tbody = document.querySelector('#table-finance tbody');
    if (!tbody) return;

    const payments = (typeof getSavedPayments === 'function') ? getSavedPayments() : {};
    let grandTotal = 0;
    let totalPaid = 0;

    const ENTRY_FEE = 10.0; // Taxa de Entrada Fixa
    const monthlyFee = calculateMonthlyFees(currentGW); // Mensalidades devidas até à GW atual

    tbody.innerHTML = standings.map(manager => {
        const managerId = manager.entry;
        const managerName = manager.player_name || manager.entry_name || 'Manager';

        // Multas calculadas das jornadas e mini-ligas
        const fineObj = (finesData && finesData[managerId]) ? finesData[managerId] : { total: 0 };
        const finesTotal = fineObj.total || 0;

        // Total Devido = Entrada (10€) + Mensalidades (2€/mês) + Multas
        const totalDebt = ENTRY_FEE + monthlyFee + finesTotal;

        const paid = payments[managerId] !== undefined ? Number(payments[managerId]) : 0;
        const remaining = totalDebt - paid;

        grandTotal += totalDebt;
        totalPaid += paid;

        return `
            <tr>
                <td><strong>${managerName}</strong></td>
                <td>${totalDebt.toFixed(2)} €</td>
                <td>
                    <input type="number" step="0.50" class="input-pago" data-id="${managerId}" value="${paid.toFixed(2)}"> €
                </td>
                <td style="color:${remaining > 0 ? '#dc2626' : '#059669'}; font-weight:700;">${remaining.toFixed(2)} €</td>
            </tr>
        `;
    }).join('');

    // Atualizar os cartões de estatísticas no topo da secção
    const elTotal = document.getElementById('stat-total');
    const elReal = document.getElementById('stat-real');
    const elMedia = document.getElementById('stat-media');

    if (elTotal) elTotal.innerText = `${grandTotal.toFixed(2)} €`;
    if (elReal) elReal.innerText = `${totalPaid.toFixed(2)} €`;
    if (elMedia) elMedia.innerText = `${(grandTotal / (standings.length || 1)).toFixed(2)} €`;

    // Listeners para guardar o valor pago quando for editado
    tbody.querySelectorAll('.input-pago').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = e.target.getAttribute('data-id');
            const val = parseFloat(e.target.value) || 0;
            if (typeof savePayment === 'function') {
                savePayment(id, val);
            }
            if (onUpdateCallback) onUpdateCallback();
        });
    });
}