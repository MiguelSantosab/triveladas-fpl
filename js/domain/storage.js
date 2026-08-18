import { CONFIG } from '../config.js';

const STORAGE_KEY = `fpl_payments_${CONFIG.LEAGUE_ID}`;

export function getSavedPayments() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
}

export function savePayment(managerId, amount) {
  const payments = getSavedPayments();
  payments[managerId] = parseFloat(amount) || 0;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
}