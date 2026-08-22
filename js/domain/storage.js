// js/domain/storage.js

const STORAGE_KEYS = {
    CUSTOM_FINES: 'triveladas_custom_fines',
    PAYMENTS: 'triveladas_saved_payments'
};

export function getSavedPayments() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error("Erro ao ler pagamentos:", e);
        return {};
    }
}

export function savePayment(managerId, amount) {
    try {
        const payments = getSavedPayments();
        payments[managerId] = Number(amount) || 0;
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
        return true;
    } catch (e) {
        console.error("Erro ao gravar pagamento:", e);
        return false;
    }
}

export function getCustomFines() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_FINES);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
}