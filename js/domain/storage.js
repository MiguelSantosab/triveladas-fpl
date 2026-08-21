const STORAGE_KEY = 'triveladas_custom_fines';

export function getCustomFines() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error("Erro ao ler multas personalizadas do localStorage:", e);
        return {};
    }
}

export function saveCustomFines(fines) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fines));
    } catch (e) {
        console.error("Erro ao gravar multas personalizadas no localStorage:", e);
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