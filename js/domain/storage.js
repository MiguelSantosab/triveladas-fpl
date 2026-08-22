// js/domain/storage.js

let cachedPayments = null;

export async function getSavedPayments() {
    try {
        const res = await fetch('/api/payments');
        if (res.ok) {
            cachedPayments = await res.json();
            return cachedPayments;
        }
    } catch (e) {
        console.warn("API de pagamentos indisponível, a usar vazio:", e);
    }
    return cachedPayments || {};
}

export async function savePayment(managerId, amount, pin) {
    try {
        const res = await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ managerId, amount, pin })
        });
        
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Erro ao guardar.");
        }

        const data = await res.json();
        cachedPayments = data.payments;
        return true;
    } catch (e) {
        alert(e.message);
        return false;
    }
}

export function getCustomFines() {
    return {};
}