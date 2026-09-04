import { 
  Home, Package, Clock, CalendarDays, Download, Upload, History,
  Search, Sun, Moon, Cog, Lock, Unlock
} from 'lucide-react';

const Sidebar = ({ 
  activeTab, setActiveTab, searchTerm, setSearchTerm, theme, setTheme,
  isAdmin, handleGoHome, handleAdminClick, mobileMenuOpen, setMobileMenuOpen,
  triggerAnimation, setSelectedSubCategory, setSelectedProductType, setUploadStatus, setIsExtrasOpen
}) => {
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
          <SidebarButton icon={<History className="w-5 h-5" />} id="CHANGELOG" label="Changelog"/>
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
  );
};

export default Sidebar;
