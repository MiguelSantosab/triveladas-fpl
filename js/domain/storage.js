// js/domain/storage.js

const STORAGE_KEYS = {
    CUSTOM_FINES: 'triveladas_custom_fines'
};

export async function getSavedPayments() {
    try {
        const res = await fetch('/api/payments');
        if (!res.ok) throw new Error("Falha ao obter pagamentos");
        return await res.json();
    } catch (e) {
        console.error("Erro ao ler pagamentos da base de dados:", e);
        return {};
    }
}

export async function savePayment(managerId, amount, pin) {
    try {
        const res = await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pin: pin,
                managerId: managerId,
                amount: Number(amount) || 0
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Erro ao gravar pagamento.");
            return false;
        }

        return true;
    } catch (e) {
        console.error("Erro ao gravar pagamento:", e);
        alert("Erro de ligação ao servidor.");
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