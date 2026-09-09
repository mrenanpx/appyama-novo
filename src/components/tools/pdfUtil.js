// Camada fina de rasterização de PDF para o Conversor de arquivos.
//
// Usa o PDF.js do Mozilla (pdfjs-dist) rodando de forma 100% local dentro do
// WebView/Tauri: abre o documento e desenha cada página em um <canvas> oculto,
// exportando PNG (transparência) ou JPEG (fundal branco). Nenhuma chamada de rede.

import * as pdfjs from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Presets de resolução oferecidos na interface (p/ os mesmos “points por polegada”).
export const PDF_DPI_OPTIONS = [
  { label: 'Baixa (96 dpi)', value: 96 },
  { label: 'Média (150 dpi)', value: 150 },
  { label: 'Alta (300 dpi)', value: 300 },
];

let configured = false;
const ensurePdfWorker = () => {
  if (configured) return;
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  configured = true;
};

/** Abre um arquivo .pdf (escolhido pelo usuário) numa instância de documento PDF.js. */
export const openPdf = async (file) => {
  ensurePdfWorker();
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  return doc;
};

/** Libera memória do documento quando não usar mais. */
export const closePdf = (doc) => {
  if (doc && typeof doc.destroy === 'function') doc.destroy();
};

/**
 * Renderiza uma página do PDF em PNG/JPEG.
 * @param ctxParams { doc, pageNumber, dpi?, type('png'|'jpg'), quality?(10..100), backgroundColor? }
 * @returns {Promise<{ dataUrl, width, height }>}
 */
export const pdfPageToDataUrl = async ({
  doc,
  pageNumber,
  dpi = 150,
  type = 'png',
  quality = 92,
  backgroundColor = type === 'jpg' ? '#ffffff' : null,
}) => {
  const page = await doc.getPage(pageNumber);

  const baseViewport = page.getViewport({ scale: 1 });
  // Escala física (pt -> px) aplicando limite de segurança do canvas (~10k px).
  const scale = Math.min(dpi / 72, 10000 / (baseViewport.width || 1));
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const ctx = canvas.getContext('2d');

  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  await page.render({ canvasContext: ctx, viewport }).promise;

  const mime = type === 'jpg' ? 'image/jpeg' : 'image/png';
  const dataUrl = type === 'jpg'
    ? canvas.toDataURL(mime, Math.max(0.05, quality / 100))
    : canvas.toDataURL(mime);

  return { dataUrl, width: canvas.width, height: canvas.height };
};
