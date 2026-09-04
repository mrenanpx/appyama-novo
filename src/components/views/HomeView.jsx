import adsSvg from '../../assets/logos/ads.svg';
import crbSvg from '../../assets/logos/crb.svg';
import prtSvg from '../../assets/logos/prt.svg';
import { normalizeStr } from '../../utils/helpers';
import { BYPASS_TYPE_SUBCATS } from '../../constants/products';

const HomeView = ({ 
  products, theme, searchTerm, setSearchTerm, formatPrice,
  triggerAnimation, setActiveTab, setSelectedSubCategory, setSelectedProductType, setIsExtrasOpen,
  calcCopiaQtd, setCalcCopiaQtd, calcPbQtd, setCalcPbQtd, calcColorQtd, setCalcColorQtd
}) => {
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

  const QuickCalcCard = ({ title, color, qtd, setQtd, priceFn, tiers }) => {
    const p = priceFn(qtd);
    const total = qtd * p;
    const nextT = tiers.find(t => qtd <= t);
    const faltam = nextT ? (nextT + 1) - qtd : null;
    const colorMap = {
      blue: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300', focus: 'focus:border-blue-500' },
      emerald: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300', focus: 'focus:border-emerald-500' },
      purple: { text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300', focus: 'focus:border-purple-500' }
    };
    const c = colorMap[color];
    return (
      <div className="bg-slate-50 dark:bg-[#1a2234] border border-slate-200 dark:border-[#26334d] p-4 rounded-xl flex flex-col justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>{title}</span>
            {qtd > 0 && <span className={`text-[10px] ${c.bg} px-2 py-0.5 rounded font-bold`}>{formatPrice(p)}/un</span>}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input 
              type="number" 
              placeholder="Qtd de páginas" 
              value={qtd || ''}
              onChange={(e) => setQtd(Math.max(0, Number(e.target.value)))}
              className={`w-full bg-white dark:bg-[#121826] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none ${c.focus}`}
            />
          </div>
          <div className="h-5">
            {qtd > 0 && faltam && (
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
  };

  return (
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

          {/* Calculadoras Rápidas de Balcão */}
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
              <QuickCalcCard 
                title="Cópia Simples" color="blue" qtd={calcCopiaQtd} setQtd={setCalcCopiaQtd}
                priceFn={(q) => q <= 10 ? 0.50 : q <= 50 ? 0.45 : q <= 199 ? 0.40 : 0.35}
                tiers={[10, 50, 199]}
              />
              <QuickCalcCard 
                title="Impressão P&B" color="emerald" qtd={calcPbQtd} setQtd={setCalcPbQtd}
                priceFn={(q) => q <= 10 ? 0.90 : q <= 20 ? 0.75 : q <= 30 ? 0.60 : q <= 80 ? 0.50 : q <= 199 ? 0.40 : 0.30}
                tiers={[10, 20, 30, 80, 199]}
              />
              <QuickCalcCard 
                title="Impressão Colorida" color="purple" qtd={calcColorQtd} setQtd={setCalcColorQtd}
                priceFn={(q) => q <= 10 ? 1.70 : q <= 20 ? 1.50 : q <= 50 ? 1.40 : 1.30}
                tiers={[10, 20, 50]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;
