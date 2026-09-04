import { open } from '@tauri-apps/plugin-shell';
import { regrasProdutos } from '../constants/products';

export const showToast = (message) => {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-2xl z-[9999] text-sm font-bold flex items-center gap-2 animate-fade-in-up border border-slate-700 dark:border-emerald-500/50';
  toast.innerHTML = `<svg class="w-4 h-4 text-emerald-400 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 2500);
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Orçamento copiado!");
  } catch (err) {
    console.error('Erro ao copiar:', err);
    alert('Erro ao copiar o texto.');
  }
};

export const handleExternalLink = async (url, e) => {
  if (e) e.preventDefault();
  try {
    await open(url);
  } catch (err) {
    console.warn('Tauri shell open failed, falling back to window.open', err);
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

export const normalizeStr = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim() : "";

export const getRegra = (nome) => {
  const normNome = normalizeStr(nome);
  for (const [key, regra] of Object.entries(regrasProdutos)) {
    if (normNome.includes(key)) return regra;
  }
  return null;
};

export const formatPrice = (value) => {
  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  return value;
};

export const parseCSVLine = (line) => {
  const separator = (line.indexOf(';') !== -1 && line.split(';').length > line.split(',').length) ? ';' : ',';
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i+1] === '"') { current += '"'; i++; } 
    else if (char === '"') { inQuotes = !inQuotes; } 
    else if (char === separator && !inQuotes) { result.push(current); current = ''; } 
    else { current += char; }
  }
  result.push(current);
  return result;
};

export const parseMoney = (val) => {
  if (!val) return 0;
  let clean = String(val).replace(/"/g, '').toUpperCase().replace('R$', '').trim();
  if (clean === '' || clean === '-') return 0;
  clean = clean.replace(/\./g, '').replace(',', '.'); 
  return isNaN(Number(clean)) ? 0 : Number(clean);
};

export const parseDateDM = (dateStr) => {
  if (!dateStr) return new Date(0);
  const parts = dateStr.split('/');
  if (parts.length !== 2) return new Date(0);
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const currentYear = new Date().getFullYear();
  return new Date(currentYear, m - 1, d);
};
