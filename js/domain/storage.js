const STORAGE_KEYS = {
    CUSTOM_FINES: 'triveladas_custom_fines',
    PAYMENTS: 'triveladas_saved_payments'
};

// --- MULTAS PERSONALIZADAS ---
export function getCustomFines() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_FINES);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error("Erro ao ler multas do localStorage:", e);
        return {};
    }
}

export function saveCustomFines(fines) {
    try {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_FINES, JSON.stringify(fines));
    } catch (e) {
        console.error("Erro ao gravar multas no localStorage:", e);
    }
}

export function setManagerCustomFine(entryId, fineType, value) {
    const fines = getCustomFines();
    if (!fines[entryId]) {
        fines[entryId] = {};
    }
    fines[entryId][fineType] = Number(value) || 0;
    saveCustomFines(fines);
}

// --- PAGAMENTOS ---
export function getSavedPayments() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error("Erro ao ler pagamentos do localStorage:", e);
        return {};
    }
}

export function savePayments(payments) {
    try {
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    } catch (e) {
        console.error("Erro ao gravar pagamentos no localStorage:", e);
    }
}

export function setManagerPayment(entryId, amount) {
    const payments = getSavedPayments();
    payments[entryId] = Number(amount) || 0;
    savePayments(payments);
}