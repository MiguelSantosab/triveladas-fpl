import { getSavedPayments, savePayment } from '../domain/storage.js';

export function renderFinance(standings = [], finesData = {}, monthlyData = null, onUpdateCallback = null) {
    const tbody = document.querySelector('#table-finance tbody');
    if (!tbody) {
        console.warn("Elemento #table-finance tbody não encontrado.");
        return;
    }

    const payments = (typeof getSavedPayments === 'function') ? getSavedPayments() : {};
    let grandTotal = 0;
    let totalPaid = 0;

    tbody.innerHTML = standings.map(manager => {
        const managerId = manager.entry;
        const managerName = manager.player_name || manager.entry_name || 'Manager';

        // Obter total de multas calculadas
        const fineObj = (finesData && finesData[managerId]) ? finesData[managerId] : { total: 0 };
        const totalDebt = fineObj.total || 0;

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

    // Atualizar totais do sumário
    const elTotal = document.getElementById('stat-total');
    const elReal = document.getElementById('stat-real');
    const elMedia = document.getElementById('stat-media');

    if (elTotal) elTotal.innerText = `${grandTotal.toFixed(2)} €`;
    if (elReal) elReal.innerText = `${totalPaid.toFixed(2)} €`;
    if (elMedia) elMedia.innerText = `${(grandTotal / (standings.length || 1)).toFixed(2)} €`;

    // Event listeners para os inputs de pagamento
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