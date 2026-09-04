import { X, Upload } from 'lucide-react';

export const UploadModal = ({ 
  modalOpen, setModalOpen, selectedTarget, selectedFile, setSelectedFile, 
  uploadMsg, setUploadMsg, uploading, handleFileChange, handleSendFile, uploadHistory
}) => {
  if (!modalOpen) return null;
  return (
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
  );
};

export const AdminModal = ({ 
  showAdminModal, setShowAdminModal, adminPassword, setAdminPassword, 
  passwordError, handleLogin
}) => {
  if (!showAdminModal) return null;
  return (
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
  );
};
