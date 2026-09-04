import React from 'react';
import { Clock, Copy } from 'lucide-react';
import { copyToClipboard } from '../../utils/helpers';
import GraficaRow from './GraficaRow';

const ProductTable = ({ 
  activeTab, formatPrice, isMadeira, isAutomatico,
  isCopiaImpressao, isCapa, isEspiral, isPlastificacao,
  isPanfletoOrSimilarSubCategory, getProcessedGraficaProducts, getFinalProducts
}) => {
  const processed = getProcessedGraficaProducts();
  const isPanfleto = activeTab === 'GRÁFICA' && isPanfletoOrSimilarSubCategory();

  return (
    <div className={`bg-white dark:bg-gradient-to-b dark:from-[#101726] dark:via-[#0d131f] dark:to-[#090d16] border border-slate-200 dark:border-[#1e293b]/80 rounded-2xl overflow-hidden shadow-2xl ${isMadeira ? 'max-w-xl mx-auto w-full' : ''}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-[#162032]/80 border-b border-slate-200 dark:border-[#1e293b] text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
              {activeTab === 'GRÁFICA' && (
                isPanfleto ? (
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
            {activeTab === 'GRÁFICA' && isPanfleto ? (
              processed.list.map((item, idx) => (
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
  );
};

export default ProductTable;
