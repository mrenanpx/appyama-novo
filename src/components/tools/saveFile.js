// Gravação de arquivo dos resultados do Conversor.
//
// Num navegador comum, baixamos via <a download>. Quando o app roda dentro do
// WebView do Tauri esse truque NÃO dispara o download, então usamos os plugins
// nativos "dialog" (Salvar como…) + "fs" (gravar bytes no destino escolhido).

import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

/** Detecta se o código está executando dentro de um WebView do Tauri. */
const IN_TAURI =
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

const dataUrlToBytes = (dataURL) => {
  const base64 = dataURL.split(',')[1];
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
};

/**
 * Salva o resultado no disco.
 * @param {Object} p
 * @param {string} p.filename     nome sugerido (ex.: "imagem.png")
 * @param {string|Blob} p.content dataURL de imagem/PDF OU um Blob já montado
 *        (ex.: PDF vindo do pdf-lib).
 */
export async function saveToDisk({ filename, content }) {
  const mime = typeof content === 'string'
    ? (content.split(',')[0].match(/data:([^;,]+)/) || [])[1] || 'application/octet-stream'
    : content.type;

  if (IN_TAURI) {
    // Dá ao usuário a escolha de onde salvar.
    const path = await save({ defaultPath: filename });
    if (!path) return; // usuário cancelou o diálogo — silencioso.
    const bytes = typeof content === 'string'
      ? dataUrlToBytes(content)
      : new Uint8Array(await content.arrayBuffer());
    await writeFile(path, bytes);
    return;
  }

  // Fallback para o navegador: download automático com nome.
  const isDataUrl = typeof content === 'string';
  const objectUrl = !isDataUrl && (
    content.type
      ? content
      : new Blob([content], { type: mime || 'application/octet-stream' })
  );
  const href = isDataUrl ? content : URL.createObjectURL(objectUrl);

  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (!isDataUrl) URL.revokeObjectURL(href);
    a.remove();
  }, 2000);
}
