import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { open } from '@tauri-apps/plugin-shell';
import adsSvg from './assets/logos/ads.svg';
import crbSvg from './assets/logos/crb.svg';
import prtSvg from './assets/logos/prt.svg';

import { 
  Home, 
  Package, 
  Clock, 
  CalendarDays, 
  Download, 
  Upload, 
  ShieldAlert,
  Info,
  Circle,
  Crop,
  Maximize,
  Layers,
  FileText,
  Hash,
  SquareDashed,
  Clipboard,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Cog,
  Lock,
  Unlock,
  Printer,
  Palette, 
  FileEdit, 
  BarChart, 
  ClipboardList, 
  Building2, 
  CircleDollarSign, 
  RefreshCw, 
  PenTool, 
  FileArchive,
  Menu,
  X,
  Minus,
  Plus,
  ChevronsUp,
  Search,
  MapPin,
  Building,
  ExternalLink,
  Copy
} from 'lucide-react';

const showToast = (message) => {
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

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Orçamento copiado!");
  } catch (err) {
    console.error('Erro ao copiar:', err);
    alert('Erro ao copiar o texto.');
  }
};

const handleExternalLink = async (url, e) => {
  if (e) e.preventDefault();
  try {
    await open(url);
  } catch (err) {
    console.warn('Tauri shell open failed, falling back to window.open', err);
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

const regrasProdutos = {
  "BASTAO": { minL: 50, maxL: 200, minA: 50, maxA: 1000, minQtd: 1, minVal: 60, fator: 1.24, isAdesivo: false },
  "ILHOSES": { minL: 50, maxL: 200, minA: 75, maxA: 1000, minQtd: 1, minVal: 62, fator: 1.43, isAdesivo: false },
  "LONA": { minL: 50, maxL: 300, minA: 100, maxA: 1000, minQtd: 1, minVal: 60, fator: 1.20, isAdesivo: false },
  "FAIXA": { minL: 100, maxL: 1000, minA: 50, maxA: 200, minQtd: 1, minVal: 65, fator: 1.33, isAdesivo: false },
  "MICROPERFURADO": { minL: 30, maxL: 148, minA: 21, maxA: 1000, minQtd: 1, minVal: 52, fator: 1.19, isAdesivo: true },
  "TRANSPARENTE": { minL: 5, maxL: 70, minA: 5, maxA: 1000, minQtd: 1, minVal: 145, fator: 3.10, isAdesivo: true },
  "HOLOGRAFICO": { minL: 5, maxL: 54, minA: 5, maxA: 100, minQtd: 1, minVal: 159, fator: 3.49, isAdesivo: true },
  "VINIL": { minL: 5, maxL: 140, minA: 5, maxA: 1000, minQtd: 1, minVal: 82, fator: 1.84, isAdesivo: true }
};

const BYPASS_TYPE_SUBCATS = [
  "MARCA PAGINA", 
  "CALENDARIO DE BOLSO", 
  "SANTINHO", 
  "CRACHA", 
  "FOLHINHA COMERCIAL"
];

const normalizeStr = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim() : "";

const getRegra = (nome) => {
  const normNome = normalizeStr(nome);
  for (const [key, regra] of Object.entries(regrasProdutos)) {
    if (normNome.includes(key)) return regra;
  }
  return null;
};

const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbztdiR-eqX5qvv3oynhnbhZBqVyvKVdCC7V31tJdtRzPceOx2BHZDpDzrqiMJ3YO9a02A/exec";

const ExtraCard = ({ icon: Icon, title, price, subtitle }) => (
  <div className="bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-[#1e293b] rounded-xl p-4 flex items-center gap-4 hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:bg-blue-50/50 dark:hover:bg-[#162032] transition-all duration-300 shadow-sm cursor-pointer group">
    <div className="flex-shrink-0 text-emerald-600 dark:text-emerald-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex flex-col">
      <div className="text-[13px] text-slate-800 dark:text-slate-200 font-bold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
        {title} {price && <span className="text-blue-600 dark:text-blue-500 ml-1">{price}</span>}
      </div>
      {subtitle && <div className="text-[11px] text-slate-500 dark:text-slate-500 font-medium mt-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-400 transition-colors">{subtitle}</div>}
    </div>
  </div>
);

const GraficaRow = ({ product, formatPrice }) => {
  const regraCalc = getRegra(product.name);
  const [calcValues, setCalcValues] = useState({ 
    l: regraCalc ? regraCalc.minL : 0, 
    a: regraCalc ? regraCalc.minA : 0, 
    q: regraCalc ? regraCalc.minQtd : 1 
  });
  
  const [pulse, setPulse] = useState(false);

  const handleCalcBlur = (field, val) => {
    let v = Number(val);
    if (field === 'l') {
      if (v > 0 && v < regraCalc.minL) v = regraCalc.minL;
      if (v > regraCalc.maxL) v = regraCalc.maxL;
    }
    if (field === 'a') {
      if (v > 0 && v < regraCalc.minA) v = regraCalc.minA;
      if (v > regraCalc.maxA) v = regraCalc.maxA;
    }
    if (field === 'q') {
      if (v > 0 && v < regraCalc.minQtd) v = regraCalc.minQtd;
    }
    setCalcValues(prev => ({ ...prev, [field]: v }));
  };

  const getCalculatedResult = () => {
    let { l, a, q } = calcValues;
    if (l < regraCalc.minL) l = regraCalc.minL;
    if (l > regraCalc.maxL) l = regraCalc.maxL;
    if (a < regraCalc.minA) a = regraCalc.minA;
    if (a > regraCalc.maxA) a = regraCalc.maxA;
    if (q < regraCalc.minQtd) q = regraCalc.minQtd;

    if (calcValues.l === 0 || calcValues.a === 0) return { total: 0, area: 0, l, a, q };

    let areaTotalM2 = ((l * a) / 10000) * q;
    let calculoBase = ((l * a) / 100) * regraCalc.fator;
    if (regraCalc.isAdesivo) calculoBase = calculoBase * q;
    
    let totalCalculado = calculoBase < regraCalc.minVal ? regraCalc.minVal : calculoBase;
    totalCalculado = Math.ceil(totalCalculado);

    return { total: totalCalculado, area: areaTotalM2, l, a, q };
  };

  const calcRes = regraCalc ? getCalculatedResult() : null;

  useEffect(() => {
    if (calcRes && calcRes.total > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 300);
      return () => clearTimeout(timer);
    }
  }, [calcRes?.total]);

  const getPreviewDimensions = () => {
    const w = calcValues.l || regraCalc.minL;
    const h = calcValues.a || regraCalc.minA;
    const max = Math.max(w, h);
    const scale = 130 / max; 
    return { width: w * scale, height: h * scale };
  };
  const previewBox = regraCalc ? getPreviewDimensions() : {width:0, height:0};

  return (
    <React.Fragment>
      <tr className={`transition-colors border-b border-slate-200 dark:border-[#1e293b]/50 ${regraCalc ? 'bg-slate-100 dark:bg-[#1a2333] border-b-0' : 'hover:bg-slate-50 dark:hover:bg-[#1a2333] last:border-0'}`}>
        <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-500 text-xs">{product.id}</td>
        <td className="px-6 py-4">
          <div className="font-extrabold text-slate-800 dark:text-slate-200 mb-2 uppercase whitespace-nowrap">{product.name || product.subCategory}</div>
          <div className="flex items-center gap-2 mt-1 w-max">
              {product.quantity && <span className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm whitespace-nowrap">Qtd: {product.quantity}</span>}
              {product.measure && <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm whitespace-nowrap">{product.measure}</span>}
              {product.printType && <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm uppercase whitespace-nowrap">{product.printType}</span>}
          </div>
        </td>
        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-[13px] leading-relaxed max-w-md">{product.description || '-'}</td>
        <td className="px-6 py-4">
          {product.deadline ? (
            <span className="mx-auto flex items-center justify-center w-fit text-slate-600 dark:text-slate-400 text-[11px] font-semibold border border-slate-300 dark:border-slate-600/50 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-full whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" />
              {product.deadline}
            </span>
          ) : <div className="text-center text-slate-400 dark:text-slate-600">-</div>}
        </td>
        <td className="px-6 py-4 text-right align-middle">
          {!regraCalc && (
            <div className="flex items-center justify-end gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-black text-[17px] block bg-emerald-50 dark:bg-emerald-500/10 px-2 py-2 rounded-lg ml-auto w-[120px] text-center border border-emerald-200 dark:border-emerald-500/40 tracking-wide whitespace-nowrap">
                {formatPrice(product.price)}
              </span>
              <button 
                onClick={() => copyToClipboard(`📋 *Orçamento Yama Print*\n*Produto:* ${product.subCategory || product.name}\n*Modelo:* ${product.name}\n${product.description && product.description !== '-' ? `*Especificações:* ${product.description}\n` : ''}${product.quantity ? `*Qtd:* ${product.quantity}\n` : ''}${product.measure ? `*Medida:* ${product.measure}\n` : ''}*Prazo:* ${product.deadline || '-'}\n*Total:* ${formatPrice(product.price)}`)}
                className="p-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors cursor-pointer"
                title="Copiar Orçamento"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          )}
        </td>
      </tr>

      {regraCalc && (
        <tr className="border-b border-slate-200 dark:border-[#1e293b]/50 bg-slate-100 dark:bg-[#1a2333]">
          <td colSpan="5" className="p-0">
            <div className="m-4 mt-0 bg-white/80 dark:bg-[#0b0e14]/80 backdrop-blur-md rounded-2xl border border-blue-500/20 shadow-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5 transition-all">
              
              <div className="bg-gradient-to-r from-blue-500/10 to-transparent p-4 border-b border-slate-200/50 dark:border-[#1e293b]/50 flex items-center justify-between">
                <div className="text-blue-700 dark:text-blue-400 font-black text-[13px] flex items-center gap-2 uppercase tracking-wide">
                  <Maximize className="w-4 h-4" />
                  Calculadora
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold flex gap-3">
                  <span>Limites:</span>
                  <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">L: {regraCalc.minL} a {regraCalc.maxL}cm</span>
                  <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">A: {regraCalc.minA} a {regraCalc.maxA}cm</span>
                </div>
              </div>

              <div className="p-6 flex flex-col lg:flex-row gap-10 items-center justify-between">
                
                <div className="flex-1 w-full flex flex-col gap-4 max-w-sm">
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-[#121826] border border-slate-300 dark:border-[#1e293b] rounded-xl p-3 shadow-inner focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8M8 17h8M5 12h14m-4-4 4 4-4 4M9 8l-4 4 4 4"/></svg>
                      <label className="text-[11px] font-bold uppercase tracking-wider">Largura (cm)</label>
                    </div>
                    <input type="number" value={calcValues.l || ''} onChange={(e) => setCalcValues(p => ({...p, l: e.target.value}))} onBlur={(e) => handleCalcBlur('l', e.target.value)} className="w-24 bg-transparent text-right text-lg text-slate-900 dark:text-white font-black focus:outline-none" />
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 dark:bg-[#121826] border border-slate-300 dark:border-[#1e293b] rounded-xl p-3 shadow-inner focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 8v8M17 8v8M12 5v14m-4-4 4 4 4-4M8 9l4-4 4 4"/></svg>
                      <label className="text-[11px] font-bold uppercase tracking-wider">Altura (cm)</label>
                    </div>
                    <input type="number" value={calcValues.a || ''} onChange={(e) => setCalcValues(p => ({...p, a: e.target.value}))} onBlur={(e) => handleCalcBlur('a', e.target.value)} className="w-24 bg-transparent text-right text-lg text-slate-900 dark:text-white font-black focus:outline-none" />
                  </div>

                  {regraCalc.isAdesivo && (
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-[#121826] border border-slate-300 dark:border-[#1e293b] rounded-xl p-2.5 shadow-inner transition-all">
                      <div className="flex items-center gap-3 pl-1 text-slate-500 dark:text-slate-400">
                        <Layers className="w-4 h-4 text-emerald-500" />
                        <label className="text-[11px] font-bold uppercase tracking-wider">Quantidade</label>
                      </div>
                      <div className="flex items-center gap-1 bg-white dark:bg-[#0b0e14] border border-slate-200 dark:border-[#27354f] rounded-lg p-1 shadow-sm">
                        <button onClick={() => handleCalcBlur('q', (calcValues.q || regraCalc.minQtd) - 1)} className="w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><Minus className="w-4 h-4" /></button>
                        <input type="number" value={calcValues.q || ''} onChange={(e) => setCalcValues(p => ({...p, q: e.target.value}))} onBlur={(e) => handleCalcBlur('q', e.target.value)} className="w-12 text-center bg-transparent text-slate-900 dark:text-white font-black focus:outline-none" />
                        <button onClick={() => setCalcValues(p => ({...p, q: (Number(p.q) || 0) + 1}))} className="w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex justify-center items-center min-h-[180px] w-full">
                  <div className="relative flex items-center justify-center mt-6 ml-6">
                    
                    <div className="absolute -top-7 w-full flex items-center justify-between text-blue-600 dark:text-blue-400">
                      <span className="text-xs font-bold leading-none">←</span>
                      <span className="text-[11px] font-black tracking-widest">{calcRes.l}cm</span>
                      <span className="text-xs font-bold leading-none">→</span>
                    </div>

                    <div className="absolute -left-9 h-full flex flex-col items-center justify-between text-blue-600 dark:text-blue-400">
                      <span className="text-xs font-bold leading-none">↑</span>
                      <span className="text-[11px] font-black tracking-widest -rotate-90">{calcRes.a}cm</span>
                      <span className="text-xs font-bold leading-none">↓</span>
                    </div>

                    <div 
                      className="bg-blue-500/10 border-2 border-blue-500/60 rounded-md transition-all duration-300 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.15)] relative overflow-hidden group"
                      style={{ width: `${previewBox.width}px`, height: `${previewBox.height}px` }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.05)_50%,transparent_75%)] bg-[length:10px_10px]"></div>
                      {regraCalc.isAdesivo && (
                        <div className="z-10 bg-white/90 dark:bg-[#0b0e14]/90 backdrop-blur-sm px-2 py-1 rounded border border-blue-500/30 text-blue-700 dark:text-blue-300 font-black text-xs md:text-sm drop-shadow-md">
                          {calcRes.q}x
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-[280px] flex flex-col gap-3">
                  <div className="bg-slate-50/50 dark:bg-[#121826]/50 rounded-xl border border-slate-200 dark:border-[#1e293b] p-3 text-center shadow-inner">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Resumo da Área</div>
                    <div className="text-slate-700 dark:text-slate-300 text-xs font-bold">
                      {calcRes.area.toFixed(2)} m²
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl shadow-lg transition-transform duration-300 flex flex-col items-center justify-center border relative ${calcRes.total > 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 shadow-emerald-500/20' : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'} ${pulse ? 'scale-105' : 'scale-100'}`}>
                    <div className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1">Valor Total Orçado</div>
                    <div className={`text-4xl font-black tracking-tight ${calcRes.total > 0 ? 'text-white drop-shadow-md' : 'text-slate-400 dark:text-slate-500'}`}>
                      {calcRes.total > 0 ? formatPrice(calcRes.total) : 'R$ 0,00'}
                    </div>
                    {calcRes.total > 0 && (
                      <button 
                        onClick={() => copyToClipboard(`📋 *Orçamento Yama Print*\n*Produto:* ${product.name}\n${product.description && product.description !== '-' ? `*Material/Especificações:* ${product.description}\n` : ''}*Medida:* ${calcRes.l}x${calcRes.a} cm\n*Área:* ${calcRes.area.toFixed(2)} m²\n*Qtd:* ${calcRes.q}\n*Prazo:* ${product.deadline || '-'}\n*Valor Total:* ${formatPrice(calcRes.total)}`)}
                        className="absolute -bottom-3 w-[80%] py-1.5 bg-white text-emerald-600 dark:bg-[#0b0e14] dark:text-emerald-400 font-black text-[10px] uppercase rounded-full shadow-lg flex items-center justify-center gap-1.5 transition-transform hover:scale-105 cursor-pointer border border-emerald-200 dark:border-emerald-500/30"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copiar Orçamento
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

const ServiceCalculator = ({ subCat, formatPrice }) => {
  const [qtdA4, setQtdA4] = useState(0);
  const [qtdA3, setQtdA3] = useState(0);

  const tipo = subCat?.toUpperCase();
  let pA4 = 0, pA3 = 0;

  if (tipo === "COPIA") {
      pA4 = qtdA4 <= 10 ? 0.50 : qtdA4 <= 50 ? 0.45 : qtdA4 <= 199 ? 0.40 : 0.35;
      pA3 = qtdA3 <= 10 ? 1.00 : qtdA3 <= 50 ? 0.90 : qtdA3 <= 199 ? 0.80 : 0.70;
  } else if (tipo === "IMPRESSÃO P/B" || tipo === "IMPRESSÃO PB") {
      pA4 = qtdA4 <= 10 ? 0.90 : qtdA4 <= 20 ? 0.75 : qtdA4 <= 30 ? 0.60 : qtdA4 <= 80 ? 0.50 : qtdA4 <= 199 ? 0.40 : 0.30;
      pA3 = qtdA3 <= 10 ? 1.75 : qtdA3 <= 20 ? 1.50 : qtdA3 <= 30 ? 1.20 : qtdA3 <= 80 ? 1.00 : qtdA3 <= 199 ? 0.80 : 0.60;
  } else if (tipo === "IMPRESSÃO COLORIDA") {
      pA4 = qtdA4 <= 10 ? 1.70 : qtdA4 <= 20 ? 1.50 : qtdA4 <= 50 ? 1.40 : 1.30;
      pA3 = qtdA3 <= 10 ? 3.40 : qtdA3 <= 20 ? 3.00 : qtdA3 <= 50 ? 2.80 : 2.70;
  }

  if (!['COPIA', 'IMPRESSÃO P/B', 'IMPRESSÃO PB', 'IMPRESSÃO COLORIDA'].includes(tipo)) return null;

  const totalA4 = qtdA4 * pA4;
  const totalA3 = qtdA3 * pA3;

  const getNextTierInfo = (qtd) => {
    let tiers = [];
    if (tipo === "COPIA") tiers = [10, 50, 199];
    else if (tipo === "IMPRESSÃO P/B" || tipo === "IMPRESSÃO PB") tiers = [10, 20, 30, 80, 199];
    else if (tipo === "IMPRESSÃO COLORIDA") tiers = [10, 20, 50];

    for (let t of tiers) {
      if (qtd <= t) return { faltam: (t + 1) - qtd, proximoAlvo: t + 1 };
    }
    return null;
  };

  const tierA4 = getNextTierInfo(qtdA4);
  const tierA3 = getNextTierInfo(qtdA3);

  const Stepper = ({ val, setVal }) => (
    <div className="flex items-center gap-1 bg-white dark:bg-[#121826] border border-slate-300 dark:border-[#1e293b] rounded-xl p-1 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/50">
      <button onClick={() => setVal(Math.max(0, val - 10))} className="w-8 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="-10"><ChevronsUp className="w-4 h-4 rotate-180" /></button>
      <button onClick={() => setVal(Math.max(0, val - 1))} className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors bg-slate-50 dark:bg-slate-800/50"><Minus className="w-4 h-4" /></button>
      <input type="number" value={val || ''} onChange={(e) => setVal(Math.max(0, Number(e.target.value)))} className="w-16 text-center bg-transparent text-slate-900 dark:text-white font-black text-lg focus:outline-none" />
      <button onClick={() => setVal(val + 1)} className="w-9 h-9 flex items-center justify-center rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors bg-blue-50 dark:bg-blue-500/10"><Plus className="w-4 h-4" /></button>
      <button onClick={() => setVal(val + 10)} className="w-8 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="+10"><ChevronsUp className="w-4 h-4" /></button>
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#1e293b] rounded-2xl p-6 mb-6 shadow-sm">
      <h4 className="text-[13px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-6 uppercase tracking-wide">
        <Printer className="w-4 h-4" />
        Simulador de {tipo}
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${qtdA4 > 0 ? 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-300 dark:border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-slate-50 dark:bg-[#0b0e14] border-slate-200 dark:border-[#1e293b] shadow-inner'}`}>
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-[12px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> Formato A4
              </label>
              {qtdA4 > 0 && <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-1 rounded font-bold">{formatPrice(pA4)}/unid</span>}
            </div>
            <Stepper val={qtdA4} setVal={setQtdA4} />
            
            <div className="h-6 mt-3">
              {qtdA4 > 0 && tierA4 && (
                <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 animate-fade-in flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                  Faltam {tierA4.faltam} unid para o valor baixar!
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-[#1e293b]/60 pt-4 mt-2">
             <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total A4:</span>
             <div className="flex items-center gap-3">
                <span className={`font-black text-2xl transition-colors ${qtdA4 > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{formatPrice(totalA4)}</span>
                {qtdA4 > 0 && (
                  <button 
                    onClick={() => copyToClipboard(`📋 *Orçamento Yama Print*\n*Serviço:* ${tipo}\n*Formato:* A4\n*Qtd:* ${qtdA4}\n*Total:* ${formatPrice(totalA4)}`)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors cursor-pointer"
                    title="Copiar Orçamento"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
             </div>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${qtdA3 > 0 ? 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-300 dark:border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-slate-50 dark:bg-[#0b0e14] border-slate-200 dark:border-[#1e293b] shadow-inner'}`}>
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-[12px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" /> Formato A3
              </label>
              {qtdA3 > 0 && <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-1 rounded font-bold">{formatPrice(pA3)}/unid</span>}
            </div>
            <Stepper val={qtdA3} setVal={setQtdA3} />
            
            <div className="h-6 mt-3">
              {qtdA3 > 0 && tierA3 && (
                <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 animate-fade-in flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                  Faltam {tierA3.faltam} unid para o valor baixar!
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-[#1e293b]/60 pt-4 mt-2">
             <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total A3:</span>
             <div className="flex items-center gap-3">
               <span className={`font-black text-2xl transition-colors ${qtdA3 > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{formatPrice(totalA3)}</span>
               {qtdA3 > 0 && (
                  <button 
                    onClick={() => copyToClipboard(`📋 *Orçamento Yama Print*\n*Serviço:* ${tipo}\n*Formato:* A3\n*Qtd:* ${qtdA3}\n*Total:* ${formatPrice(totalA3)}`)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors cursor-pointer"
                    title="Copiar Orçamento"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [hoursData, setHoursData] = useState([]);
  const [folgasData, setFolgasData] = useState([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [isExtrasOpen, setIsExtrasOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [activeStore, setActiveStore] = useState('mogi');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  
  const [uploadHistory, setUploadHistory] = useState({});

  const [consultaType, setConsultaType] = useState('CEP');
  const [consultaInput, setConsultaInput] = useState('');
  const [consultaResult, setConsultaResult] = useState(null);
  const [consultaLoading, setConsultaLoading] = useState(false);
  const [consultaError, setConsultaError] = useState('');

  // Estados interativos para as Calculadoras Rápidas da Tela Inicial
  const [calcCopiaQtd, setCalcCopiaQtd] = useState(0);
  const [calcPbQtd, setCalcPbQtd] = useState(0);
  const [calcColorQtd, setCalcColorQtd] = useState(0);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const fetchUploadHistory = async () => {
      try {
        const docRef = doc(db, "settings", "historico_uploads");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUploadHistory(docSnap.data());
        }
      } catch (err) {
        console.error("Erro ao carregar histórico de uploads:", err);
      }
    };
    fetchUploadHistory();
  }, []);

  const uploadTargets = {
    mogi: [
      { name: 'Contador Máquina 1', folderId: '1ICahzIvyvcsbC0Y-W1uo4r0ByChTtgpS' },
      { name: 'Contador Máquina 2', folderId: '1SJQzWsfPiB6RN0ZTlNfOGPlQ7dKHHdnV' },
      { name: 'Contador Máquina 3', folderId: '1K8Y-o5344PhegDlykicl3HGJUhq2N0f-' }
    ],
    suzano: [
      { name: 'Gráfica Suzano', folderId: '1vrTxUUKq_k5mwBsJa0nB5qBg51CD_4W11tWFQcpN__TLJPPaGwbWP8Rd7kLPir5_sZwvusLE' },
      { name: 'Carimbo Suzano', folderId: '1Nz6Z1IRsSD9IUCkdDkJhbt51nGej2r4A3ZRK3FG9Cyx-juD5DFhlPaDqDpI6OU3b7d0mdVQ2' },
      { name: 'Contador Máquina 1', folderId: '1jTUxHGDVLJpK_Ahfy3_mK6ejsaN5XfMi8mfh2oBsbL1EcPv8gtlpyb35nU7z69kweQttTpmz' },
      { name: 'Contador Máquina 2', folderId: '1r1VDDKAtSlKHcXFGieAqwO7qkzLXy-PLbMBp67ZYz_BJ178cQBh0e0F8L8R9fDFQOajtSpUN' },
      { name: 'Contador Máquina 3', folderId: '1e14Nhob1suDKqRlkxVmxyShQZQ_cFCij1ZhFo6fLMqibTqeGtS607zc9yavpt59h33mPHRxW' }
    ]
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadMsg('');
    }
  };

  const handleSendFile = async () => {
    if (!selectedFile || !selectedTarget) return;
    setUploading(true);
    setUploadMsg('Enviando arquivo com segurança...');

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const base64Bytes = reader.result.split(',')[1];
      try {
        const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz_sWBj0XoEM6Mg4B0ALzMKFd-OciqrXaSaLmlIvF0Hf9pf674guHz51hGfn-q4XDdzNA/exec"; 
        
        const response = await fetch(WEB_APP_URL, {
          method: 'POST',
          body: JSON.stringify({
            filename: selectedFile.name,
            mimeType: selectedFile.type,
            bytes: base64Bytes,
            folderId: selectedTarget.folderId
          })
        });
        const result = await response.json();
        if (result.status === 'sucesso') {
          setUploadMsg('✅ Arquivo enviado com sucesso!');
          
          const agora = new Date();
          const dataFormatada = agora.toLocaleDateString('pt-BR');
          const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          
          const novoRegistro = {
            nome: selectedFile.name,
            data: dataFormatada,
            hora: horaFormatada,
            timestamp: agora.getTime()
          };

          const folderKey = selectedTarget.folderId;
          const historicoAtual = uploadHistory[folderKey] || [];
          const novoHistoricoLista = [novoRegistro, ...historicoAtual].slice(0, 3);
          
          const novoHistoricoCompleto = {
            ...uploadHistory,
            [folderKey]: novoHistoricoLista
          };

          setUploadHistory(novoHistoricoCompleto);
          await setDoc(doc(db, "settings", "historico_uploads"), novoHistoricoCompleto);

          setSelectedFile(null);
          setTimeout(() => { setUploadMsg(''); }, 3000);
        } else {
          setUploadMsg('❌ Erro ao enviar: ' + result.message);
        }
      } catch (err) {
        setUploadMsg('❌ Erro de conexão: ' + err.message);
      } finally {
        setUploading(false);
      }
    };
  };

  const formatPrice = (value) => {
    if (typeof value === 'number') {
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return value;
  };

  const handleConsulta = async () => {
    if (!consultaInput) return;
    setConsultaLoading(true);
    setConsultaError('');
    setConsultaResult(null);

    try {
      const cleanInput = consultaInput.replace(/\D/g, '');
      let url = '';
      
      if (consultaType === 'CEP') {
        if (cleanInput.length !== 8) throw new Error('CEP deve conter 8 dígitos.');
        url = `https://brasilapi.com.br/api/cep/v2/${cleanInput}`;
      } else {
        if (cleanInput.length !== 14) throw new Error('CNPJ deve conter 14 dígitos.');
        url = `https://brasilapi.com.br/api/cnpj/v1/${cleanInput}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Dados não encontrados.');
      }

      setConsultaResult(data);
    } catch (err) {
      setConsultaError(err.message || 'Erro ao realizar a consulta.');
    } finally {
      setConsultaLoading(false);
    }
  };

  const handlePrintConsulta = () => {
    if (!consultaResult) return;
    window.print();
  };

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('HOME'); 
  const [selectedSubCategory, setSelectedSubCategory] = useState(null); 
  const [selectedProductType, setSelectedProductType] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [animationClass, setAnimationClass] = useState('animate-fade-in');
  const [uploadStatus, setUploadStatus] = useState('');
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const triggerAnimation = () => {
    setAnimationClass('');
    setTimeout(() => setAnimationClass('animate-fade-in-up'), 10);
  };

  const handlePrint = (type) => {
    window.print();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const qProd = query(collection(db, "products"), orderBy("order", "asc"));
      const snapProd = await getDocs(qProd);
      const items = [];
      snapProd.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
      setProducts(items);

      const qSup = query(collection(db, "suppliers"));
      const snapSup = await getDocs(qSup);
      const sups = [];
      snapSup.forEach((doc) => sups.push({ id: doc.id, ...doc.data() }));
      sups.sort((a, b) => (a.fornecedor || '').localeCompare(b.fornecedor || ''));
      setSuppliers(sups);

      const docSnap = await getDoc(doc(db, "settings", "dados_planilhas"));
      if (docSnap.exists()) {
        const cacheData = docSnap.data();
        if (cacheData.horas) setHoursData(cacheData.horas);
        if (cacheData.folgas) setFolgasData(cacheData.folgas);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const backgroundSyncSheet = async (isManual = false) => {
    if (!SHEET_API_URL) return;
    if (isManual) setLoadingHours(true);
    try {
      const res = await fetch(SHEET_API_URL);
      const data = await res.json();
      
      if (data && !data.erro) {
        const novasHoras = data.horas || [];
        const novasFolgas = data.folgas || [];

        setHoursData(novasHoras);
        setFolgasData(novasFolgas);

        await setDoc(doc(db, "settings", "dados_planilhas"), {
          horas: novasHoras,
          folgas: novasFolgas,
          ultimaAtualizacao: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error("Erro na sincronização em segundo plano:", e);
    } finally {
      if (isManual) setLoadingHours(false);
    }
  };
  
  const fetchSheetData = async (forceRefresh = false) => {
    if (!forceRefresh && (hoursData.length > 0 || folgasData.length > 0)) {
      backgroundSyncSheet(false);
      return;
    }

    if (!forceRefresh) {
      try {
        const docSnap = await getDoc(doc(db, "settings", "dados_planilhas"));
        if (docSnap.exists()) {
          const cacheData = docSnap.data();
          if (cacheData.horas && cacheData.horas.length > 0) {
            setHoursData(cacheData.horas);
            setFolgasData(cacheData.folgas || []);
            backgroundSyncSheet(false);
            return;
          }
        }
      } catch (e) {
        console.error("Erro ao ler cache do Firebase:", e);
      }
    }

    await backgroundSyncSheet(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (['CONTROLE_HORAS', 'ESCALA_FOLGAS'].includes(activeTab)) {
      fetchSheetData(false);
    }
  }, [activeTab]);

  const parseDateDM = (dateStr) => {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('/');
    if (parts.length !== 2) return new Date(0);
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, m - 1, d);
  };

  const getFutureFolgas = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return folgasData.filter(f => {
      const rowDate = parseDateDM(f.data);
      return rowDate >= today;
    });
  };

  const futureFolgas = getFutureFolgas();

  const getSubCategories = () => {
    if (!['GRÁFICA', 'CARIMBO', 'SERVIÇOS'].includes(activeTab)) return [];
    return [...new Set(products.filter(item => item.category?.toUpperCase().includes(activeTab)).map(item => item.subCategory).filter(Boolean))];
  };

  const getProductTypes = () => {
    if (!selectedSubCategory) return [];
    return [...new Set(products.filter(item => item.category?.toUpperCase().includes(activeTab) && item.subCategory?.toUpperCase() === selectedSubCategory.toUpperCase()).map(item => item.name).filter(Boolean))];
  };

  const getFinalProducts = () => {
    const normSearch = normalizeStr(searchTerm);
    return products.filter(item => {
      const matchesCategory = item.category?.toUpperCase().includes(activeTab);
      const isGlobalSearch = ['CARIMBO', 'SERVIÇOS'].includes(activeTab) && !selectedSubCategory;
      let matchesSubCat = true;
      let matchesType = true;

      if (!isGlobalSearch) {
        matchesSubCat = normalizeStr(item.subCategory) === normalizeStr(selectedSubCategory);
        matchesType = ['CARIMBO', 'SERVIÇOS'].includes(activeTab) || selectedProductType === 'TODOS' 
          ? true 
          : normalizeStr(item.name) === normalizeStr(selectedProductType);
      }
      
      const matchesSearch = 
        !normSearch ||
        normalizeStr(item.id).includes(normSearch) ||
        normalizeStr(item.name).includes(normSearch) ||
        normalizeStr(item.measure).includes(normSearch) ||
        normalizeStr(item.description).includes(normSearch);

      return matchesCategory && matchesSubCat && matchesType && matchesSearch;
    });
  };

  const isPanfletoOrSimilarSubCategory = () => {
    const sub = normalizeStr(selectedSubCategory);
    return sub.includes("PANFLETO") || sub.includes("SANTINHO") || sub.includes("CRACHA") || sub.includes("CRACHÁ");
  };

  const getProcessedGraficaProducts = () => {
    const rawList = getFinalProducts();
    if (!isPanfletoOrSimilarSubCategory()) return { type: 'normal', list: rawList };

    const grouped = {};
    rawList.forEach(item => {
      const pType = normalizeStr(item.printType);
      const isFrenteVerso = pType.includes("VERSO") || pType.includes("FRENTE / VERSO") || pType.includes("FRENTE E VERSO");
      
      const baseKey = `${item.quantity || '0'}_${item.measure || '0'}_${item.name || ''}`;
      
      if (!grouped[baseKey]) {
        grouped[baseKey] = {
          id: item.id,
          subCategory: item.subCategory,
          name: item.name,
          quantity: item.quantity,
          measure: item.measure,
          description: item.description,
          deadline: item.deadline,
          priceFrente: 0,
          priceVerso: 0
        };
      }

      if (isFrenteVerso) {
        grouped[baseKey].priceVerso = item.price;
      } else {
        grouped[baseKey].priceFrente = item.price;
        grouped[baseKey].id = item.id;
        grouped[baseKey].description = item.description;
        grouped[baseKey].deadline = item.deadline;
      }
    });

    return { type: 'panfleto', list: Object.values(grouped) };
  };

  const getFinalSuppliers = () => {
    const normSearch = normalizeStr(searchTerm);
    return suppliers.filter(s => {
      return !normSearch || 
        normalizeStr(s.fornecedor).includes(normSearch) || 
        normalizeStr(s.vendedor).includes(normSearch) || 
        normalizeStr(s.contatos).includes(normSearch);
    });
  };

  const displaySubCats = getSubCategories().filter(sub => normalizeStr(sub).includes(normalizeStr(searchTerm)));
  const displayTypes = getProductTypes().filter(type => normalizeStr(type).includes(normalizeStr(searchTerm)));

  const normSearchGlobal = normalizeStr(searchTerm);
  
  const globalMatchingSubCats = normSearchGlobal 
    ? products
        .filter(item => normalizeStr(item.subCategory).includes(normSearchGlobal) || normalizeStr(item.name).includes(normSearchGlobal))
        .map(item => item.subCategory)
        .filter((sub, idx, arr) => sub && arr.indexOf(sub) === idx)
    : [];

  const globalMatchingStamps = normSearchGlobal
    ? products.filter(item => 
        normalizeStr(item.category).includes('CARIMBO') && 
        (
          normalizeStr(item.id).includes(normSearchGlobal) || 
          normalizeStr(item.measure).includes(normSearchGlobal) ||
          normalizeStr(item.name).includes(normSearchGlobal) ||
          normalizeStr(item.subCategory).includes(normSearchGlobal)
        )
      )
    : [];

  const handleGoHome = () => {
    triggerAnimation();
    setActiveTab('HOME');
    setSelectedSubCategory(null);
    setSelectedProductType(null);
    setSearchTerm('');
    setUploadStatus('');
    setIsExtrasOpen(false);
    setMobileMenuOpen(false);
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      triggerAnimation();
      setActiveTab('ADMIN');
      setSelectedSubCategory(null);
      setSelectedProductType(null);
      setSearchTerm('');
      setIsExtrasOpen(false);
      setMobileMenuOpen(false);
    } else {
      setShowAdminModal(true);
      setPasswordError('');
      setAdminPassword('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogin = () => {
    if (adminPassword === '100418') {
      setIsAdmin(true);
      setShowAdminModal(false);
      triggerAnimation();
      setActiveTab('ADMIN');
      setSelectedSubCategory(null);
      setSelectedProductType(null);
      setSearchTerm('');
      setIsExtrasOpen(false);
    } else {
      setPasswordError('Senha incorreta. Tente novamente.');
    }
  };

  const getHourTagClass = (horasStr) => {
    if (!horasStr || horasStr === '0' || horasStr === '0:00' || horasStr === '00:00') {
      return 'bg-slate-200 text-slate-500 border-slate-300 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30'; 
    }
    if (horasStr.includes('-')) {
      return 'bg-red-100 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30'; 
    }
    return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'; 
  };

  const parseCSVLine = (line) => {
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

  const handleProductUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setLoadingUpload(true);
        setUploadStatus('Processando Produtos...');
        const text = event.target.result;
        const lines = text.split('\n');
        
        const parseMoney = (val) => {
          if (!val) return 0;
          let clean = String(val).replace(/"/g, '').toUpperCase().replace('R$', '').trim();
          if (clean === '' || clean === '-') return 0;
          clean = clean.replace(/\./g, '').replace(',', '.'); 
          return isNaN(Number(clean)) ? 0 : Number(clean);
        };

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cols = parseCSVLine(line);
          const rawId = cols[0]?.trim();
          
          if (rawId) {
            const safeId = rawId.replace(/\//g, '_');
            const productData = {
              id: safeId,
              originalId: rawId,
              category: cols[1]?.trim() || '',
              subCategory: cols[2]?.trim() || '',
              name: cols[3]?.trim() || '',
              quantity: cols[4]?.trim() || '',
              measure: cols[5]?.trim() || '', 
              description: cols[6]?.trim() || '',
              calcType: cols[7]?.trim() || 'Fixo',
              price: parseMoney(cols[12]) || parseMoney(cols[8]), 
              borrachaPrice: parseMoney(cols[10]), 
              almofadaPrice: parseMoney(cols[11]), 
              priceN: parseMoney(cols[13]), 
              priceO: parseMoney(cols[14]), 
              priceP: parseMoney(cols[15]), 
              deadline: cols[17]?.trim() || '',
              order: Number(cols[18]?.trim()) || i,
              printType: cols[19]?.trim() || '' 
            };
            await setDoc(doc(db, "products", safeId), productData);
          }
        }
        setUploadStatus('✅ Produtos atualizados com sucesso!');
        fetchData();
      } catch (err) {
        console.error(err);
        setUploadStatus('❌ Erro: ' + err.message);
      } finally {
        setLoadingUpload(false);
      }
    };
    reader.readAsText(file);
  };

  const handleSupplierUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setLoadingUpload(true);
        setUploadStatus('Processando Fornecedores...');
        const text = event.target.result;
        const lines = text.split('\n');

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cols = parseCSVLine(line);
          const fornecedorNome = cols[0]?.trim();
          
          if (fornecedorNome) {
            const safeId = fornecedorNome.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
            const contato1 = cols[6]?.trim() || '';
            const contato2 = cols[7]?.trim() || '';
            const contatosArr = [contato1, contato2].filter(Boolean);

            const supData = {
              fornecedor: fornecedorNome,
              vendedor: cols[1]?.trim() || '-',
              pedidoMinimo: cols[2]?.trim() || '-',
              estoque: cols[3]?.trim() || '-',
              prazo: cols[4]?.trim() || '-',
              desconto: cols[5]?.trim() || '-',
              contatos: contatosArr.join(' | ')
            };
            await setDoc(doc(db, "suppliers", safeId), supData);
          }
        }
        setUploadStatus('✅ Fornecedores atualizados com sucesso!');
        fetchData();
      } catch (err) {
        console.error(err);
        setUploadStatus('❌ Erro: ' + err.message);
      } finally {
        setLoadingUpload(false);
      }
    };
    reader.readAsText(file);
  };

  const renderAcabamentosExtras = () => {
    if (activeTab !== 'GRÁFICA') return null;

    const sub = normalizeStr(selectedSubCategory || '');
    const type = normalizeStr(selectedProductType || '');
    
    const isImg1 = sub === 'MARCA PAGINA' || type.includes('COUCHE 250G') || type.includes('HOT STAMP');
    const isImg2 = type.includes('VERNIZ LOCALIZADO');
    const isImg3 = sub.includes('BLOCO SIMPLES');
    const isImg4 = sub.includes('TALAO SIMPLES');
    const isImg5 = sub === 'TAG';
    const isImg6 = sub.includes('TALAO AUTO');

    let config = null;
    if (isImg2) config = 'IMG2'; 
    else if (isImg1) config = 'IMG1';
    else if (isImg3) config = 'IMG3';
    else if (isImg4) config = 'IMG4';
    else if (isImg5) config = 'IMG5';
    else if (isImg6) config = 'IMG6';

    if (!config) return null;

    return (
      <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#1e293b] rounded-xl p-6 shadow-sm mb-6 animate-fade-in-up transition-colors">
        <div 
          onClick={() => setIsExtrasOpen(!isExtrasOpen)}
          className="flex items-center justify-between cursor-pointer group"
        >
          <div className="flex flex-col gap-1.5">
              <h4 className="text-[14px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 transition-colors">
                <Info className="w-4 h-4" />
                Acabamentos Extras
              </h4>
              {config === 'IMG2' && (
                <p className="text-[11.5px] text-amber-600 dark:text-amber-400/90 font-semibold ml-6">
                  * Observação: Estes acabamentos são possíveis apenas para o modelo FRENTE / VERSO.
                </p>
              )}
          </div>
          <div className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors p-2 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10">
              {isExtrasOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        {isExtrasOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-[#1e293b] animate-fade-in-up transition-colors">
             {config === 'IMG1' && (
               <>
                 <ExtraCard icon={Circle} title="Furo 4mm -" price="R$ 30,00" />
                 <ExtraCard icon={Crop} title="Refile menor -" price="R$ 20,00" subtitle="Medidas mínimas: 38×30mm" />
                 <ExtraCard icon={Clock} title="Adicionar +2 dias no prazo final" />
               </>
             )}
             {config === 'IMG2' && (
               <>
                 <ExtraCard icon={Circle} title="Furo 4mm -" price="R$ 30,00" />
                 <ExtraCard icon={Maximize} title="2 cantos arredondados -" price="R$ 25,00" />
                 <ExtraCard icon={Maximize} title="4 cantos arredondados -" price="R$ 25,00" />
                 <ExtraCard icon={Crop} title="Refile menor -" price="R$ 20,00" subtitle="Medidas mínimas: 38×30mm" />
                 <ExtraCard icon={Clock} title="Adicionar +2 dias no prazo final" />
               </>
             )}
             {config === 'IMG3' && (
               <>
                 <ExtraCard icon={Layers} title="2 vias -" price="+20% no valor total" />
                 <ExtraCard icon={FileText} title="Impressão Frente e Verso -" price="+30% no valor total" />
               </>
             )}
             {config === 'IMG4' && (
               <>
                 <ExtraCard icon={Layers} title="2 vias" subtitle="Acabamento incluso" />
                 <ExtraCard icon={Hash} title="Numeração" subtitle="Acabamento incluso" />
                 <ExtraCard icon={FileText} title="Impressão Frente e Verso -" price="+30% no valor total" />
               </>
             )}
             {config === 'IMG5' && (
               <>
                 <ExtraCard icon={Circle} title="Furo 4mm" subtitle="Acabamento incluso" />
               </>
             )}
             {config === 'IMG6' && (
               <>
                 <ExtraCard icon={Layers} title="2 vias" subtitle="Acabamento incluso" />
                 <ExtraCard icon={Hash} title="Numeração" subtitle="Acabamento incluso" />
                 <ExtraCard icon={SquareDashed} title="Serrilha" subtitle="Acabamento incluso" />
                 <ExtraCard icon={Clipboard} title="Grampo" subtitle="Acabamento incluso" />
                 <ExtraCard icon={Crop} title="Refile menor -" price="R$ 25,00" subtitle="Medidas mínimas: 38×30mm" />
               </>
             )}
          </div>
        )}
      </div>
    );
  };

  const currentViewKey = `${activeTab}-${selectedSubCategory || 'none'}-${selectedProductType || 'none'}-${searchTerm}`;
  
  const isGlobalSearch = ['CARIMBO', 'SERVIÇOS'].includes(activeTab) && !selectedSubCategory && normSearchGlobal !== '';
  const isMadeira = activeTab === 'CARIMBO' && selectedSubCategory?.toUpperCase().includes('MADEIRA') && !isGlobalSearch;
  const isAutomatico = activeTab === 'CARIMBO' && !isMadeira;
  
  const isCopiaImpressao = activeTab === 'SERVIÇOS' && ['COPIA', 'IMPRESSÃO P/B', 'IMPRESSÃO PB', 'IMPRESSÃO COLORIDA'].includes(selectedSubCategory?.toUpperCase());
  const isCapa = activeTab === 'SERVIÇOS' && ['CAPA', 'CONTRA CAPA', 'CAPA E CONTRA CAPA', 'CAPA E CONTRA-CAPA', 'CAPA & CONTRA CAPA'].includes(selectedSubCategory?.toUpperCase());
  const isEspiral = activeTab === 'SERVIÇOS' && ['ESPIRAL'].includes(selectedSubCategory?.toUpperCase());
  const isPlastificacao = activeTab === 'SERVIÇOS' && ['PLASTIFICAÇÃO', 'POLASEAL', 'PLASTIFICAÇÃO E POLASEAL', 'PLASTIFICAÇÃO & POLASEAL'].includes(selectedSubCategory?.toUpperCase());

 const SidebarButton = ({ id, label, icon, onClick, isLock }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={onClick || (() => { 
          triggerAnimation(); 
          setActiveTab(id); 
          setSelectedSubCategory(null); 
          setSelectedProductType(null); 
          setSearchTerm(''); 
          setUploadStatus(''); 
          setIsExtrasOpen(false);
          setMobileMenuOpen(false);
        })}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          isActive 
            ? 'bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-white border border-blue-200 dark:border-blue-500/40 shadow-[0_0_15px_rgba(37,99,235,0.15)]' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#162032] border border-transparent'
        }`}
      >
        <span className={`text-lg ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>{icon}</span>
        <span className={isActive ? 'text-slate-900 dark:text-white font-bold' : ''}>{label}</span>
        
        {isLock && !isAdmin && (
          <span className="ml-auto text-slate-400 dark:text-slate-500">
            <Lock className="w-3.5 h-3.5" />
          </span>
        )}
        
        {isLock && isAdmin && (
          <span className="ml-auto text-emerald-600 dark:text-emerald-400">
            <Unlock className="w-3.5 h-3.5" />
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen font-sans selection:bg-blue-600 selection:text-white overflow-hidden relative">
      
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#1e293b] rounded-2xl p-8 max-w-md w-full shadow-2xl page-transition relative my-auto">
            <button onClick={() => { setModalOpen(false); setSelectedFile(null); setUploadMsg(''); }} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wide">Envio: {selectedTarget?.name}</h3>
            
            <label className="border-2 border-dashed border-slate-300 dark:border-[#27354f] hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-[#0b0e14] transition-colors mb-4 group">
              <Upload className="w-10 h-10 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 mb-3 transition-colors" />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 text-center">Clique para selecionar ou arraste o arquivo</span>
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>

            <div className="text-center text-xs text-blue-600 dark:text-blue-400 font-semibold mb-6 truncate">
              {selectedFile ? `Selecionado: ${selectedFile.name}` : 'Nenhum arquivo selecionado'}
            </div>

            <button 
              onClick={handleSendFile} 
              disabled={!selectedFile || uploading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide transition-colors cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
              {uploading ? 'Enviando...' : 'Enviar'}
            </button>

            {uploadMsg && <p className="text-center text-xs font-semibold mt-4 text-slate-600 dark:text-slate-300">{uploadMsg}</p>}

            {selectedTarget && uploadHistory[selectedTarget.folderId] && uploadHistory[selectedTarget.folderId].length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-[#1e293b]">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Últimos Arquivos Enviados:</div>
                <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                  {uploadHistory[selectedTarget.folderId].map((hist, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]" title={hist.nome}>
                        📄 {hist.nome}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                        {hist.data} às {hist.hora}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-all"
        title="Menu"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)} 
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 transition-opacity"
        ></div>
      )}

      <div className="flex w-full h-full bg-slate-200 text-slate-800 dark:bg-[#0b0e14] dark:text-slate-100 transition-colors duration-300">
      <style>{`
        .page-transition { animation: slideFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideFade { 0% { opacity: 0; transform: translateY(15px) scale(0.99); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .dark ::-webkit-scrollbar-thumb { background: #1e293b; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark ::-webkit-scrollbar-thumb:hover { background: #334155; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>

      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-[#0b0e14]/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#1e293b] rounded-2xl p-8 max-w-sm w-full shadow-2xl page-transition">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-500 mb-6 mx-auto text-2xl">🔒</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">Acesso Restrito</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">Digite a senha para acessar o painel de administração e uploads.</p>
            <input type="password" placeholder="••••••" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className="w-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-300 dark:border-[#1e293b] rounded-xl px-4 py-3 text-center text-slate-900 dark:text-white tracking-widest focus:outline-none focus:border-blue-500 mb-2 transition-colors" autoFocus />
            {passwordError && <p className="text-red-500 dark:text-red-400 text-xs text-center mb-4 font-medium">{passwordError}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdminModal(false)} className="flex-1 py-3 rounded-xl bg-transparent border border-slate-300 dark:border-[#1e293b] text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-[#1e293b] font-semibold transition-colors cursor-pointer text-sm">Cancelar</button>
              <button onClick={handleLogin} className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors cursor-pointer shadow-lg shadow-blue-500/20 text-sm">Acessar</button>
            </div>
          </div>
        </div>
      )}

      <aside className={`fixed md:static inset-y-0 left-0 w-64 flex-shrink-0 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-[#101726] dark:via-[#0d131f] dark:to-[#090d16] border-r border-slate-200 dark:border-[#1e293b]/80 flex flex-col h-full z-40 shadow-2xl transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        <div onClick={handleGoHome} className="p-6 flex items-center gap-3 cursor-pointer group border-b border-slate-200 dark:border-[#1e293b]/60">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
            <img 
              src="cabec.svg" 
              alt="Logo" 
              className="w-full h-full object-contain" 
              style={{ filter: 'invert(37%) sepia(87%) saturate(1832%) hue-rotate(202deg) brightness(97%) contrast(101%)' }}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[17px] font-black text-slate-900 dark:text-white tracking-wide">YAMA PRINT</h1>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold">TABELA DE PREÇO</p>
          </div>
        </div>

         <nav className="flex-1 p-4 flex flex-col justify-between overflow-y-auto">
          <div className="flex flex-col gap-2">
            
            <div className="relative w-full mb-3">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Filtrar produtos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value.trim() !== '') {
                    setActiveTab('HOME');
                    setSelectedSubCategory(null);
                    setSelectedProductType(null);
                  }
                }}
                className="w-full h-10 bg-slate-100 dark:bg-[#131b2c] text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-[#1e2a40] rounded-xl pl-9 pr-7 text-[12.5px] font-medium placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors shadow-inner"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <SidebarButton icon={<Home className="w-5 h-5" />} id="HOME" label="Início" onClick={handleGoHome}/>
            
            <div className="my-3 border-t border-slate-200 dark:border-[#1e293b]"></div>

            <SidebarButton icon={<Search className="w-5 h-5" />} id="CONSULTAS" label="Consultas Rápidas"/>
            <SidebarButton icon={<Package className="w-5 h-5" />} id="FORNECEDORES" label="Fornecedores"/>
            <SidebarButton icon={<Clock className="w-5 h-5" />} id="CONTROLE_HORAS" label="Controle de Horas"/>
            <SidebarButton icon={<CalendarDays className="w-5 h-5" />} id="ESCALA_FOLGAS" label="Escala de Folgas"/>
            <SidebarButton icon={<Download className="w-5 h-5" />} id="DOWNLOADS" label="Downloads"/>
            <SidebarButton icon={<Upload className="w-5 h-5" />} id="UPLOADS" label="Uploads"/>
          </div>
          
          <div className="pt-4 flex flex-col gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#162032] transition-all cursor-pointer border border-transparent"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg text-slate-500 dark:text-slate-400">
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </span>
                <span>Modo Escuro</span>
              </div>
              <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
            </button>

            <SidebarButton icon={<Cog className="w-5 h-5" />} id="ADMIN" isLock={true} label="Administrador" onClick={handleAdminClick}/>
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen relative scroll-smooth overflow-y-auto w-full">
        <div className="max-w-[1200px] mx-auto w-full p-4 md:p-6 flex flex-col flex-1 justify-between gap-8">
          
          <div className="flex flex-col gap-6">
            
            <div className="sticky top-0 z-30 flex flex-col gap-2 bg-slate-200 dark:bg-[#0b0e14] py-2 transition-all">
              
              <div className="flex items-center flex-wrap gap-2 text-[13px] font-semibold bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#1e293b] px-4 md:px-5 py-3.5 rounded-xl w-full shadow-sm transition-colors">
                <button onClick={handleGoHome} className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors flex items-center gap-2 cursor-pointer">INÍCIO</button>
                
                {activeTab !== 'HOME' && (
                  <>
                    <span className="text-slate-400 dark:text-slate-700 font-normal">/</span>
                    <button onClick={() => { triggerAnimation(); setSelectedSubCategory(null); setSelectedProductType(null); setSearchTerm(''); setIsExtrasOpen(false); }} className={`uppercase tracking-wider transition-colors cursor-pointer ${!selectedSubCategory ? 'text-slate-800 dark:text-slate-200' : 'text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400'}`}>
                      {activeTab === 'ADMIN' ? 'Administrador' : activeTab.replace('_', ' ')}
                    </button>
                  </>
                )}

                {selectedSubCategory && (
                  <>
                    <span className="text-slate-400 dark:text-slate-700 font-normal">/</span>
                    <button onClick={() => { 
                      if (activeTab === 'GRÁFICA') { 
                        const isBypass = BYPASS_TYPE_SUBCATS.includes(normalizeStr(selectedSubCategory));
                        const hasTypes = products.some(p => p.category?.toUpperCase().includes('GRÁFICA') && p.subCategory?.toUpperCase() === selectedSubCategory.toUpperCase() && p.name?.trim() !== '');
                        if(hasTypes && !isBypass){
                          triggerAnimation(); 
                          setSelectedProductType(null); 
                          setSearchTerm(''); 
                          setIsExtrasOpen(false);
                        }
                      } 
                    }} className={`uppercase tracking-wider transition-colors ${!selectedProductType || selectedProductType === 'TODOS' || ['CARIMBO', 'SERVIÇOS'].includes(activeTab) ? 'text-slate-800 dark:text-slate-200' : 'text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer'}`}>
                      {selectedSubCategory}
                    </button>
                  </>
                )}

                {selectedProductType && selectedProductType !== 'TODOS' && activeTab === 'GRÁFICA' && (
                  <>
                    <span className="text-slate-400 dark:text-slate-700 font-normal">/</span>
                    <span className="text-slate-800 dark:text-slate-200 uppercase tracking-wider">{selectedProductType}</span>
                  </>
                )}
              </div>

              {activeTab === 'FORNECEDORES' && (
                <div className="flex items-center gap-3 w-full">
                  <div className="relative flex-1 h-[46px]">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar fornecedor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-full bg-white dark:bg-[#121826] border border-slate-300 dark:border-[#1e293b] rounded-xl pl-11 pr-4 text-[13px] font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                    />
                  </div>
                </div>
              )}

            </div>

            {loading ? (
              <div className="flex justify-center items-center py-32">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div key={currentViewKey} className="page-transition">
                
               {activeTab === 'HOME' && (
                  <div className="flex flex-col gap-8">
                    {normSearchGlobal !== '' ? (
                      globalMatchingSubCats.length === 0 && globalMatchingStamps.length === 0 ? (
                        <div className="flex flex-col gap-4">
                          <div className="col-span-full py-12 text-center text-slate-500 font-medium text-sm">Nenhum resultado encontrado para "{searchTerm}".</div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-10">
                          {globalMatchingSubCats.length > 0 && (
                            <div className="flex flex-col gap-4 animate-fade-in-up">
                              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">Subcategorias Encontradas:</div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {globalMatchingSubCats.map(subCat => {
                                  const matchProd = products.find(p => p.subCategory === subCat);
                                  const parentCat = matchProd ? (matchProd.category?.toUpperCase().includes('CARIMBO') ? 'CARIMBO' : matchProd.category?.toUpperCase().includes('SERVIÇOS') ? 'SERVIÇOS' : 'GRÁFICA') : 'GRÁFICA';
                                  
                                  return (
                                    <div 
                                      key={subCat} 
                                      onClick={() => { 
                                        triggerAnimation(); 
                                        setActiveTab(parentCat); 
                                        setSelectedSubCategory(subCat); 
                                        setSearchTerm(''); 
                                        setIsExtrasOpen(false);
                                        const isBypass = BYPASS_TYPE_SUBCATS.includes(normalizeStr(subCat));
                                        const hasTypes = products.some(p => p.category?.toUpperCase().includes(parentCat) && p.subCategory === subCat && p.name?.trim() !== '');
                                        if (['CARIMBO', 'SERVIÇOS'].includes(parentCat) || !hasTypes || isBypass) {
                                          setSelectedProductType('TODOS');
                                        } else {
                                          setSelectedProductType(null);
                                        }
                                      }} 
                                      className="relative w-full cursor-pointer group rounded-xl p-[2px] transition-all duration-500 hover:scale-[1.02]"
                                    >
                                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover:opacity-75 blur-md transition-all duration-500 -z-10"></div>
                                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 opacity-0 group-hover:opacity-75 transition-all duration-500 -z-10"></div>
                                      <div className="w-full h-full bg-white dark:bg-[#121826] group-hover:bg-slate-50 dark:group-hover:bg-[#0b0e14] border border-slate-200 dark:border-[#1e293b] group-hover:border-transparent rounded-xl flex items-center justify-center p-6 min-h-[80px] transition-colors duration-300 relative z-10">
                                        <h3 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white uppercase tracking-widest text-center transition-colors">{subCat}</h3>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {globalMatchingStamps.length > 0 && (
                            <div className="flex flex-col gap-4 animate-fade-in-up">
                              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">Resultados na Lista de Carimbos:</div>
                              <div className="bg-white dark:bg-gradient-to-b dark:from-[#101726] dark:via-[#0d131f] dark:to-[#090d16] border border-slate-200 dark:border-[#1e293b]/80 rounded-2xl overflow-hidden shadow-2xl">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-slate-100 dark:bg-[#162032]/80 border-b border-slate-200 dark:border-[#1e293b] text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                                        <th className="px-6 py-5 w-24">ID</th>
                                        <th className="px-6 py-5 min-w-[240px]">Variação</th>
                                        <th className="px-6 py-5">Medida</th>
                                        <th className="px-6 py-5 text-right">Borracha</th>
                                        <th className="px-6 py-5 text-right">Almofada</th>
                                        <th className="px-6 py-5 text-right">Completo</th>
                                      </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                      {globalMatchingStamps.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-[#1a2333] transition-colors border-b border-slate-200 dark:border-[#1e293b]/50 last:border-0">
                                          <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-500 text-xs">{product.id}</td>
                                          <td className="px-6 py-4 font-extrabold text-slate-800 dark:text-slate-200 uppercase min-w-[240px]">{product.name}</td>
                                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium text-[13px]">{product.measure || '-'}</td>
                                          <td className="px-6 py-4 text-right align-middle">
                                            {product.borrachaPrice > 0 ? (
                                              <span className="text-blue-600 dark:text-blue-400 font-black text-[17px] block bg-blue-50 dark:bg-blue-500/10 px-2 py-2 rounded-lg ml-auto w-[120px] text-center border border-blue-200 dark:border-blue-500/40 tracking-wide whitespace-nowrap">{formatPrice(product.borrachaPrice)}</span>
                                            ) : <span className="text-slate-400">-</span>}
                                          </td>
                                          <td className="px-6 py-4 text-right align-middle">
                                            {product.almofadaPrice > 0 ? (
                                              <span className="text-amber-600 dark:text-amber-400 font-black text-[17px] block bg-amber-50 dark:bg-amber-500/10 px-2 py-2 rounded-lg ml-auto w-[120px] text-center border border-amber-200 dark:border-amber-500/40 tracking-wide whitespace-nowrap">{formatPrice(product.almofadaPrice)}</span>
                                            ) : <span className="text-slate-400">-</span>}
                                          </td>
                                          <td className="px-6 py-4 text-right align-middle">
                                            <span className="text-emerald-600 dark:text-emerald-400 font-black text-[17px] block bg-emerald-50 dark:bg-emerald-500/10 px-2 py-2 rounded-lg ml-auto w-[120px] text-center border border-emerald-200 dark:border-emerald-500/40 tracking-wide whitespace-nowrap">{formatPrice(product.price)}</span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-6">
                          {[
                            { id: 'GRÁFICA', title: 'Gráfica', desc: 'Impressos em geral', icon: adsSvg },
                            { id: 'CARIMBO', title: 'Carimbos', desc: 'Automáticos e Madeira', icon: crbSvg },
                            { id: 'SERVIÇOS', title: 'Serviços', desc: 'Cópias e Encadernação', icon: prtSvg }
                          ].map(card => (
                            <div 
                              key={card.id} 
                              onClick={() => { triggerAnimation(); setActiveTab(card.id); setIsExtrasOpen(false); }} 
                              className="relative w-full h-[260px] cursor-pointer group rounded-2xl p-[2px] transition-all duration-500 hover:scale-[1.02]"
                            >
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover:opacity-75 blur-md transition-all duration-500 -z-10"></div>
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-400 opacity-0 group-hover:opacity-75 transition-all duration-500 -z-10"></div>

                              <div className="w-full h-full bg-white dark:bg-[#121826] group-hover:bg-slate-50 dark:group-hover:bg-[#0b0e14] border border-slate-200 dark:border-[#1e293b] rounded-2xl flex flex-col justify-center items-center text-center p-6 transition-colors duration-300 shadow-2xl relative z-10">
                                <div className="w-20 h-20 mb-4 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                                  <img 
                                    src={card.icon} 
                                    alt={card.title} 
                                    className={`w-20 h-20 object-contain filter transition-all duration-500 group-hover:drop-shadow-[0_0_10px_rgba(52,211,153,0.6)] ${theme === 'dark' ? 'brightness-0 invert' : ''}`} 
                                  />
                                </div>

                                <h3 className="text-[22px] font-black text-slate-900 dark:text-white mb-1 tracking-tight transition-transform duration-300 group-hover:translate-y-[-2px]">{card.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{card.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Calculadoras Rápidas de Balcão limpas (sem tags de faixas) */}
                        <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#1e293b] p-6 rounded-2xl shadow-xl flex flex-col gap-6 mx-6">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e293b] pb-4">
                            <div>
                              <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                                Calculadoras Rápidas de Balcão
                              </h2>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Orçamento instantâneo para atendimento rápido ao cliente
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Calculadora 1: Cópia */}
                            {(() => {
                              const p = calcCopiaQtd <= 10 ? 0.50 : calcCopiaQtd <= 50 ? 0.45 : calcCopiaQtd <= 199 ? 0.40 : 0.35;
                              const total = calcCopiaQtd * p;
                              const tiers = [10, 50, 199];
                              const nextT = tiers.find(t => calcCopiaQtd <= t);
                              const faltam = nextT ? (nextT + 1) - calcCopiaQtd : null;

                              return (
                                <div className="bg-slate-50 dark:bg-[#1a2234] border border-slate-200 dark:border-[#26334d] p-4 rounded-xl flex flex-col justify-between gap-3">
                                  <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                        Cópia Simples
                                      </span>
                                      {calcCopiaQtd > 0 && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-bold">{formatPrice(p)}/un</span>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <input 
                                        type="number" 
                                        placeholder="Qtd de páginas" 
                                        value={calcCopiaQtd || ''}
                                        onChange={(e) => setCalcCopiaQtd(Math.max(0, Number(e.target.value)))}
                                        className="w-full bg-white dark:bg-[#121826] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                                      />
                                    </div>
                                    <div className="h-5">
                                      {calcCopiaQtd > 0 && faltam && (
                                        <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                          Faltam {faltam} unid para o valor baixar!
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                                    <span className="text-slate-500 dark:text-slate-400">Total Estimado:</span>
                                    <span className="font-bold text-sm text-slate-900 dark:text-white">{formatPrice(total)}</span>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Calculadora 2: Impressão P&B */}
                            {(() => {
                              const p = calcPbQtd <= 10 ? 0.90 : calcPbQtd <= 20 ? 0.75 : calcPbQtd <= 30 ? 0.60 : calcPbQtd <= 80 ? 0.50 : calcPbQtd <= 199 ? 0.40 : 0.30;
                              const total = calcPbQtd * p;
                              const tiers = [10, 20, 30, 80, 199];
                              const nextT = tiers.find(t => calcPbQtd <= t);
                              const faltam = nextT ? (nextT + 1) - calcPbQtd : null;

                              return (
                                <div className="bg-slate-50 dark:bg-[#1a2234] border border-slate-200 dark:border-[#26334d] p-4 rounded-xl flex flex-col justify-between gap-3">
                                  <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                        Impressão P&B
                                      </span>
                                      {calcPbQtd > 0 && <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">{formatPrice(p)}/un</span>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <input 
                                        type="number" 
                                        placeholder="Qtd de páginas" 
                                        value={calcPbQtd || ''}
                                        onChange={(e) => setCalcPbQtd(Math.max(0, Number(e.target.value)))}
                                        className="w-full bg-white dark:bg-[#121826] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                                      />
                                    </div>
                                    <div className="h-5">
                                      {calcPbQtd > 0 && faltam && (
                                        <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                          Faltam {faltam} unid para o valor baixar!
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                                    <span className="text-slate-500 dark:text-slate-400">Total Estimado:</span>
                                    <span className="font-bold text-sm text-slate-900 dark:text-white">{formatPrice(total)}</span>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Calculadora 3: Impressão Colorida */}
                            {(() => {
                              const p = calcColorQtd <= 10 ? 1.70 : calcColorQtd <= 20 ? 1.50 : calcColorQtd <= 50 ? 1.40 : 1.30;
                              const total = calcColorQtd * p;
                              const tiers = [10, 20, 50];
                              const nextT = tiers.find(t => calcColorQtd <= t);
                              const faltam = nextT ? (nextT + 1) - calcColorQtd : null;

                              return (
                                <div className="bg-slate-50 dark:bg-[#1a2234] border border-slate-200 dark:border-[#26334d] p-4 rounded-xl flex flex-col justify-between gap-3">
                                  <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                        Impressão Colorida
                                      </span>
                                      {calcColorQtd > 0 && <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded font-bold">{formatPrice(p)}/un</span>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <input 
                                        type="number" 
                                        placeholder="Qtd de páginas" 
                                        value={calcColorQtd || ''}
                                        onChange={(e) => setCalcColorQtd(Math.max(0, Number(e.target.value)))}
                                        className="w-full bg-white dark:bg-[#121826] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
                                      />
                                    </div>
                                    <div className="h-5">
                                      {calcColorQtd > 0 && faltam && (
                                        <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                          Faltam {faltam} unid para o valor baixar!
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                                    <span className="text-slate-500 dark:text-slate-400">Total Estimado:</span>
                                    <span className="font-bold text-sm text-slate-900 dark:text-white">{formatPrice(total)}</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {['GRÁFICA', 'CARIMBO', 'SERVIÇOS'].includes(activeTab) && !selectedSubCategory && normSearchGlobal === '' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {displaySubCats.length > 0 ? displaySubCats.map(subCat => (
                    <div 
                      key={subCat} 
                      onClick={() => { 
                        triggerAnimation(); 
                        setSelectedSubCategory(subCat); 
                        setSearchTerm(''); 
                        setIsExtrasOpen(false);
                        const isBypass = BYPASS_TYPE_SUBCATS.includes(normalizeStr(subCat));
                        const hasTypes = products.some(p => p.category?.toUpperCase().includes(activeTab) && p.subCategory === subCat && p.name?.trim() !== '');
                        if (['CARIMBO', 'SERVIÇOS'].includes(activeTab) || !hasTypes || isBypass) {
                          setSelectedProductType('TODOS');
                        } else {
                          setSelectedProductType(null);
                        }
                      }} 
                      className="relative w-full cursor-pointer group rounded-xl p-[2px] transition-all duration-500 hover:scale-[1.02]"
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover:opacity-75 blur-md transition-all duration-500 -z-10"></div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 opacity-0 group-hover:opacity-75 transition-all duration-500 -z-10"></div>
                      <div className="w-full h-full bg-white dark:bg-[#121826] group-hover:bg-slate-50 dark:group-hover:bg-[#0b0e14] border border-slate-200 dark:border-[#1e293b] group-hover:border-transparent rounded-xl flex items-center justify-center p-6 min-h-[80px] transition-colors duration-300 relative z-10">
                        <h3 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white uppercase tracking-widest text-center transition-colors">{subCat}</h3>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-12 text-center text-slate-500 font-medium text-sm">Nenhum resultado encontrado.</div>
                  )}
                </div>
              )}

              {activeTab === 'GRÁFICA' && selectedSubCategory && normSearchGlobal === '' && (!selectedProductType) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {displayTypes.length > 0 ? displayTypes.map(type => (
                    <div 
                      key={type} 
                      onClick={() => { triggerAnimation(); setSelectedProductType(type); setSearchTerm(''); setIsExtrasOpen(false); }} 
                      className="relative w-full cursor-pointer group rounded-xl p-[2px] transition-all duration-500 hover:scale-[1.02]"
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover:opacity-75 blur-md transition-all duration-500 -z-10"></div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 opacity-0 group-hover:opacity-75 transition-all duration-500 -z-10"></div>
                      <div className="w-full h-full bg-white dark:bg-[#121826] group-hover:bg-slate-50 dark:group-hover:bg-[#0b0e14] border border-slate-200 dark:border-[#1e293b] group-hover:border-transparent rounded-xl flex items-center justify-center p-6 min-h-[80px] transition-colors duration-300 relative z-10">
                        <h3 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white uppercase tracking-widest text-center transition-colors">{type}</h3>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-12 text-center text-slate-500 font-medium text-sm">Nenhum resultado encontrado.</div>
                  )}
                </div>
              )}

              {((activeTab === 'GRÁFICA' && selectedSubCategory && selectedProductType) || (['CARIMBO', 'SERVIÇOS'].includes(activeTab) && selectedSubCategory)) && (
                <div className="flex flex-col gap-6">
                  
                  {renderAcabamentosExtras()}

                  {activeTab === 'SERVIÇOS' && <ServiceCalculator subCat={selectedSubCategory} formatPrice={formatPrice} />}

                  <div className={`bg-white dark:bg-gradient-to-b dark:from-[#101726] dark:via-[#0d131f] dark:to-[#090d16] border border-slate-200 dark:border-[#1e293b]/80 rounded-2xl overflow-hidden shadow-2xl ${isMadeira ? 'max-w-xl mx-auto w-full' : ''}`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-[#162032]/80 border-b border-slate-200 dark:border-[#1e293b] text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                            {activeTab === 'GRÁFICA' && (
                              isPanfletoOrSimilarSubCategory() ? (
                                <>
                                  <th className="px-6 py-5 w-24">ID</th>
                                  <th className="px-6 py-5 min-w-[200px]">Variação</th>
                                  <th className="px-6 py-5 min-w-[220px]">Especificações</th>
                                  <th className="px-6 py-5 text-center">Prazo</th>
                                  <th className="px-6 py-5 text-right">R$ FRENTE</th>
                                  <th className="px-6 py-5 text-right">R$ FRENTE / VERSO</th>
                                </>
                              ) : (
                                <>
                                  <th className="px-6 py-5 w-24">ID</th>
                                  <th className="px-6 py-5 min-w-[240px]">Variação</th>
                                  <th className="px-6 py-5 min-w-[250px]">Especificações</th>
                                  <th className="px-6 py-5 text-center">Prazo</th>
                                  <th className="px-6 py-5 text-right">Valor Total</th>
                                </>
                              )
                            )}

                            {activeTab === 'CARIMBO' && isMadeira && (
                              <>
                                <th className="px-6 py-5 w-24">ID</th>
                                <th className="px-6 py-5 min-w-[240px]">Variação</th>
                                <th className="px-6 py-5 text-right">Completo</th>
                              </>
                            )}
                            {activeTab === 'CARIMBO' && isAutomatico && (
                              <>
                                <th className="px-6 py-5 w-24">ID</th>
                                <th className="px-6 py-5 min-w-[240px]">Variação</th>
                                <th className="px-6 py-5">Medida</th>
                                <th className="px-6 py-5 text-right">Borracha</th>
                                <th className="px-6 py-5 text-right">Almofada</th>
                                <th className="px-6 py-5 text-right">Completo</th>
                              </>
                            )}

                            {activeTab === 'SERVIÇOS' && (
                              <>
                                <th className="px-6 py-5 w-24">ID</th>
                                <th className="px-6 py-5 min-w-[250px]">Variação</th>
                                {isCopiaImpressao && (
                                  <>
                                    <th className="px-6 py-5 text-right">A4</th>
                                    <th className="px-6 py-5 text-right">A3</th>
                                  </>
                                )}
                                {isCapa && (
                                  <>
                                    <th className="px-6 py-5 text-right">UN</th>
                                    <th className="px-6 py-5 text-right">PACOTE</th>
                                  </>
                                )}
                                {isEspiral && (
                                  <>
                                    <th className="px-6 py-5 text-right">Unitário</th>
                                    <th className="px-6 py-5 text-right">Pacote</th>
                                  </>
                                )}
                                {isPlastificacao && (
                                  <>
                                    <th className="px-6 py-5 text-right">Plastificação</th>
                                    <th className="px-6 py-5 text-right">Pol. Unitário</th>
                                    <th className="px-6 py-5 text-right">Pol. Pacote</th>
                                  </>
                                )}
                                {!isCopiaImpressao && !isCapa && !isEspiral && !isPlastificacao && (
                                  <th className="px-6 py-5 text-right">Valor Unit.</th>
                                )}
                              </>
                            )}
                          </tr>
                        </thead>
                        
                        <tbody className="text-sm">
                          {activeTab === 'GRÁFICA' && isPanfletoOrSimilarSubCategory() ? (
                            getProcessedGraficaProducts().list.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#1a2333] transition-colors border-b border-slate-200 dark:border-[#1e293b]/50 last:border-0">
                                <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-500 text-xs">{item.id}</td>
                                <td className="px-6 py-4">
                                  <div className="font-extrabold text-slate-800 dark:text-slate-200 mb-2 uppercase whitespace-nowrap">{item.name}</div>
                                  <div className="flex items-center gap-2 mt-1 w-max">
                                      {item.quantity && <span className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm whitespace-nowrap">Qtd: {item.quantity}</span>}
                                      {item.measure && <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm whitespace-nowrap">{item.measure}</span>}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-[13px] leading-relaxed max-w-md">{item.description || '-'}</td>
                                <td className="px-6 py-4 text-center">
                                  {item.deadline ? (
                                    <span className="mx-auto flex items-center justify-center w-fit text-slate-600 dark:text-slate-400 text-[11px] font-semibold border border-slate-300 dark:border-slate-600/50 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-full whitespace-nowrap">
                                      <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                                      {item.deadline}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="px-6 py-4 text-right align-middle">
                                  {item.priceFrente > 0 ? (
                                    <div className="flex items-center justify-end gap-2">
                                      <span className="text-emerald-600 dark:text-emerald-400 font-black text-[17px] block bg-emerald-50 dark:bg-emerald-500/10 px-2 py-2 rounded-lg ml-auto w-[110px] text-center border border-emerald-200 dark:border-emerald-500/40 tracking-wide whitespace-nowrap">
                                        {formatPrice(item.priceFrente)}
                                      </span>
                                      <button 
                                        onClick={() => copyToClipboard(`📋 *Orçamento Yama Print*\n*Produto:* ${item.subCategory}\n*Modelo:* ${item.name} (Apenas Frente)\n${item.description && item.description !== '-' ? `*Especificações:* ${item.description}\n` : ''}${item.quantity ? `*Qtd:* ${item.quantity}\n` : ''}${item.measure ? `*Medida:* ${item.measure}\n` : ''}*Prazo:* ${item.deadline || '-'}\n*Total:* ${formatPrice(item.priceFrente)}`)}
                                        className="p-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors cursor-pointer"
                                        title="Copiar Orçamento"
                                      >
                                        <Copy className="w-5 h-5" />
                                      </button>
                                    </div>
                                  ) : <span className="text-slate-400">-</span>}
                                </td>
                                <td className="px-6 py-4 text-right align-middle">
                                  {item.priceVerso > 0 ? (
                                    <div className="flex items-center justify-end gap-2">
                                      <span className="text-amber-600 dark:text-amber-400 font-black text-[17px] block bg-amber-50 dark:bg-amber-500/10 px-2 py-2 rounded-lg ml-auto w-[110px] text-center border border-amber-200 dark:border-amber-500/40 tracking-wide whitespace-nowrap">
                                        {formatPrice(item.priceVerso)}
                                      </span>
                                      <button 
                                        onClick={() => copyToClipboard(`📋 *Orçamento Yama Print*\n*Produto:* ${item.subCategory}\n*Modelo:* ${item.name} (Frente e Verso)\n${item.description && item.description !== '-' ? `*Especificações:* ${item.description}\n` : ''}${item.quantity ? `*Qtd:* ${item.quantity}\n` : ''}${item.measure ? `*Medida:* ${item.measure}\n` : ''}*Prazo:* ${item.deadline || '-'}\n*Total:* ${formatPrice(item.priceVerso)}`)}
                                        className="p-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors cursor-pointer"
                                        title="Copiar Orçamento"
                                      >
                                        <Copy className="w-5 h-5" />
                                      </button>
                                    </div>
                                  ) : <span className="text-slate-400">-</span>}
                                </td>
                              </tr>
                            ))
                          ) : (
                            getFinalProducts().map((product) => {
                              return (
                                <React.Fragment key={product.id}>
                                  {activeTab === 'GRÁFICA' && <GraficaRow product={product} formatPrice={formatPrice} />}

                                  {activeTab === 'CARIMBO' && isMadeira && (
                                    <tr className="hover:bg-slate-50 dark:hover:bg-[#1a2333] transition-colors border-b border-slate-200 dark:border-[#1e293b]/50 last:border-0">
                                      <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-500 text-xs">{product.id}</td>
                                      <td className="px-6 py-4 font-extrabold text-slate-800 dark:text-slate-200 uppercase min-w-[240px]">{product.name}</td>
                                      <td className="px-6 py-4 text-right align-middle">
                                        <div className="flex items-center justify-end gap-2">
                                          <span className="text-emerald-600 dark:text-emerald-400 font-black text-[17px] block bg-emerald-50 dark:bg-emerald-500/10 px-2 py-2 rounded-lg ml-auto w-[120px] text-center border border-emerald-200 dark:border-emerald-500/40 tracking-wide whitespace-nowrap">{formatPrice(product.price)}</span>
                                          <button 
                                            onClick={() => copyToClipboard(`📋 *Orçamento Yama Print*\n*Produto:* ${product.subCategory || 'Carimbo Madeira'}\n*Modelo:* ${product.name}\n${product.description && product.description !== '-' ? `*Especificações:* ${product.description}\n` : ''}*Total:* ${formatPrice(product.price)}`)}
                                            className="p-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors cursor-pointer"
                                            title="Copiar Orçamento"
                                          >
                                            <Copy className="w-5 h-5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  )}

                                  {activeTab === 'CARIMBO' && isAutomatico && (
                                    <tr className="hover:bg-slate-50 dark:hover:bg-[#1a2333] transition-colors border-b border-slate-200 dark:border-[#1e293b]/50 last:border-0">
                                      <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-500 text-xs">{product.id}</td>
                                      <td className="px-6 py-4 font-extrabold text-slate-800 dark:text-slate-200 uppercase min-w-[240px]">{product.name}</td>
                                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium text-[13px]">{product.measure || '-'}</td>
                                      <td className="px-6 py-4 text-right align-middle">
                                        {product.borrachaPrice > 0 ? (
                                          <span className="text-blue-600 dark:text-blue-400 font-black text-[17px] block bg-blue-50 dark:bg-blue-500/10 px-2 py-2 rounded-lg ml-auto w-[120px] text-center border border-blue-200 dark:border-blue-500/40 tracking-wide whitespace-nowrap">{formatPrice(product.borrachaPrice)}</span>
                                        ) : <span className="text-slate-400">-</span>}
                                      </td>
                                      <td className="px-6 py-4 text-right align-middle">
                                        {product.almofadaPrice > 0 ? (
                                          <span className="text-amber-600 dark:text-amber-400 font-black text-[17px] block bg-amber-50 dark:bg-amber-500/10 px-2 py-2 rounded-lg ml-auto w-[120px] text-center border border-amber-200 dark:border-amber-500/40 tracking-wide whitespace-nowrap">{formatPrice(product.almofadaPrice)}</span>
                                        ) : <span className="text-slate-400">-</span>}
                                      </td>
                                      <td className="px-6 py-4 text-right align-middle">
                                        <div className="flex items-center justify-end gap-2">
                                          <span className="text-emerald-600 dark:text-emerald-400 font-black text-[17px] block bg-emerald-50 dark:bg-emerald-500/10 px-2 py-2 rounded-lg ml-auto w-[120px] text-center border border-emerald-200 dark:border-emerald-500/40 tracking-wide whitespace-nowrap">{formatPrice(product.price)}</span>
                                          <button 
                                            onClick={() => copyToClipboard(`📋 *Orçamento Yama Print*\n*Produto:* ${product.subCategory || 'Carimbo Automático'}\n*Modelo:* ${product.name}\n${product.description && product.description !== '-' ? `*Especificações:* ${product.description}\n` : ''}${product.measure ? `*Medida:* ${product.measure}\n` : ''}*Carimbo Completo:* ${formatPrice(product.price)}`)}
                                            className="p-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors cursor-pointer"
                                            title="Copiar Orçamento"
                                          >
                                            <Copy className="w-5 h-5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  )}

                                  {activeTab === 'SERVIÇOS' && (
                                    <tr className="hover:bg-slate-50 dark:hover:bg-[#1a2333] transition-colors border-b border-slate-200 dark:border-[#1e293b]/50 last:border-0">
                                      <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-500 text-xs">{product.id}</td>
                                      <td className="px-6 py-4 min-w-[240px]">
                                        <div className="font-extrabold text-slate-800 dark:text-slate-200 uppercase whitespace-nowrap">{product.name}</div>
                                        <div className="flex items-center gap-2 mt-1 w-max">
                                            {product.quantity && <span className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm whitespace-nowrap">Qtd: {product.quantity}</span>}
                                            {product.measure && <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm whitespace-nowrap">{product.measure}</span>}
                                            {product.printType && <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm uppercase whitespace-nowrap">{product.printType}</span>}
                                        </div>
                                      </td>
                                      
                                      {isCopiaImpressao && (
                                        <>
                                          <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300 font-medium text-[13px]">{product.priceN > 0 ? formatPrice(product.priceN) : '-'}</td>
                                          <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300 font-medium text-[13px]">{product.priceO > 0 ? formatPrice(product.priceO) : '-'}</td>
                                        </>
                                      )}
                                      {isCapa && (
                                        <>
                                          <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300 font-medium text-[13px]">{product.priceN > 0 ? formatPrice(product.priceN) : '-'}</td>
                                          <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300 font-medium text-[13px]">{product.priceO > 0 ? formatPrice(product.priceO) : '-'}</td>
                                        </>
                                      )}
                                      {isEspiral && (
                                        <>
                                          <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300 font-medium text-[13px]">{product.priceN > 0 ? formatPrice(product.priceN) : '-'}</td>
                                          <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300 font-medium text-[13px]">{product.priceO > 0 ? formatPrice(product.priceO) : '-'}</td>
                                        </>
                                      )}
                                      {isPlastificacao && (
                                        <>
                                          <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300 font-medium text-[13px]">{product.priceN > 0 ? formatPrice(product.priceN) : '-'}</td>
                                          <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300 font-medium text-[13px]">{product.priceO > 0 ? formatPrice(product.priceO) : '-'}</td>
                                          <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300 font-medium text-[13px]">{product.priceP > 0 ? formatPrice(product.priceP) : '-'}</td>
                                        </>
                                      )}
                                      {!isCopiaImpressao && !isCapa && !isEspiral && !isPlastificacao && (
                                        <td className="px-6 py-4 text-right align-middle">
                                          <div className="flex items-center justify-end gap-2">
                                            <span className="text-emerald-600 dark:text-emerald-400 font-black text-[17px] block bg-emerald-50 dark:bg-emerald-500/10 px-2 py-2 rounded-lg ml-auto w-[120px] text-center border border-emerald-200 dark:border-emerald-500/40 tracking-wide whitespace-nowrap">{formatPrice(product.price)}</span>
                                            <button 
                                              onClick={() => copyToClipboard(`📋 *Orçamento Yama Print*\n*Serviço:* ${product.name}\n${product.description && product.description !== '-' ? `*Especificações:* ${product.description}\n` : ''}*Total:* ${formatPrice(product.price)}`)}
                                              className="p-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors cursor-pointer"
                                              title="Copiar Orçamento"
                                            >
                                              <Copy className="w-5 h-5" />
                                            </button>
                                          </div>
                                        </td>
                                      )}
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })
                          )}
                          
                          {getFinalProducts().length === 0 && (
                             <tr><td colSpan="100%" className="text-center py-12 text-slate-500 font-medium text-sm">Nenhum produto encontrado.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'FORNECEDORES' && (
                <div className="bg-white dark:bg-gradient-to-b dark:from-[#101726] dark:via-[#0d131f] dark:to-[#090d16] border border-slate-200 dark:border-[#1e293b]/80 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-[#162032]/80 border-b border-slate-200 dark:border-[#1e293b] text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                          <th className="px-6 py-5">Fornecedor</th>
                          <th className="px-6 py-5">Vendedor</th>
                          <th className="px-6 py-5">Pedido Mínimo</th>
                          <th className="px-6 py-5">Estoque</th>
                          <th className="px-6 py-5">Prazo Normal</th>
                          <th className="px-6 py-5">Desconto À Vista</th>
                          <th className="px-6 py-5">Contatos</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {getFinalSuppliers().map((sup, index) => (
                          <tr key={index} className="hover:bg-slate-50 dark:hover:bg-[#1a2333] transition-colors border-b border-slate-200 dark:border-[#1e293b]/50 last:border-0">
                            <td className="px-6 py-4 font-black text-slate-800 dark:text-slate-200 uppercase">{sup.fornecedor}</td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium uppercase text-xs">{sup.vendedor}</td>
                            <td className="px-6 py-4">
                              <span className="bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap">
                                {sup.pedidoMinimo}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium text-xs">{sup.estoque}</td>
                            <td className="px-6 py-4">
                              <span className="bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap">
                                <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                {sup.prazo}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-black">
                              <span className={sup.desconto?.includes('%') || sup.desconto === 'NEGOCIAR' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}>
                                {sup.desconto}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {sup.contatos && sup.contatos.split('|').map((contato, i) => contato.trim() && (
                                <div key={i} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs font-medium mb-1 last:mb-0 whitespace-nowrap">
                                  <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                  {contato.trim()}
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                        {getFinalSuppliers().length === 0 && (
                          <tr><td colSpan="100%" className="text-center py-12 text-slate-500 font-medium text-sm">Nenhum fornecedor encontrado.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'CONTROLE_HORAS' && (
                <div className="bg-white dark:bg-gradient-to-b dark:from-[#101726] dark:via-[#0d131f] dark:to-[#090d16] border border-slate-200 dark:border-[#1e293b]/80 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="bg-slate-100 dark:bg-[#162032]/80 border-b border-slate-200 dark:border-[#1e293b] p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                     <h2 className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-wide uppercase">
                        Banco de Horas
                     </h2>
                     <div className="flex items-center gap-3">
                       <button onClick={() => handlePrint('horas')} className="bg-white dark:bg-[#1e293b] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#27354f] hover:bg-slate-50 dark:hover:bg-[#27354f] transition-colors px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 shadow-sm cursor-pointer">
                         <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                         Imprimir
                       </button>
                       <button onClick={() => fetchSheetData(true)} disabled={loadingHours} className="bg-blue-100 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm">
                         <RefreshCw className={`w-4 h-4 ${loadingHours ? 'animate-spin' : ''}`} />
                         {loadingHours ? 'Sincronizando...' : 'Atualizar Dados'}
                       </button>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-[#162032]/80 border-b border-slate-200 dark:border-[#1e293b] text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                          <th className="px-6 py-5">Loja</th>
                          <th className="px-6 py-5">Funcionário</th>
                          <th className="px-6 py-5 text-right">Saldo de Horas</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {hoursData.length === 0 ? (
                          <tr><td colSpan="3" className="text-center py-12 text-slate-500 font-medium text-sm">
                            Nenhum dado encontrado.
                          </td></tr>
                        ) : (
                          hoursData.map((row, index) => (
                            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-[#1a2333] transition-colors border-b border-slate-200 dark:border-[#1e293b]/50 last:border-0">
                              <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase">{row.loja || '-'}</td>
                              <td className="px-6 py-4 font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">{row.funcionario}</td>
                              <td className="px-6 py-4 text-right align-middle">
                                <span className={`font-black text-[15px] block px-3 py-1.5 rounded-lg ml-auto w-[100px] text-center border tracking-wide ${getHourTagClass(row.horas)}`}>
                                  {row.horas || '0:00'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'ESCALA_FOLGAS' && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-[#162032]/80 border border-slate-200 dark:border-[#1e293b] p-5 rounded-2xl shadow-sm gap-4">
                     <h2 className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-wide uppercase">
                       Escala de Folgas
                     </h2>
                     <div className="flex items-center gap-3">
                       <button onClick={() => handlePrint('folgas')} className="bg-white dark:bg-[#1e293b] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#27354f] hover:bg-slate-50 dark:hover:bg-[#27354f] transition-colors px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 shadow-sm cursor-pointer">
                         <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                         Imprimir
                       </button>
                       <button onClick={() => fetchSheetData(true)} disabled={loadingHours} className="bg-blue-100 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm">
                         <RefreshCw className={`w-4 h-4 ${loadingHours ? 'animate-spin' : ''}`} />
                         {loadingHours ? 'Sincronizando...' : 'Atualizar Dados'}
                       </button>
                     </div>
                  </div>

                  <div className="bg-white dark:bg-gradient-to-b dark:from-[#101726] dark:via-[#0d131f] dark:to-[#090d16] border border-slate-200 dark:border-[#1e293b]/80 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                         <thead>
                            <tr className="bg-slate-100 dark:bg-[#162032]/80 border-b border-slate-200 dark:border-[#1e293b] text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                               <th className="px-6 py-5">Mês</th>
                               <th className="px-6 py-5 text-center">Data</th>
                               <th className="px-6 py-5">Mogi</th>
                               <th className="px-6 py-5">Suzano</th>
                            </tr>
                         </thead>
                        <tbody className="text-sm">
                          {futureFolgas.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="text-center py-12 text-slate-500 font-medium text-sm">
                                Nenhuma folga futura programada.
                              </td>
                            </tr>
                          ) : (
                            futureFolgas.map((row, i) => {
                              const isNext = i === 0; 
                              return (
                                <tr key={i} className={`transition-colors border-b border-slate-200 dark:border-[#1e293b]/50 last:border-0 ${isNext ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'hover:bg-slate-50 dark:hover:bg-[#1a2333]'}`}>
                                  <td className={`px-6 py-4 font-bold text-xs uppercase ${isNext ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {isNext ? (
                                      <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                                        {row.mes}
                                      </div>
                                    ) : row.mes}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                      <span className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide border ${isNext ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'}`}>
                                        {row.data}
                                      </span>
                                  </td>
                                  <td className={`px-6 py-4 font-bold uppercase ${isNext ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}`}>{row.mogi}</td>
                                  <td className={`px-6 py-4 font-bold uppercase ${isNext ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}`}>{row.suzano}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'CONSULTAS' && (
                <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full">
                  
                  {/* Seção Consulta CNPJ / CEP */}
                  <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#1e293b] p-6 rounded-2xl shadow-xl flex flex-col gap-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                      <Search className="w-5 h-5 text-blue-500" />
                      Consultas Rápidas
                    </h2>

                    <div className="flex bg-slate-100 dark:bg-[#0b0e14] p-1.5 rounded-xl border border-slate-200 dark:border-[#1e293b]">
                      <button onClick={() => { setConsultaType('CEP'); setConsultaResult(null); setConsultaError(''); setConsultaInput(''); }} className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-lg text-sm font-bold uppercase transition-all cursor-pointer ${consultaType === 'CEP' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                        <MapPin className="w-4 h-4" /> Consultar CEP
                      </button>
                      <button onClick={() => { setConsultaType('CNPJ'); setConsultaResult(null); setConsultaError(''); setConsultaInput(''); }} className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-lg text-sm font-bold uppercase transition-all cursor-pointer ${consultaType === 'CNPJ' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                        <Building className="w-4 h-4" /> Consultar CNPJ
                      </button>
                    </div>

                    <div className="flex items-center gap-3 w-full">
                      <div className="relative flex-1 h-[50px]">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <input
                          type="text"
                          placeholder={consultaType === 'CEP' ? "Digite apenas números (Ex: 01001000)" : "Digite apenas números (Ex: 00000000000191)"}
                          value={consultaInput}
                          onChange={(e) => setConsultaInput(e.target.value.replace(/\D/g, ''))}
                          onKeyDown={(e) => e.key === 'Enter' && handleConsulta()}
                          className="w-full h-full bg-slate-50 dark:bg-[#0b0e14] border border-slate-300 dark:border-[#27354f] rounded-xl pl-12 pr-4 text-[14px] font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                        />
                      </div>
                      <button 
                        onClick={handleConsulta}
                        disabled={consultaLoading || !consultaInput}
                        className="h-[50px] px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide transition-colors cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {consultaLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Search className="w-4 h-4" />}
                        Buscar
                      </button>
                    </div>

                    {consultaError && (
                      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-semibold flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5" />
                        {consultaError}
                      </div>
                    )}

                    {consultaResult && (
                      <div className="bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-[#27354f] rounded-xl p-6 shadow-inner animate-fade-in-up relative">
                        
                        <button 
                          onClick={handlePrintConsulta}
                          className="absolute top-4 right-4 text-blue-600 bg-blue-100 hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors shadow-sm cursor-pointer border border-blue-200 dark:border-blue-500/20"
                        >
                          <Printer className="w-3.5 h-3.5" /> Imprimir
                        </button>

                        {consultaType === 'CEP' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-4 mt-2">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">CEP</p>
                              <p className="text-sm font-black text-slate-800 dark:text-slate-200">{consultaResult.cep}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Estado / Cidade</p>
                              <p className="text-sm font-black text-slate-800 dark:text-slate-200">{consultaResult.state} — {consultaResult.city}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Bairro</p>
                              <p className="text-sm font-black text-slate-800 dark:text-slate-200">{consultaResult.neighborhood || '-'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Logradouro / Rua</p>
                              <p className="text-sm font-black text-slate-800 dark:text-slate-200">{consultaResult.street || '-'}</p>
                            </div>
                          </div>
                        )}

                        {consultaType === 'CNPJ' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-4 mt-2">
                            <div className="col-span-1 md:col-span-2 pr-20">
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Razão Social</p>
                              <p className="text-[15px] font-black text-slate-800 dark:text-slate-200 uppercase">{consultaResult.razao_social}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Nome Fantasia</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">{consultaResult.nome_fantasia || '-'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">CNPJ</p>
                              <p className="text-sm font-black text-slate-800 dark:text-slate-200">{consultaResult.cnpj}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Situação Cadastral</p>
                              <span className={`mt-0.5 inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${consultaResult.descricao_situacao_cadastral === 'ATIVA' ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30' : 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30'}`}>
                                {consultaResult.descricao_situacao_cadastral}
                              </span>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Data Início Atividade</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{consultaResult.data_inicio_atividade || '-'}</p>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Atividade Principal (CNAE)</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">{consultaResult.cnae_fiscal_descricao || '-'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Natureza Jurídica</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{consultaResult.natureza_juridica || '-'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Capital Social</p>
                              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatPrice(consultaResult.capital_social || 0)}</p>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Quadro de Sócios e Administradores (QSA)</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {consultaResult.qsa && consultaResult.qsa.length > 0 ? consultaResult.qsa.map((socio, idx) => (
                                  <span key={idx} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                                    {socio.nome_socio}
                                  </span>
                                )) : <p className="text-sm font-bold text-slate-500">Não informado</p>}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Telefone</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{consultaResult.ddd_telefone_1 || '-'}</p>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Endereço Completo</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                                {consultaResult.logradouro}, {consultaResult.numero} {consultaResult.complemento ? `- ${consultaResult.complemento}` : ''} <br/>
                                {consultaResult.bairro} — {consultaResult.municipio} / {consultaResult.uf} <br/>
                                CEP: {consultaResult.cep}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Seção Links Externos Conselhos */}
                    <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#1e293b] p-6 rounded-2xl shadow-xl flex flex-col gap-5 no-print">                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-emerald-500" />
                      Portais Oficiais
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Os conselhos de classe não permitem consulta direta via sistema. Clique abaixo para acessar a página oficial de busca de cada conselho.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <button onClick={(e) => handleExternalLink("https://portal.cfm.org.br/busca-medicos/", e)} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-[#27354f] hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group cursor-pointer text-left">
                        <span className="font-bold text-[13px] text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Consulta CRM</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                      </button>
                      <button onClick={(e) => handleExternalLink("https://servicos.coren-sp.gov.br/consulta-de-profissionais/", e)} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-[#27354f] hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group cursor-pointer text-left">
                        <span className="font-bold text-[13px] text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Consulta COREN</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                      </button>
                      <button onClick={(e) => handleExternalLink("https://cna.oab.org.br/", e)} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-[#27354f] hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group cursor-pointer text-left">
                        <span className="font-bold text-[13px] text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Consulta OAB</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                      </button>
                      <button onClick={(e) => handleExternalLink("https://cress-sp.implanta.net.br/servicosonline/Publico/ConsultaInscritos/", e)} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-[#27354f] hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group cursor-pointer text-left">
                        <span className="font-bold text-[13px] text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Consulta CRESS</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                      </button>
                      <button onClick={(e) => handleExternalLink("https://portal.crfsp.org.br/consulta-de-inscritos.html", e)} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-[#27354f] hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group cursor-pointer text-left">
                        <span className="font-bold text-[13px] text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Consulta CRF</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {activeTab === 'DOWNLOADS' && (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center bg-white dark:bg-[#162032]/80 border border-slate-200 dark:border-[#1e293b] p-5 rounded-2xl shadow-sm">
                     <h2 className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-wide uppercase">
                       Downloads e Documentos
                     </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                   {[
                        { title: 'Desenhos para Carimbo', icon: Palette, url: 'https://drive.google.com/uc?export=download&id=1lZeYJbWkkbF6u5MIMN2GYVMQGxOi9yK1' },
                        { title: 'Pedido Carimbo', icon: FileEdit, url: 'https://drive.google.com/uc?export=download&id=14-yzGHx54t1m50FeDklOa7Z8xxYbD7Rz' },
                        { title: 'Controle Gráfica', icon: BarChart, url: 'https://drive.google.com/uc?export=download&id=1HqvJVpvvxNu64fFvqx0ulcedRBDljIpb' },
                        { title: 'Ficha de Cadastro', icon: ClipboardList, url: 'https://drive.google.com/uc?export=download&id=1Is_TVGoPhvZqSxBVkN42C4Ecp-2XpAyr' },
                        { title: 'Controle Serviço Suzano', icon: Building2, url: 'https://drive.google.com/uc?export=download&id=13TiAZwZxHvfRRnJ8VD0NI6nhz4VppAti' },
                        { title: 'Controle Serviço Mogi', icon: Building2, url: 'https://drive.google.com/uc?export=download&id=1ZAeAbKhV2Hkq6QNrVSXpT3A-wXkFcXLL' },
                        { title: 'Ponto CJV - Caixa', icon: CircleDollarSign, url: 'https://drive.google.com/uc?export=download&id=1u4ud2FvM6dbE5fHyhwpa4iJ75RTWpX3X' },
                        { title: 'Reboot RESTORE FX', icon: RefreshCw, url: 'https://drive.google.com/uc?export=download&id=1nXfJrc6HuwVaOtUm-xpchk5oNSPUyQIK' },
                        { title: 'Reset Epson', icon: Printer, url: 'https://sites.google.com/view/ma1000ramos/in%C3%ADcio' },
                        { title: 'CorelDraw', icon: PenTool, url: 'https://download1530.mediafire.com/...' },
                        { title: 'Compressor PDF', icon: FileArchive, url: 'https://smallpdf.com/lp/compress-pdf' }
                      ].map((link, idx) => (
                      <div 
                        key={idx} 
                        onClick={(e) => handleExternalLink(link.url, e)} 
                        className="relative group rounded-xl p-[2px] cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                        <div className="w-full h-full bg-white dark:bg-[#121826] group-hover:bg-slate-50 dark:group-hover:bg-[#0b0e14] border border-slate-200 dark:border-[#1e293b] rounded-xl p-5 flex items-center gap-4 transition-colors duration-300 relative z-10">
                          <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
                            <link.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-wide">{link.title}</h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider mt-1">Acessar Link</p>
                          </div>
                          <svg className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'UPLOADS' && (
                <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
                  
                  <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#1e293b] p-6 rounded-2xl shadow-xl flex flex-col gap-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                      Central de Uploads
                    </h2>

                    <div className="flex bg-slate-100 dark:bg-[#0b0e14] p-1.5 rounded-xl border border-slate-200 dark:border-[#1e293b]">
                      <button onClick={() => setActiveStore('mogi')} className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase transition-all cursor-pointer ${activeStore === 'mogi' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                        Loja Mogi
                      </button>
                      <button onClick={() => setActiveStore('suzano')} className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase transition-all cursor-pointer ${activeStore === 'suzano' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                        Loja Suzano
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {uploadTargets[activeStore].map((target, idx) => (
                        <button 
                          key={idx}
                          onClick={() => { setSelectedTarget(target); setModalOpen(true); setSelectedFile(null); setUploadMsg(''); }}
                          className="w-full py-4 px-6 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0b0e14] hover:bg-slate-100 dark:hover:bg-[#161e2e] hover:border-blue-500/50 text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm group"
                        >
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                          {target.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ADMIN' && (
                <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#1e293b] rounded-2xl p-12 max-w-2xl mx-auto my-8 flex flex-col items-center shadow-2xl">
                  <div className="bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 w-20 h-20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-500 mb-6 shadow-[0_0_20px_rgba(37,99,235,0.1)] text-3xl">⚙️</div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">Painel do Administrador</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 text-center px-6">Sincronize o banco de dados via CSV.</p>
                  
                  <div className="flex flex-col md:flex-row w-full gap-6 justify-center">
                    <div className="flex-1 bg-slate-50 dark:bg-[#0b0e14] p-6 rounded-xl border border-slate-200 dark:border-[#1e293b] flex flex-col items-center shadow-inner">
                      <div className="mb-3 text-blue-600 dark:text-blue-500">
                        <Printer className="w-10 h-10" />
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Atualizar Produtos</h3>
                      <input type="file" accept=".csv" onChange={handleProductUpload} className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer" />
                    </div>
                    
                    <div className="flex-1 bg-slate-50 dark:bg-[#0b0e14] p-6 rounded-xl border border-slate-200 dark:border-[#1e293b] flex flex-col items-center shadow-inner">
                      <div className="text-3xl mb-3">📦</div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Atualizar Fornecedores</h3>
                      <input type="file" accept=".csv" onChange={handleSupplierUpload} className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer" />
                    </div>
                  </div>

                  {loadingUpload && (
                    <div className="flex flex-col items-center gap-3 mt-8">
                      <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                      <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">{uploadStatus}</p>
                    </div>
                  )}
                  {!loadingUpload && uploadStatus && (
                    <div className={`mt-8 font-semibold text-sm px-6 py-3 rounded-lg border ${uploadStatus.includes('✅') ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' : uploadStatus.includes('❌') ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'}`}>
                      {uploadStatus}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>

          <div className="mt-auto pt-8 pb-4 flex justify-center items-center w-full">
            <a 
              href="https://github.com/mrenanpx" 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={(e) => handleExternalLink("https://github.com/mrenanpx", e)}
              className="flex items-center gap-2 py-1.5 px-4 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 active:bg-emerald-100 dark:active:bg-emerald-500/10 active:text-emerald-700 dark:active:text-emerald-400 rounded-lg transition-all cursor-pointer group"
            >
              <svg className="w-4 h-4 fill-current opacity-60 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span className="tracking-wide">mrenanpx</span>
            </a>
          </div>

        </div>
      </main>
      </div>
    </div>
  );
}