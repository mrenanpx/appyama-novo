import { History, Download, Printer, RefreshCw, Search, MapPin, Building, ShieldAlert, ExternalLink, FileText, Palette, FileEdit, BarChart, ClipboardList, Building2, CircleDollarSign, PenTool, FileArchive, Clock } from 'lucide-react';

export const ChangelogView = ({ appUpdateInfo, handleExternalLink }) => (
  <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
    <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#1e293b] p-6 rounded-2xl shadow-xl flex flex-col gap-6">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
        <History className="w-5 h-5 text-blue-500" />
        Changelog / Histórico de Atualizações
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Acompanhe todas as melhorias, correções e novidades implementadas nas versões do Yama Print.
      </p>

      <div className="flex flex-col gap-4 mt-2">
        {appUpdateInfo && appUpdateInfo.history && appUpdateInfo.history.length > 0 ? (
          appUpdateInfo.history.map((item, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-[#27354f] rounded-xl p-5 flex flex-col gap-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e293b] pb-3">
                <span className="font-black text-sm text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  Versão {item.version}
                </span>
                {item.link && (
                  <button 
                    onClick={(e) => handleExternalLink(item.link, e)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Baixar Versão
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {item.changelog || 'Nenhuma descrição detalhada informada para esta versão.'}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500 text-sm font-medium">
            Nenhum registro de atualização encontrado. Cadastre no painel administrativo.
          </div>
        )}
      </div>
    </div>
  </div>
);

export const SuppliersView = ({ getFinalSuppliers }) => (

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
);

export const HoursControlView = ({ hoursData, getHourTagClass, handlePrint, fetchSheetData, loadingHours }) => (
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
);

export const FolgasView = ({ futureFolgas, handlePrint, fetchSheetData, loadingHours }) => (
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
);

export const ConsultasView = ({ consultaType, setConsultaType, consultaInput, setConsultaInput, consultaResult, setConsultaResult, consultaLoading, consultaError, setConsultaError, handleConsulta, handlePrintConsulta, formatPrice, handleExternalLink }) => (
  <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full">
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

    <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#1e293b] p-6 rounded-2xl shadow-xl flex flex-col gap-5 no-print">
      <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
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
);

export const DownloadsView = ({ handleExternalLink }) => {
  const links = [
    { title: 'Modelo de Orçamento', icon: FileText, url: 'https://drive.google.com/uc?export=download&id=1xKShcdXa4OIbrQQOXOpy-iydSjDFF0fC' },
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
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white dark:bg-[#162032]/80 border border-slate-200 dark:border-[#1e293b] p-5 rounded-2xl shadow-sm">
         <h2 className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-wide uppercase">
           Downloads e Documentos
         </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {links.map((link, idx) => (
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
  );
};

export const UploadsView = ({ activeStore, setActiveStore, uploadTargets, setSelectedTarget, setModalOpen, setSelectedFile, setUploadMsg }) => (
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
);

export const AdminView = ({ handleProductUpload, handleSupplierUpload, handleUpdateUpload, loadingUpload, uploadStatus }) => (
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

    <div className="w-full mt-6 bg-slate-50 dark:bg-[#0b0e14] p-6 rounded-xl border border-slate-200 dark:border-[#1e293b] flex flex-col items-center shadow-inner">
      <div className="text-3xl mb-3">🚀</div>
      <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Atualizar Versão & Changelog (CSV)</h3>
      <input type="file" accept=".csv" onChange={handleUpdateUpload} className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer" />
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
);
