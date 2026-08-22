// js/domain/storage.js

const STORAGE_KEYS = {
    CUSTOM_FINES: 'triveladas_custom_fines',
    PAYMENTS: 'triveladas_saved_payments'
};

let cachedPayments = null;

// --- PAGAMENTOS (Upstash Redis Cloud com fallback para localStorage) ---
export async function getSavedPayments() {
    try {
        const res = await fetch('/api/payments');
        if (res.ok) {
            cachedPayments = await res.json();
            return cachedPayments;
        }
    } catch (e) {
        console.warn("Erro ao contactar base de dados, a usar cache/localStorage.");
    }

    if (cachedPayments) return cachedPayments;

    try {
        const local = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
        return local ? JSON.parse(local) : {};
    } catch (e) {
        return {};
    }
}

export async function savePayment(managerId, amount, pin) {
    // 1. Grava na Base de Dados Cloud
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

export const setManagerPayment = savePayment;

// --- MULTAS PERSONALIZADAS (localStorage) ---
export function getCustomFines() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_FINES);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error("Erro ao ler multas:", e);
        return {};
    }
}

export function saveCustomFines(fines) {
    try {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_FINES, JSON.stringify(fines));
    } catch (e) {
        console.error("Erro ao gravar multas:", e);
    }
}

export function saveCustomFine(entryId, fineType, value) {
    const fines = getCustomFines();
    if (!fines[entryId]) {
        fines[entryId] = {};
    }
    fines[entryId][fineType] = Number(value) || 0;
    saveCustomFines(fines);
}

export const setManagerCustomFine = saveCustomFine;
export const getCustomFine = getCustomFines;