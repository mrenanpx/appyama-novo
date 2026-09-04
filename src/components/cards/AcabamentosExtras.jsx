import { X } from 'lucide-react';
import { Info, Circle, Crop, Clock, Maximize, Layers, FileText, Hash, SquareDashed, Clipboard } from 'lucide-react';
import ExtraCard from './ExtraCard';
import { normalizeStr } from '../../utils/helpers';

/* Resolve a configuração de acabamentos (se houver) correspondente ao produto atual */
export const getAcabamentosConfig = (activeTab, selectedSubCategory, selectedProductType) => {
  if (activeTab !== 'GRÁFICA') return null;

  const sub = normalizeStr(selectedSubCategory || '');
  const type = normalizeStr(selectedProductType || '');

  const isImg2 = type.includes('VERNIZ LOCALIZADO');
  const isPVC = type.includes('PVC');
  // Couchê 250g foi recadastrado como variações FRENTE / FRENTE / VERSO no MARCA PÁGINA...
  const isImg1 = type.includes('FRENTE') || type.includes('COUCHE 550G') ||
    sub === 'MARCA PAGINA' || type.includes('HOT STAMP');
  const isImg3 = sub.includes('BLOCO SIMPLES');
  const isImg4 = sub.includes('TALAO SIMPLES');
  const isImg5 = sub === 'TAG';
  const isImg6 = sub.includes('TALAO AUTO');

  if (isPVC) return 'IMG_PVC';
  if (isImg2) return 'IMG2';
  if (isImg1) return 'IMG1';
  if (isImg3) return 'IMG3';
  if (isImg4) return 'IMG4';
  if (isImg5) return 'IMG5';
  if (isImg6) return 'IMG6';
  return null;
};

/* Corpo (grade de acabamentos) usado dentro do modal */
const ExtrasContent = ({ config }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
    {config === 'IMG_PVC' && (
      <>
        <ExtraCard icon={Maximize} title="4 cantos arredondados -" price="R$ 25,00" />
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
);

/* Modal de Acabamentos Extras (renderizado no nível raiz do App) */
export const AcabamentosExtrasModal = ({ isOpen, onClose, config, productName }) => {
  if (!isOpen || !config) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl my-6 relative bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-2xl page-transition"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1e293b] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide pr-8">
          Acabamentos Extras
        </h3>
        {productName && (
          <p className="mt-1.5 flex items-center gap-2 text-sm">
            <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wide">{productName}</span>
          </p>
        )}

        {config === 'IMG2' && (
          <p className="mt-4 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-[12px] text-amber-700 dark:text-amber-400/90 font-semibold">
            * Observação: Estes acabamentos são possíveis apenas para o modelo FRENTE / VERSO.
          </p>
        )}

        <div className="mt-6 max-h-[60vh] overflow-y-auto pr-1">
          <ExtrasContent config={config} />
        </div>
      </div>
    </div>
  );
};

/* Botão compacto que abre o modal de acabamentos extras */
const AcabamentosExtras = ({ activeTab, selectedSubCategory, selectedProductType, onOpen }) => {
  const config = getAcabamentosConfig(activeTab, selectedSubCategory, selectedProductType);
  if (!config) return null;

  return (
    <button
      onClick={onOpen}
      className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
        bg-emerald-500 hover:bg-emerald-400 text-white text-[12px] font-bold uppercase tracking-wider
        shadow-lg shadow-emerald-600/25 border border-emerald-300/50
        transition-all duration-300 ease-out cursor-pointer select-none whitespace-nowrap
        hover:shadow-emerald-500/40 hover:-translate-y-1 hover:scale-[1.03] active:scale-95"
      title="Ver acabamentos extras disponíveis"
    >
      <Info className="w-4 h-4" />
      Acabamentos Extras
    </button>
  );
};

export default AcabamentosExtras;

