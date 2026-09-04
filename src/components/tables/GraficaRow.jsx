import React, { useState, useEffect } from 'react';
import { Clock, Copy, Maximize, Layers, Minus, Plus } from 'lucide-react';
import { getRegra, copyToClipboard } from '../../utils/helpers';

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

export default GraficaRow;
