import { ImageDown } from 'lucide-react';
import ConvertImageTool from '../tools/ConvertImageTool';

const ToolsView = () => (
  <div className="flex flex-col gap-5 w-full">
    {/* Subtítulo / contexto */}
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 -mb-1">
        <ImageDown className="w-4 h-4 text-blue-500" />
        CONVERSOR DE IMAGENS E PDF
      </p>
    </div>

    {/* Ferramenta ativa */}
    <div className="rounded-2xl">
      <ConvertImageTool />
    </div>
  </div>
);

export default ToolsView;
