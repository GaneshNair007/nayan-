export async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    let message = `Request unavailable (${response.status})`;
    try { const data = await response.json(); if (typeof data.detail === 'string') message = data.detail; } catch { /* Non-JSON error response */ }
    throw new Error(message);
  }
  return response.json();
}
export const post = (url, body) => request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
export const number = (value, digits = 0, unit = '') => Number.isFinite(value) ? `${value.toFixed(digits)}${unit}` : 'N/A';
export const percent = value => number(Number.isFinite(value) ? value * 100 : value, 0, '%');
export const human = value => typeof value === 'string' ? value.replaceAll('_', ' ') : 'N/A';
export function downloadJson(value, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
