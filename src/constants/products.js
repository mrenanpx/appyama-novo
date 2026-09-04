export const CURRENT_APP_VERSION = "v.1.0.9";

export const regrasProdutos = {
  "BASTAO": { minL: 50, maxL: 200, minA: 50, maxA: 1000, minQtd: 1, minVal: 60, fator: 1.24, isAdesivo: false },
  "ILHOSES": { minL: 50, maxL: 200, minA: 75, maxA: 1000, minQtd: 1, minVal: 62, fator: 1.43, isAdesivo: false },
  "LONA": { minL: 50, maxL: 300, minA: 100, maxA: 1000, minQtd: 1, minVal: 60, fator: 1.20, isAdesivo: false },
  "FAIXA": { minL: 100, maxL: 1000, minA: 50, maxA: 200, minQtd: 1, minVal: 65, fator: 1.33, isAdesivo: false },
  "MICROPERFURADO": { minL: 30, maxL: 148, minA: 21, maxA: 1000, minQtd: 1, minVal: 52, fator: 1.19, isAdesivo: true },
  "TRANSPARENTE": { minL: 5, maxL: 70, minA: 5, maxA: 1000, minQtd: 1, minVal: 145, fator: 3.10, isAdesivo: true },
  "HOLOGRAFICO": { minL: 5, maxL: 54, minA: 5, maxA: 100, minQtd: 1, minVal: 159, fator: 3.49, isAdesivo: true },
  "VINIL": { minL: 5, maxL: 140, minA: 5, maxA: 1000, minQtd: 1, minVal: 82, fator: 1.84, isAdesivo: true }
};

export const BYPASS_TYPE_SUBCATS = [
  "MARCA PAGINA", 
  "CALENDARIO DE BOLSO", 
  "SANTINHO", 
  "CRACHA", 
  "FOLHINHA COMERCIAL"
];

export const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbztdiR-eqX5qvv3oynhnbhZBqVyvKVdCC7V31tJdtRzPceOx2BHZDpDzrqiMJ3YO9a02A/exec";

export const uploadTargets = {
  mogi: [
    { name: 'Contador Máquina 1', folderId: '1ICahzIvyvcsbC0Y-W1uo4r0ByChTtgpS' },
    { name: 'Contador Máquina 2', folderId: '1SJQzWsfPiB6RN0ZTlNfOGPlQ7dKHHdnV' },
    { name: 'Contador Máquina 3', folderId: '1K8Y-o5344PhegDlykicl3HGJUhq2N0f-' }
  ],
  suzano: [
    { name: 'Gráfica Suzano', folderId: '1vrTxUUKq_k5mwBsJa0nB5qBg51CD_4W11tWFQcpN__TLJPPaGwbWP8Rd7kLPir5_sZwvusLE' },
    { name: 'Carimbo Suzano', folderId: '1Nz6Z1IRsSD9IUCkdDkJhbt51nGej2r4A3ZRK3FG9Cyx-juD5DFhlPaDqDpI6OU3b7d0mdVQ2' },
    { name: 'Contador Máquina 1', folderId: '1jTUxHGDVLJpK_Ahfy3_mK6ejsaN5XfMi8mfh2oBsbL1EcPv8gtlpyb35nU7z69kweQttTpmz' },
    { name: 'Contador Máquina 2', folderId: '1r1VDDKAtSlKHcXFGieAqwO7qkzLXy-PLbMBp67ZYz_BJ178cQBh0e0F8L8R9fDFQOajtSpUN' },
    { name: 'Contador Máquina 3', folderId: '1e14Nhob1suDKqRlkxVmxyShQZQ_cFCij1ZhFo6fLMqibTqeGtS607zc9yavpt59h33mPHRxW' }
  ]
};
