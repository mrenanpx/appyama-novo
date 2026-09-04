import { Search } from 'lucide-react';

const Breadcrumb = ({ 
  activeTab, selectedSubCategory, selectedProductType, products,
  handleGoHome, triggerAnimation, setSelectedSubCategory, setSelectedProductType, 
  setSearchTerm, setIsExtrasOpen, searchTerm, getFirstProductType
}) => {


  return (
    <div className="sticky top-0 z-30 flex flex-col gap-2 bg-slate-200 dark:bg-[#0b0e14] py-2 transition-all">
      
      <div className="flex items-center flex-wrap gap-2 text-[13px] font-semibold bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#1e293b] px-4 md:px-5 py-3.5 rounded-xl w-full shadow-sm transition-colors">
        <button onClick={handleGoHome} className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors flex items-center gap-2 cursor-pointer">INÍCIO</button>
        
        {activeTab !== 'HOME' && (
          <>
            <span className="text-slate-400 dark:text-slate-700 font-normal">/</span>
            {(() => {
              const label = activeTab === 'ADMIN' ? 'Administrador' : activeTab === 'CHANGELOG' ? 'Changelog' : activeTab.replace('_', ' ');
              // Carimbos e Serviços usam Pills para navegar: o clique no breadcrumb
              // não deve mais voltar para a antiga tela de seleção (grade).
              const bolted = ['CARIMBO', 'SERVIÇOS'].includes(activeTab);
              if (bolted) {
                return (
                  <span className="uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {label}
                  </span>
                );
              }
              return (
                <button onClick={() => { triggerAnimation(); setSelectedSubCategory(null); setSelectedProductType(null); setSearchTerm(''); setIsExtrasOpen(false); }} className={`uppercase tracking-wider transition-colors cursor-pointer ${!selectedSubCategory ? 'text-slate-800 dark:text-slate-200' : 'text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400'}`}>
                  {label}
                </button>
              );
            })()}
          </>
        )}

        {selectedSubCategory && (
          <>
            <span className="text-slate-400 dark:text-slate-700 font-normal">/</span>
            <button onClick={() => { 
              if (activeTab === 'GRÁFICA') {
                const hasTypes = products.some(p => p.category?.toUpperCase().includes('GRÁFICA') && p.subCategory?.toUpperCase() === selectedSubCategory.toUpperCase() && p.name?.trim() !== '');
                if(hasTypes){
                  triggerAnimation(); 
                  // Auto-seleciona o primeiro tipo para pular a tela intermediária
                  const firstType = getFirstProductType ? getFirstProductType(selectedSubCategory) : null;
                  setSelectedProductType(firstType || 'TODOS'); 
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
  );
};

export default Breadcrumb;
