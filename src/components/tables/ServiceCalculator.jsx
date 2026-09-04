import { useState } from 'react';
import { Printer, FileText, Copy, Minus, Plus, ChevronsUp } from 'lucide-react';
import { copyToClipboard } from '../../utils/helpers';
import { getServiceUnit, getServiceTiers, getServiceLabel } from '../../constants/servicePricing';

const ServiceCalculator = ({ subCat, formatPrice }) => {
  const [qtdA4, setQtdA4] = useState(0);
  const [qtdA3, setQtdA3] = useState(0);

  const tipo = getServiceLabel(subCat);
  const pA4 = getServiceUnit(tipo, 'A4', qtdA4);
  const pA3 = getServiceUnit(tipo, 'A3', qtdA3);

  const isService = ['COPIA', 'IMPRESSÃO P/B', 'IMPRESSÃO PB', 'IMPRESSÃO COLORIDA'].includes(subCat?.toUpperCase());
  if (!isService) return null;

  const totalA4 = qtdA4 * pA4;
  const totalA3 = qtdA3 * pA3;

  const getNextTierInfo = (qtd) => {
    const tiers = getServiceTiers(tipo);

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

export default ServiceCalculator;
