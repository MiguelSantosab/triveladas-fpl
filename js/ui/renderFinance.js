// js/ui/renderFinance.js
import { getSavedPayments, savePayment } from '../domain/storage.js';

function getAdminPin() {
    return sessionStorage.getItem('triveladas_admin_pin');
}

function calculateMonthlyFees(currentGW = 1) {
    // 1.ª GW de cada mês
    const monthStartGWs = [1, 4, 7, 11, 14, 20, 24, 28, 31, 36];
    const monthsElapsed = monthStartGWs.filter(gw => currentGW >= gw).length;
    return monthsElapsed * 2.0;
}

export async function renderFinance(standings = [], finesData = {}, monthlyData = null, currentGW = 1) {
    const tbody = document.querySelector('#table-finance tbody');
    if (!tbody) return;

    const currentPin = getAdminPin();
    const isAdmin = Boolean(currentPin);

    // Obter dados da Base de Dados Cloud
    const payments = await getSavedPayments();
    let grandTotal = 0;
    let totalPaid = 0;

    const ENTRY_FEE = 10.0;
    const monthlyFee = calculateMonthlyFees(currentGW);

    tbody.innerHTML = standings.map(manager => {
        const managerId = manager.entry;
        const managerName = manager.player_name || manager.entry_name || 'Manager';

        const fineObj = (finesData && finesData[managerId]) ? finesData[managerId] : { total: 0 };
        const finesTotal = fineObj.total || 0;

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
                    ${isAdmin 
                        ? `<input type="number" step="0.50" class="input-pago" data-id="${managerId}" value="${paid.toFixed(2)}" style="width: 75px; padding: 3px 6px; border: 1px solid #00ff87; border-radius: 4px;"> €`
                        : `<span>${paid.toFixed(2)} €</span>`
                    }
                </td>
                <td style="color:${remaining > 0 ? '#dc2626' : '#059669'}; font-weight:700;">
                    ${remaining.toFixed(2)} €
                </td>
            </tr>
        `;
    }).join('');

    updateSummaryStats(grandTotal, totalPaid, standings.length);
    setupAdminButton(standings, finesData, monthlyData, currentGW);

    if (isAdmin) {
        tbody.querySelectorAll('.input-pago').forEach(input => {
            input.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                const val = parseFloat(e.target.value) || 0;
                
                e.target.disabled = true;
                const ok = await savePayment(id, val, currentPin);
                e.target.disabled = false;

                if (ok) {
                    renderFinance(standings, finesData, monthlyData, currentGW);
                }
            });
        });
    }
}

function updateSummaryStats(total, paid, totalManagers) {
    const elTotal = document.getElementById('stat-total');
    const elReal = document.getElementById('stat-real');
    const elMedia = document.getElementById('stat-media');

    if (elTotal) elTotal.innerText = `${total.toFixed(2)} €`;
    if (elReal) elReal.innerText = `${paid.toFixed(2)} €`;
    if (elMedia) elMedia.innerText = `${(total / (totalManagers || 1)).toFixed(2)} €`;
}

function setupAdminButton(standings, finesData, monthlyData, currentGW) {
    const card = document.querySelector('#table-finance')?.closest('.card');
    if (!card || document.getElementById('btn-admin-toggle')) return;

    const btn = document.createElement('button');
    btn.id = 'btn-admin-toggle';
    btn.style.cssText = 'margin-top: 15px; font-size: 0.8rem; background: none; border: 1px dashed #bbb; color: #666; cursor: pointer; padding: 4px 10px; border-radius: 4px; display: block;';
    btn.textContent = getAdminPin() ? '🔒 Bloquear Edição' : '🔑 Modo Admin';

    btn.addEventListener('click', () => {
        if (getAdminPin()) {
            sessionStorage.removeItem('triveladas_admin_pin');
            alert('Modo Admin desativado.');
        } else {
            const pass = prompt('Introduz o PIN de administrador:');
            if (pass) {
                sessionStorage.setItem('triveladas_admin_pin', pass);
            }
        }
        renderFinance(standings, finesData, monthlyData, currentGW);
    });

    card.appendChild(btn);
}