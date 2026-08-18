import { getSavedPayments, savePayment } from '../domain/storage.js';
import { calculateMiniLeague } from '../domain/calculations.js';

export function renderFinanceSection(leagueData, costsMatrix, onUpdateCallback) {
    const mini1 = calculateMiniLeague(leagueData, 1, 10);
    const mini2 = calculateMiniLeague(leagueData, 11, 20);
    const mini3 = calculateMiniLeague(leagueData, 21, 30);
    const mini4 = calculateMiniLeague(leagueData, 31, 38);

    const payments = getSavedPayments();
    let grandTotal = 0;
    let totalPaid = 0;

    const tbody = document.querySelector('#table-finance tbody');
    if (!tbody) return;

    tbody.innerHTML = leagueData.map(m => {
        const gwTotal = (costsMatrix[m.id] || []).reduce((acc, v) => acc + (v || 0), 0);
        const m1 = mini1.find(x => x.id === m.id)?.fine || 0;
        const m2 = mini2.find(x => x.id === m.id)?.fine || 0;
        const m3 = mini3.find(x => x.id === m.id)?.fine || 0;
        const m4 = mini4.find(x => x.id === m.id)?.fine || 0;

        const totalDebt = gwTotal + m1 + m2 + m3 + m4;
        const paid = payments[m.id] !== undefined ? payments[m.id] : 0;
        const remaining = totalDebt - paid;

        grandTotal += totalDebt;
        totalPaid += paid;

        return `
      <tr>
        <td><strong>${m.name}</strong></td>
        <td>${totalDebt.toFixed(2)} €</td>
        <td>
          <input type="number" step="0.50" class="input-pago" data-id="${m.id}" value="${paid.toFixed(2)}"> €
        </td>
        <td style="color:${remaining > 0 ? '#dc2626' : '#059669'}; font-weight:700;">${remaining.toFixed(2)} €</td>
      </tr>
    `;
    }).join('');

    const elTotal = document.getElementById('stat-total');
    const elReal = document.getElementById('stat-real');
    const elMedia = document.getElementById('stat-media');

    if (elTotal) elTotal.innerText = `${grandTotal.toFixed(2)} €`;
    if (elReal) elReal.innerText = `${totalPaid.toFixed(2)} €`;
    if (elMedia) elMedia.innerText = `${(grandTotal / (leagueData.length || 1)).toFixed(2)} €`;

    tbody.querySelectorAll('.input-pago').forEach(input => {
        input.addEventListener('change', (e) => {
            savePayment(e.target.getAttribute('data-id'), e.target.value);
            if (onUpdateCallback) onUpdateCallback();
        });
    });
}