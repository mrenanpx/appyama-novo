// Utilidades de imagem usadas pelas Ferramentas (Conversor / Upscaler).
//
// O conversor roda de forma nativa no WebView: renderiza em <canvas> e exporta
// em PNG/JPG/WebP com controle de qualidade, funcionando offline em qualquer
// Desktop sem depender de binários externos (como o ImageMagick, que requer
// instalação/privilégios extras e foi dispensado nesta versão).

export const MAX_DIMENSION = 10000;

import { PDFDocument } from 'pdf-lib';

/**
 * Dimensão do canvas para converter mantendo proporção, respeitando um limite
 * razoável e evitando crashes de memória com imagens gigantes.
 */
export const computeTargetSize = (naturalWidth, naturalHeight, max = MAX_DIMENSION) => {
  const scale = Math.min(1, max / Math.max(naturalWidth, naturalHeight || 1));
  return {
    width: Math.max(1, Math.round(naturalWidth * scale)),
    height: Math.max(1, Math.round(naturalHeight * scale)),
  };
};

/**
 * Cria uma URL de objeto a partir do arquivo selecionado. Chamar
 * revokeObjectURL ao terminar.
 */
export const fileToURL = (file) => URL.createObjectURL(file);

/** Obtém um elemento <img> carregado de uma URL (objeto ou data).
 *  @returns {Promise<HTMLImageElement>}
 */
export const loadImage = async (url) => {
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  if (!img.complete) {
    await new Promise((resolve, reject) => {
      img.onload = () => resolve(null);
      img.onerror = () => reject(new Error('Não foi possível carregar a imagem.'));
    });
  }
  return img;
};

/**
 * Desenha a imagem no canvas e converte para o MIME pedido.
 * @param ctxParams { img, type('png'|'jpg'|'webp'), quality(1..100), backgroundColor? }
 * @returns dataURL
 */
export const convertImage = async ({ img, type, quality = 92, backgroundColor = '#ffffff' }) => {
  const { width, height } = computeTargetSize(img.naturalWidth || img.width, img.naturalHeight || img.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (type === 'jpg' || backgroundColor) {
    // Desenha fundo (evita artefato preto em áreas transparentes no JPG)
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(img, 0, 0, width, height);

  const mime = type === 'webp' ? 'image/webp' : type === 'jpg' ? 'image/jpeg' : 'image/png';
  return type === 'png'
    ? canvas.toDataURL(mime)
    : canvas.toDataURL(mime, Math.max(0.05, quality / 100));
};


/**
 * Converte uma imagem carregada em um documento PDF de uma única página
 * com exatamente o tamanho da imagem fonte (1 px => 1 pt no PDF).
 * Transparência gera PNG (lossless); caso contrário JPEG na qualidade pedida.
 * @param ctxParams { img, quality(1..100) }
 * @returns {Promise<Blob>} binário do PDF (application/pdf)
 */
export const imageToPdf = async ({ img, quality = 92 }) => {
  // Mesma lógica de escala do conversor (mantém proporção, limite de memória).
  const { width, height } = computeTargetSize(
    img.naturalWidth || img.width,
    img.naturalHeight || img.height
  );

  const transparent = pixelsHaveTransparency(img);
  const dataURL = transparent
    ? await convertImage({ img, type: 'png', quality: 100, backgroundColor: null })
    : await convertImage({ img, type: 'jpg', quality, backgroundColor: '#ffffff' });
  const bytes = dataUrlToBytes(dataURL);

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([width, height]);
  const embedded = transparent
    ? await pdf.embedPng(bytes)
    : await pdf.embedJpg(bytes);
  page.drawImage(embedded, { x: 0, y: 0, width, height });

  const uint8 = await pdf.save();
  return new Blob([uint8], { type: 'application/pdf' });
};

const dataUrlToBytes = (dataURL) => {
  const base64 = dataURL.split(',')[1];
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
};

const pixelsHaveTransparency = (img) => {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (!w || !h) return false;
  const canvas = document.createElement('canvas');
  canvas.width = Math.min(w, MAX_DIMENSION);
  canvas.height = Math.min(h, MAX_DIMENSION);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
};

export const humanBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
};
