import { useEffect, useRef, useState } from 'react';
import { Upload, FileImage, Trash2, Download, RefreshCw, Wand2, FileText } from 'lucide-react';
import { fileToURL, loadImage, convertImage, imageToPdf, humanBytes } from './magickUtil';
import { openPdf, closePdf, pdfPageToDataUrl } from './pdfUtil';
import { saveToDisk } from './saveFile';

const FORMATS = {
  png: 'Sem perdas · preserva transparência',
  jpg: 'Compacto, leve perda — p/ fotografias',
  webp: 'Moderno · qualidade com menos peso',
  pdf: 'Documento de 1 página (mesmo tamanho da imagem)',
};

export default function ConvertImageTool() {
  const [objUrl, setObjUrl] = useState(null);
  const [src, setSrc] = useState(null);
  const [format, setFormat] = useState('png');
  const [quality, setQuality] = useState(92);
  const [whiteBg, setWhiteBg] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const pdfDocRef = useRef(null);
  const [pdfMeta, setPdfMeta] = useState(null);
  const [pdfOut, setPdfOut] = useState('png');
  const [pdfQual, setPdfQual] = useState(95);
  const [pdfDpi, setPdfDpi] = useState('150');
  const [busyPage, setBusyPage] = useState(null);

  useEffect(() => () => { if (objUrl) URL.revokeObjectURL(objUrl); }, [objUrl]);
  useEffect(() => () => { closePdf(pdfDocRef.current); }, []);
  const shown = !!(objUrl && src);

  const pick = async (ev) => {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    setBusy(true); setDone(null); setError('');
    const isPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
    if (isPdf) {
      try {
        closePdf(pdfDocRef.current);
        const doc = await openPdf(f);
        pdfDocRef.current = doc;
        if (objUrl) { URL.revokeObjectURL(objUrl); setObjUrl(null); }
        setSrc(null);
        setPdfMeta({ name: f.name, size: f.size, pages: doc.numPages });
      } catch {
        setError('Não foi possível abrir o PDF.');
      } finally { setBusy(false); }
      return;
    }
    try {
      closePdf(pdfDocRef.current); pdfDocRef.current = null;
      setPdfMeta(null);
      const url = fileToURL(f);
      const img = await loadImage(url);
      if (objUrl) URL.revokeObjectURL(objUrl);
      setObjUrl(url);
      setSrc({ name: f.name, size: f.size, w: img.naturalWidth, h: img.naturalHeight });
    } catch {
      setError('Não foi possível ler o arquivo.');
    } finally { setBusy(false); }
  };

  const downloadNow = () => {
    if (!done) return;
    if (done.kind === 'pdf') {
      saveToDisk({ filename: outputName(), content: done.blob });
    } else {
      saveToDisk({ filename: outputName(), content: done.dataURL });
    }
  };

  const clear = () => {
    if (inputRef.current) inputRef.current.value = '';
    closePdf(pdfDocRef.current); pdfDocRef.current = null;
    setPdfMeta(null);
    setSrc(null); setDone(null); setError('');
    if (objUrl) { URL.revokeObjectURL(objUrl); setObjUrl(null); }
  };

  const convert = async () => {
    if (busy) return;
    setBusy(true); setDone(null); setError('');
    try {
      const img = await loadImage(objUrl);
      if (format === 'pdf') {
        const blob = await imageToPdf({ img, quality });
        setDone({ kind: 'pdf', blob, approx: humanBytes(blob.size) });
      } else {
        const backgroundColor = format === 'jpg' ? (whiteBg ? '#ffffff' : null) : null;
        const dataURL = await convertImage({ img, type: format, quality, backgroundColor });
        setDone({ kind: 'raster', dataURL, approx: humanBytes(Math.round((dataURL.length * 3) / 4)) });
      }
    } catch (e) {
      setError(e.message || 'Falha ao converter.');
    } finally { setBusy(false); }
  };

  const outputName = () =>
    (src ? src.name.replace(/\.[^.]+$/, '') : 'imagem') +
    '.' + (format === 'jpg' ? 'jpg' : format);

  const pdfBase = pdfMeta ? pdfMeta.name.replace(/\.[^.]+$/, '') : 'documento';

  const feedPdfArgs = (n) => ({
    doc: pdfDocRef.current,
    pageNumber: n,
    dpi: Number(pdfDpi),
    type: pdfOut,
    quality: pdfQual,
  });

  const downloadPdfPage = async (n) => {
    if (busy || busyPage) return;
    setBusyPage(n); setError('');
    try {
      const { dataUrl } = await pdfPageToDataUrl(feedPdfArgs(n));
      await saveToDisk({ filename: `${pdfBase}_pagina_${n}.${pdfOut}`, content: dataUrl });
    } catch {
      setError('Falha ao converter essa página.');
    } finally { setBusyPage(null); }
  };

  const downloadPdfEvery = async () => {
    if (busy || busyPage || !pdfMeta) return;
    setBusy(true); setError('');
    try {
      for (let n = 1; n <= pdfMeta.pages; n += 1) {
        const { dataUrl } = await pdfPageToDataUrl(feedPdfArgs(n));
        await saveToDisk({ filename: `${pdfBase}_pagina_${n}.${pdfOut}`, content: dataUrl });
      }
    } catch {
      setError('Falha ao converter as páginas.');
    } finally { setBusy(false); }
  };

  const card = 'bg-white dark:bg-[#121826] border border-slate-200 dark:border-[#1e293b] rounded-2xl shadow-sm';

  return (
    <div className="flex flex-col gap-4 w-full">

      {!shown && !pdfMeta && (
        <label className={"group flex flex-col items-center gap-3 cursor-pointer p-8 border-2 border-dashed border-slate-300 dark:border-[#2a3852] hover:border-blue-500 rounded-2xl transition-colors " + card}>
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/bmp,image/svg+xml,application/pdf,.pdf,.heic,.heif" onChange={pick} className="hidden" />
          <span className="w-11 h-11 rounded-full grid place-items-center bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"><Upload className="w-5 h-5" /></span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{busy ? 'Lendo arquivo…' : 'Selecione uma imagem ou um PDF'}</span>
          <span className="text-xs text-slate-400">PNG · JPG · WEBP — local e privado</span>
        </label>
      )}

      {error && (
        <p className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2">{error}</p>
      )}

      {shown && !pdfMeta && (
        <div className={"flex items-center gap-3 px-4 py-2.5 " + card}>
          <span className="w-9 h-9 rounded-lg grid place-items-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#0b0e14]"><FileImage className="w-4 h-4" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{src.name}</p>
            <p className="text-[10px] text-slate-400">{humanBytes(src.size)} · {src.w} × {src.h} px</p>
          </div>
          <button type="button" onClick={clear} aria-label="Remover arquivo" className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
        </div>
      )}
      {shown && !pdfMeta && (
        <div className={"flex flex-col md:flex-row gap-4 p-4 " + card}>
          <div className="md:w-48 shrink-0 rounded-xl bg-slate-100 dark:bg-[#0b0e14] grid place-items-center overflow-hidden min-h-[140px]">
            <img src={objUrl} alt="Pré-visualização" className="max-h-56 object-contain" />
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <div>
              <p className="mb-1.5 text-[11px] uppercase font-bold text-slate-400">Formato</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.keys(FORMATS).map((id) => (
                  <button key={id} type="button" disabled={busy} onClick={() => setFormat(id)}
                    className={"rounded-xl border px-2 py-2.5 disabled:opacity-60 transition-colors cursor-pointer " +
                      (format === id ? "border-blue-500 bg-blue-600/10 text-blue-600 dark:text-blue-400" : "border-slate-200 dark:border-[#2a3852] text-slate-500 dark:text-slate-400 hover:border-blue-400")}>
                    <span className="font-black uppercase">{id}</span>
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-slate-400">{FORMATS[format]}</p>
            </div>

            {(format === 'jpg' || format === 'webp') && (
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Qualidade ({quality}%)</span>
                <input type="range" min="10" max="100" value={quality} disabled={busy} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
              </label>
            )}

            {format === 'jpg' && (
              <label className="items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 flex cursor-pointer select-none">
                <input type="checkbox" className="accent-blue-600" checked={whiteBg} disabled={busy} onChange={(e) => setWhiteBg(e.target.checked)} />
                Fundo branco em áreas transparentes
              </label>
            )}

            <div className="flex flex-wrap gap-2 mt-1">
              <button type="button" onClick={convert} disabled={busy}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold disabled:opacity-60 disabled:cursor-wait transition-colors cursor-pointer">
                {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}{busy ? 'Processando…' : 'Converter imagem'}
              </button>
              {done && (
                <button type="button" onClick={downloadNow}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors cursor-pointer">
                  <Download className="w-4 h-4" /> Baixar .{format === 'jpg' ? 'jpg' : format}
                </button>
              )}
            </div>

            {done && (
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl px-3 py-2">
                Pronto! Formato ~{done.approx}. Clique em “Baixar” para salvar.
              </p>
            )}
          </div>
        </div>
      )}

      {pdfMeta && (
        <>
          <div className={"flex items-center gap-3 px-4 py-2.5 " + card}>
            <span className="w-9 h-9 rounded-lg grid place-items-center bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20"><FileText className="w-4 h-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{pdfMeta.name}</p>
              <p className="text-[10px] text-slate-400">{pdfMeta.pages} {pdfMeta.pages === 1 ? 'página' : 'páginas'} · {humanBytes(pdfMeta.size)}</p>
            </div>
            <button type="button" onClick={clear} aria-label="Remover arquivo" className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
          </div>

          <div className={"flex flex-col gap-3 p-4 " + card}>
            <div>
              <p className="mb-1.5 text-[11px] uppercase font-bold text-slate-400">Converter PDF em imagem</p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Formato</span>
                  <div className="flex items-center gap-2">
                    {['png', 'jpg'].map((id) => (
                      <button key={id} type="button" onClick={() => setPdfOut(id)}
                        className={"px-4 py-1.5 rounded-lg font-black uppercase text-xs border transition-colors cursor-pointer " +
                          (pdfOut === id ? "border-blue-500 bg-blue-600/10 text-blue-600 dark:text-blue-400" : "border-slate-200 dark:border-[#2a3852] text-slate-500 dark:text-slate-400 hover:border-blue-400")}>
                        {id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Resolução</span>
                  <select value={pdfDpi} onChange={(e) => setPdfDpi(e.target.value)}
                    className="rounded-lg border border-slate-200 dark:border-[#2a3852] bg-transparent px-2 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                    <option value="96">Baixa (96 dpi)</option>
                    <option value="150">Média (150 dpi)</option>
                    <option value="300">Alta (300 dpi)</option>
                  </select>
                </div>

                {pdfOut === 'jpg' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Qualidade {pdfQual}%</span>
                    <input type="range" min="50" max="100" value={pdfQual} onChange={(e) => setPdfQual(Number(e.target.value))}
                      className="w-40 accent-blue-600 cursor-pointer" />
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cada página origina um arquivo {pdfOut.toUpperCase()} separado com o mesmo nome do PDF.
            </p>

            <button type="button"
              onClick={downloadPdfEvery}
              disabled={busy || !!busyPage}
              className="inline-flex items-center gap-2 px-4 py-2.5 w-fit rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold disabled:opacity-60 transition-colors cursor-pointer">
              {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {busy ? 'Gerando…' : `Baixar todas as ${pdfMeta.pages} páginas`}
            </button>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-2">
              {Array.from({ length: pdfMeta.pages }, (_, i) => i + 1).map((n) => (
                <button key={n} type="button"
                  onClick={() => downloadPdfPage(n)}
                  disabled={busy || busyPage !== null}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#2a3852] text-slate-700 dark:text-slate-300 hover:border-blue-400 disabled:opacity-60 transition-colors cursor-pointer">
                  <span className="text-xs font-bold">Página {n}</span>
                  {busyPage === n
                    ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    : <Download className="w-3.5 h-3.5 text-blue-500" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
