import { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Circle, Crop, Clock, Maximize, Layers, FileText, Hash, SquareDashed, Clipboard } from 'lucide-react';
import ExtraCard from './ExtraCard';
import { normalizeStr } from '../../utils/helpers';

const AcabamentosExtras = ({ activeTab, selectedSubCategory, selectedProductType }) => {
  const [isExtrasOpen, setIsExtrasOpen] = useState(false);

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

export default AcabamentosExtras;
