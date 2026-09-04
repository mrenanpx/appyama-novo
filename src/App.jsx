import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Menu, X, Sparkles } from 'lucide-react';

import { CURRENT_APP_VERSION, SHEET_API_URL, BYPASS_TYPE_SUBCATS, uploadTargets } from './constants/products';
import { handleExternalLink, normalizeStr, formatPrice, parseCSVLine, parseMoney, parseDateDM } from './utils/helpers';

import Sidebar from './components/layout/Sidebar';
import Breadcrumb from './components/layout/Breadcrumb';
import { UploadModal, AdminModal } from './components/layout/Modals';
import HomeView from './components/views/HomeView';
import ProductTable from './components/tables/ProductTable';
import ServiceCalculator from './components/tables/ServiceCalculator';
import AcabamentosExtras from './components/cards/AcabamentosExtras';
import {
  ChangelogView, SuppliersView, HoursControlView, FolgasView,
  ConsultasView, DownloadsView, UploadsView, AdminView
} from './components/views/OtherViews';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [hoursData, setHoursData] = useState([]);
  const [folgasData, setFolgasData] = useState([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [isExtrasOpen, setIsExtrasOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [activeStore, setActiveStore] = useState('mogi');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadHistory, setUploadHistory] = useState({});

  const [consultaType, setConsultaType] = useState('CEP');
  const [consultaInput, setConsultaInput] = useState('');
  const [consultaResult, setConsultaResult] = useState(null);
  const [consultaLoading, setConsultaLoading] = useState(false);
  const [consultaError, setConsultaError] = useState('');

  const [calcCopiaQtd, setCalcCopiaQtd] = useState(0);
  const [calcPbQtd, setCalcPbQtd] = useState(0);
  const [calcColorQtd, setCalcColorQtd] = useState(0);

  const [appUpdateInfo, setAppUpdateInfo] = useState(null);
  const [dismissUpdate, setDismissUpdate] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const fetchUploadHistory = async () => {
      try {
        const docRef = doc(db, "settings", "historico_uploads");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUploadHistory(docSnap.data());
        }

        const updateRef = doc(db, "settings", "app_update");
        const updateSnap = await getDoc(updateRef);
        if (updateSnap.exists()) {
          setAppUpdateInfo(updateSnap.data());
        }
      } catch (err) {
        console.error("Erro ao carregar configurações do Firebase:", err);
      }
    };
    fetchUploadHistory();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadMsg('');
    }
  };

  const handleSendFile = async () => {
    if (!selectedFile || !selectedTarget) return;
    setUploading(true);
    setUploadMsg('Enviando arquivo com segurança...');

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const base64Bytes = reader.result.split(',')[1];
      try {
        const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz_sWBj0XoEM6Mg4B0ALzMKFd-OciqrXaSaLmlIvF0Hf9pf674guHz51hGfn-q4XDdzNA/exec"; 
        
        const response = await fetch(WEB_APP_URL, {
          method: 'POST',
          body: JSON.stringify({
            filename: selectedFile.name,
            mimeType: selectedFile.type,
            bytes: base64Bytes,
            folderId: selectedTarget.folderId
          })
        });
        const result = await response.json();
        if (result.status === 'sucesso') {
          setUploadMsg('✅ Arquivo enviado com sucesso!');
          
          const agora = new Date();
          const dataFormatada = agora.toLocaleDateString('pt-BR');
          const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          
          const novoRegistro = {
            nome: selectedFile.name,
            data: dataFormatada,
            hora: horaFormatada,
            timestamp: agora.getTime()
          };

          const folderKey = selectedTarget.folderId;
          const historicoAtual = uploadHistory[folderKey] || [];
          const novoHistoricoLista = [novoRegistro, ...historicoAtual].slice(0, 3);
          
          const novoHistoricoCompleto = {
            ...uploadHistory,
            [folderKey]: novoHistoricoLista
          };

          setUploadHistory(novoHistoricoCompleto);
          await setDoc(doc(db, "settings", "historico_uploads"), novoHistoricoCompleto);

          setSelectedFile(null);
          setTimeout(() => { setUploadMsg(''); }, 3000);
        } else {
          setUploadMsg('❌ Erro ao enviar: ' + result.message);
        }
      } catch (err) {
        setUploadMsg('❌ Erro de conexão: ' + err.message);
      } finally {
        setUploading(false);
      }
    };
  };

  const handleConsulta = async () => {
    if (!consultaInput) return;
    setConsultaLoading(true);
    setConsultaError('');
    setConsultaResult(null);

    try {
      const cleanInput = consultaInput.replace(/\D/g, '');
      let url = '';
      
      if (consultaType === 'CEP') {
        if (cleanInput.length !== 8) throw new Error('CEP deve conter 8 dígitos.');
        url = `https://brasilapi.com.br/api/cep/v2/${cleanInput}`;
      } else {
        if (cleanInput.length !== 14) throw new Error('CNPJ deve conter 14 dígitos.');
        url = `https://brasilapi.com.br/api/cnpj/v1/${cleanInput}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Dados não encontrados.');
      }

      setConsultaResult(data);
    } catch (err) {
      setConsultaError(err.message || 'Erro ao realizar a consulta.');
    } finally {
      setConsultaLoading(false);
    }
  };

  const handlePrintConsulta = () => {
    if (!consultaResult) return;
    window.print();
  };

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('HOME'); 
  const [selectedSubCategory, setSelectedSubCategory] = useState(null); 
  const [selectedProductType, setSelectedProductType] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [animationClass, setAnimationClass] = useState('animate-fade-in');
  const [uploadStatus, setUploadStatus] = useState('');
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const triggerAnimation = () => {
    setAnimationClass('');
    setTimeout(() => setAnimationClass('animate-fade-in-up'), 10);
  };

  const handlePrint = (type) => {
    window.print();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const qProd = query(collection(db, "products"), orderBy("order", "asc"));
      const snapProd = await getDocs(qProd);
      const items = [];
      snapProd.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
      setProducts(items);

      const qSup = query(collection(db, "suppliers"));
      const snapSup = await getDocs(qSup);
      const sups = [];
      snapSup.forEach((doc) => sups.push({ id: doc.id, ...doc.data() }));
      sups.sort((a, b) => (a.fornecedor || '').localeCompare(b.fornecedor || ''));
      setSuppliers(sups);

      const docSnap = await getDoc(doc(db, "settings", "dados_planilhas"));
      if (docSnap.exists()) {
        const cacheData = docSnap.data();
        if (cacheData.horas) setHoursData(cacheData.horas);
        if (cacheData.folgas) setFolgasData(cacheData.folgas);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const backgroundSyncSheet = async (isManual = false) => {
    if (!SHEET_API_URL) return;
    if (isManual) setLoadingHours(true);
    try {
      const res = await fetch(SHEET_API_URL);
      const data = await res.json();
      
      if (data && !data.erro) {
        const novasHoras = data.horas || [];
        const novasFolgas = data.folgas || [];

        setHoursData(novasHoras);
        setFolgasData(novasFolgas);

        await setDoc(doc(db, "settings", "dados_planilhas"), {
          horas: novasHoras,
          folgas: novasFolgas,
          ultimaAtualizacao: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error("Erro na sincronização em segundo plano:", e);
    } finally {
      if (isManual) setLoadingHours(false);
    }
  };
  
  const fetchSheetData = async (forceRefresh = false) => {
    if (!forceRefresh && (hoursData.length > 0 || folgasData.length > 0)) {
      backgroundSyncSheet(false);
      return;
    }

    if (!forceRefresh) {
      try {
        const docSnap = await getDoc(doc(db, "settings", "dados_planilhas"));
        if (docSnap.exists()) {
          const cacheData = docSnap.data();
          if (cacheData.horas && cacheData.horas.length > 0) {
            setHoursData(cacheData.horas);
            setFolgasData(cacheData.folgas || []);
            backgroundSyncSheet(false);
            return;
          }
        }
      } catch (e) {
        console.error("Erro ao ler cache do Firebase:", e);
      }
    }

    await backgroundSyncSheet(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (['CONTROLE_HORAS', 'ESCALA_FOLGAS'].includes(activeTab)) {
      fetchSheetData(false);
    }
  }, [activeTab]);

  const getFutureFolgas = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return folgasData.filter(f => {
      const rowDate = parseDateDM(f.data);
      return rowDate >= today;
    });
  };

  const futureFolgas = getFutureFolgas();

  const getSubCategories = () => {
    if (!['GRÁFICA', 'CARIMBO', 'SERVIÇOS'].includes(activeTab)) return [];
    return [...new Set(products.filter(item => item.category?.toUpperCase().includes(activeTab)).map(item => item.subCategory).filter(Boolean))];
  };

  const getProductTypes = () => {
    if (!selectedSubCategory) return [];
    return [...new Set(products.filter(item => item.category?.toUpperCase().includes(activeTab) && item.subCategory?.toUpperCase() === selectedSubCategory.toUpperCase()).map(item => item.name).filter(Boolean))];
  };

  const getFinalProducts = () => {
    const normSearch = normalizeStr(searchTerm);
    return products.filter(item => {
      const matchesCategory = item.category?.toUpperCase().includes(activeTab);
      const isGlobalSearch = ['CARIMBO', 'SERVIÇOS'].includes(activeTab) && !selectedSubCategory;
      let matchesSubCat = true;
      let matchesType = true;

      if (!isGlobalSearch) {
        matchesSubCat = normalizeStr(item.subCategory) === normalizeStr(selectedSubCategory);
        matchesType = ['CARIMBO', 'SERVIÇOS'].includes(activeTab) || selectedProductType === 'TODOS' 
          ? true 
          : normalizeStr(item.name) === normalizeStr(selectedProductType);
      }
      
      const matchesSearch = 
        !normSearch ||
        normalizeStr(item.id).includes(normSearch) ||
        normalizeStr(item.name).includes(normSearch) ||
        normalizeStr(item.measure).includes(normSearch) ||
        normalizeStr(item.description).includes(normSearch);

      return matchesCategory && matchesSubCat && matchesType && matchesSearch;
    });
  };

  const isPanfletoOrSimilarSubCategory = () => {
    const sub = normalizeStr(selectedSubCategory);
    return sub.includes("PANFLETO") || sub.includes("SANTINHO") || sub.includes("CRACHA") || sub.includes("CRACHÁ");
  };

  const getProcessedGraficaProducts = () => {
    const rawList = getFinalProducts();
    if (!isPanfletoOrSimilarSubCategory()) return { type: 'normal', list: rawList };

    const grouped = {};
    rawList.forEach(item => {
      const pType = normalizeStr(item.printType);
      const isFrenteVerso = pType.includes("VERSO") || pType.includes("FRENTE / VERSO") || pType.includes("FRENTE E VERSO");
      
      const baseKey = `${item.quantity || '0'}_${item.measure || '0'}_${item.name || ''}`;
      
      if (!grouped[baseKey]) {
        grouped[baseKey] = {
          id: item.id,
          subCategory: item.subCategory,
          name: item.name,
          quantity: item.quantity,
          measure: item.measure,
          description: item.description,
          deadline: item.deadline,
          priceFrente: 0,
          priceVerso: 0
        };
      }

      if (isFrenteVerso) {
        grouped[baseKey].priceVerso = item.price;
      } else {
        grouped[baseKey].priceFrente = item.price;
        grouped[baseKey].id = item.id;
        grouped[baseKey].description = item.description;
        grouped[baseKey].deadline = item.deadline;
      }
    });

    return { type: 'panfleto', list: Object.values(grouped) };
  };

  const getFinalSuppliers = () => {
    const normSearch = normalizeStr(searchTerm);
    return suppliers.filter(s => {
      return !normSearch || 
        normalizeStr(s.fornecedor).includes(normSearch) || 
        normalizeStr(s.vendedor).includes(normSearch) || 
        normalizeStr(s.contatos).includes(normSearch);
    });
  };

  const displaySubCats = getSubCategories().filter(sub => normalizeStr(sub).includes(normalizeStr(searchTerm)));
  const displayTypes = getProductTypes().filter(type => normalizeStr(type).includes(normalizeStr(searchTerm)));

  const normSearchGlobal = normalizeStr(searchTerm);

  const handleGoHome = () => {
    triggerAnimation();
    setActiveTab('HOME');
    setSelectedSubCategory(null);
    setSelectedProductType(null);
    setSearchTerm('');
    setUploadStatus('');
    setIsExtrasOpen(false);
    setMobileMenuOpen(false);
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      triggerAnimation();
      setActiveTab('ADMIN');
      setSelectedSubCategory(null);
      setSelectedProductType(null);
      setSearchTerm('');
      setIsExtrasOpen(false);
      setMobileMenuOpen(false);
    } else {
      setShowAdminModal(true);
      setPasswordError('');
      setAdminPassword('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogin = () => {
    if (adminPassword === '100418') {
      setIsAdmin(true);
      setShowAdminModal(false);
      triggerAnimation();
      setActiveTab('ADMIN');
      setSelectedSubCategory(null);
      setSelectedProductType(null);
      setSearchTerm('');
      setIsExtrasOpen(false);
    } else {
      setPasswordError('Senha incorreta. Tente novamente.');
    }
  };

  const getHourTagClass = (horasStr) => {
    if (!horasStr || horasStr === '0' || horasStr === '0:00' || horasStr === '00:00') {
      return 'bg-slate-200 text-slate-500 border-slate-300 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30'; 
    }
    if (horasStr.includes('-')) {
      return 'bg-red-100 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30'; 
    }
    return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'; 
  };

  const handleProductUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setLoadingUpload(true);
        setUploadStatus('Processando Produtos...');
        const text = event.target.result;
        const lines = text.split('\n');
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cols = parseCSVLine(line);
          const rawId = cols[0]?.trim();
          
          if (rawId) {
            const safeId = rawId.replace(/\//g, '_');
            const productData = {
              id: safeId,
              originalId: rawId,
              category: cols[1]?.trim() || '',
              subCategory: cols[2]?.trim() || '',
              name: cols[3]?.trim() || '',
              quantity: cols[4]?.trim() || '',
              measure: cols[5]?.trim() || '', 
              description: cols[6]?.trim() || '',
              calcType: cols[7]?.trim() || 'Fixo',
              price: parseMoney(cols[12]) || parseMoney(cols[8]), 
              borrachaPrice: parseMoney(cols[10]), 
              almofadaPrice: parseMoney(cols[11]), 
              priceN: parseMoney(cols[13]), 
              priceO: parseMoney(cols[14]), 
              priceP: parseMoney(cols[15]), 
              deadline: cols[17]?.trim() || '',
              order: Number(cols[18]?.trim()) || i,
              printType: cols[19]?.trim() || '' 
            };
            await setDoc(doc(db, "products", safeId), productData);
          }
        }
        setUploadStatus('✅ Produtos atualizados com sucesso!');
        fetchData();
      } catch (err) {
        console.error(err);
        setUploadStatus('❌ Erro: ' + err.message);
      } finally {
        setLoadingUpload(false);
      }
    };
    reader.readAsText(file);
  };

  const handleSupplierUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setLoadingUpload(true);
        setUploadStatus('Processando Fornecedores...');
        const text = event.target.result;
        const lines = text.split('\n');

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cols = parseCSVLine(line);
          const fornecedorNome = cols[0]?.trim();
          
          if (fornecedorNome) {
            const safeId = fornecedorNome.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
            const contato1 = cols[6]?.trim() || '';
            const contato2 = cols[7]?.trim() || '';
            const contatosArr = [contato1, contato2].filter(Boolean);

            const supData = {
              fornecedor: fornecedorNome,
              vendedor: cols[1]?.trim() || '-',
              pedidoMinimo: cols[2]?.trim() || '-',
              estoque: cols[3]?.trim() || '-',
              prazo: cols[4]?.trim() || '-',
              desconto: cols[5]?.trim() || '-',
              contatos: contatosArr.join(' | ')
            };
            await setDoc(doc(db, "suppliers", safeId), supData);
          }
        }
        setUploadStatus('✅ Fornecedores atualizados com sucesso!');
        fetchData();
      } catch (err) {
        console.error(err);
        setUploadStatus('❌ Erro: ' + err.message);
      } finally {
        setLoadingUpload(false);
      }
    };
    reader.readAsText(file);
  };

  const handleUpdateUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setLoadingUpload(true);
        setUploadStatus('Processando Atualização...');
        const text = event.target.result;
        const lines = text.split('\n');
        
        let updatesList = [];
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cols = parseCSVLine(line);
          const tag = cols[0]?.trim().toLowerCase();
          
          if (tag === 'update') {
            let version = 'v.1.0.0';
            let link = '';
            let changelogParts = [];

            for (let c = 1; c < cols.length; c++) {
              let val = cols[c]?.trim();
              if (!val) continue;

              val = val.replace(/^["'](.+)["']$/, '$1').trim();

              if (val.toLowerCase().startsWith('v.')) {
                version = val;
              } else if (val.startsWith('http')) {
                link = val;
              } else {
                changelogParts.push(val);
              }
            }

            updatesList.push({
              version,
              link,
              changelog: changelogParts.join('\n')
            });
          }
        }

        if (updatesList.length > 0) {
          const latest = updatesList[0];
          const updatePayload = {
            latestVersion: latest.version,
            latestLink: latest.link,
            history: updatesList
          };
          await setDoc(doc(db, "settings", "app_update"), updatePayload);
          setAppUpdateInfo(updatePayload);
          setUploadStatus('✅ Versão e Changelog atualizados com sucesso!');
        } else {
          setUploadStatus('⚠️ Nenhuma linha com a tag "update" encontrada na coluna A.');
        }
      } catch (err) {
        console.error(err);
        setUploadStatus('❌ Erro: ' + err.message);
      } finally {
        setLoadingUpload(false);
      }
    };
    reader.readAsText(file);
  };

  const currentViewKey = `${activeTab}-${selectedSubCategory || 'none'}-${selectedProductType || 'none'}-${searchTerm}`;
  
  const isGlobalSearch = ['CARIMBO', 'SERVIÇOS'].includes(activeTab) && !selectedSubCategory && normSearchGlobal !== '';
  const isMadeira = activeTab === 'CARIMBO' && selectedSubCategory?.toUpperCase().includes('MADEIRA') && !isGlobalSearch;
  const isAutomatico = activeTab === 'CARIMBO' && !isMadeira;
  
  const isCopiaImpressao = activeTab === 'SERVIÇOS' && ['COPIA', 'IMPRESSÃO P/B', 'IMPRESSÃO PB', 'IMPRESSÃO COLORIDA'].includes(selectedSubCategory?.toUpperCase());
  const isCapa = activeTab === 'SERVIÇOS' && ['CAPA', 'CONTRA CAPA', 'CAPA E CONTRA CAPA', 'CAPA E CONTRA-CAPA', 'CAPA & CONTRA CAPA'].includes(selectedSubCategory?.toUpperCase());
  const isEspiral = activeTab === 'SERVIÇOS' && ['ESPIRAL'].includes(selectedSubCategory?.toUpperCase());
  const isPlastificacao = activeTab === 'SERVIÇOS' && ['PLASTIFICAÇÃO', 'POLASEAL', 'PLASTIFICAÇÃO E POLASEAL', 'PLASTIFICAÇÃO & POLASEAL'].includes(selectedSubCategory?.toUpperCase());

  const hasUpdate = appUpdateInfo && appUpdateInfo.latestVersion && appUpdateInfo.latestVersion.replace(/\s+/g, '').toLowerCase() !== CURRENT_APP_VERSION.replace(/\s+/g, '').toLowerCase() && !dismissUpdate;

  return (
    <div className="flex h-screen font-sans selection:bg-blue-600 selection:text-white overflow-hidden relative">
      
      <UploadModal 
        modalOpen={modalOpen} setModalOpen={setModalOpen} selectedTarget={selectedTarget}
        selectedFile={selectedFile} setSelectedFile={setSelectedFile} uploadMsg={uploadMsg}
        setUploadMsg={setUploadMsg} uploading={uploading} handleFileChange={handleFileChange}
        handleSendFile={handleSendFile} uploadHistory={uploadHistory}
      />

      {hasUpdate && (
        <div className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-blue-400/30 animate-bounce">
          <Sparkles className="w-6 h-6 text-yellow-300 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Atualização Disponível ({appUpdateInfo.latestVersion})</span>
            <span className="text-sm font-semibold">Baixe agora para aproveitar as melhorias!</span>
          </div>
          {appUpdateInfo.latestLink && (
            <button 
              onClick={(e) => {
                setDismissUpdate(true);
                handleExternalLink(appUpdateInfo.latestLink, e);
              }}
              className="ml-2 bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer whitespace-nowrap"
            >
              Fazer Download
            </button>
          )}
        </div>
      )}

      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-all"
        title="Menu"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)} 
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 transition-opacity"
        ></div>
      )}

      <div className="flex w-full h-full bg-slate-200 text-slate-800 dark:bg-[#0b0e14] dark:text-slate-100 transition-colors duration-300">
      <style>{`
        .page-transition { animation: slideFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideFade { 0% { opacity: 0; transform: translateY(15px) scale(0.99); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .dark ::-webkit-scrollbar-thumb { background: #1e293b; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark ::-webkit-scrollbar-thumb:hover { background: #334155; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>

      <AdminModal 
        showAdminModal={showAdminModal} setShowAdminModal={setShowAdminModal}
        adminPassword={adminPassword} setAdminPassword={setAdminPassword}
        passwordError={passwordError} handleLogin={handleLogin}
      />

      <Sidebar 
        activeTab={activeTab} setActiveTab={setActiveTab} searchTerm={searchTerm}
        setSearchTerm={setSearchTerm} theme={theme} setTheme={setTheme}
        isAdmin={isAdmin} handleGoHome={handleGoHome} handleAdminClick={handleAdminClick}
        mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
        triggerAnimation={triggerAnimation} setSelectedSubCategory={setSelectedSubCategory}
        setSelectedProductType={setSelectedProductType} setUploadStatus={setUploadStatus}
        setIsExtrasOpen={setIsExtrasOpen}
      />

      <main className="flex-1 flex flex-col min-h-screen relative scroll-smooth overflow-y-auto w-full">
        <div className="max-w-[1200px] mx-auto w-full p-4 md:p-6 flex flex-col flex-1 justify-between gap-8">
          
          <div className="flex flex-col gap-6">
            
            <Breadcrumb 
              activeTab={activeTab} selectedSubCategory={selectedSubCategory}
              selectedProductType={selectedProductType} products={products}
              handleGoHome={handleGoHome} triggerAnimation={triggerAnimation}
              setSelectedSubCategory={setSelectedSubCategory} setSelectedProductType={setSelectedProductType}
              setSearchTerm={setSearchTerm} setIsExtrasOpen={setIsExtrasOpen} searchTerm={searchTerm}
            />

            {loading ? (
              <div className="flex justify-center items-center py-32">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div key={currentViewKey} className="page-transition">
                
               {activeTab === 'HOME' && (
                  <HomeView 
                    products={products} theme={theme} searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm} formatPrice={formatPrice}
                    triggerAnimation={triggerAnimation} setActiveTab={setActiveTab}
                    setSelectedSubCategory={setSelectedSubCategory} setSelectedProductType={setSelectedProductType}
                    setIsExtrasOpen={setIsExtrasOpen}
                    calcCopiaQtd={calcCopiaQtd} setCalcCopiaQtd={setCalcCopiaQtd}
                    calcPbQtd={calcPbQtd} setCalcPbQtd={setCalcPbQtd}
                    calcColorQtd={calcColorQtd} setCalcColorQtd={setCalcColorQtd}
                  />
                )}

              {activeTab === 'CHANGELOG' && (
                <ChangelogView appUpdateInfo={appUpdateInfo} handleExternalLink={handleExternalLink} />
              )}

              {['GRÁFICA', 'CARIMBO', 'SERVIÇOS'].includes(activeTab) && !selectedSubCategory && normSearchGlobal === '' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {displaySubCats.length > 0 ? displaySubCats.map(subCat => (
                    <div 
                      key={subCat} 
                      onClick={() => { 
                        triggerAnimation(); 
                        setSelectedSubCategory(subCat); 
                        setSearchTerm(''); 
                        setIsExtrasOpen(false);
                        const isBypass = BYPASS_TYPE_SUBCATS.includes(normalizeStr(subCat));
                        const hasTypes = products.some(p => p.category?.toUpperCase().includes(activeTab) && p.subCategory === subCat && p.name?.trim() !== '');
                        if (['CARIMBO', 'SERVIÇOS'].includes(activeTab) || !hasTypes || isBypass) {
                          setSelectedProductType('TODOS');
                        } else {
                          setSelectedProductType(null);
                        }
                      }} 
                      className="relative w-full cursor-pointer group rounded-xl p-[2px] transition-all duration-500 hover:scale-[1.02]"
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover:opacity-75 blur-md transition-all duration-500 -z-10"></div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 opacity-0 group-hover:opacity-75 transition-all duration-500 -z-10"></div>
                      <div className="w-full h-full bg-white dark:bg-[#121826] group-hover:bg-slate-50 dark:group-hover:bg-[#0b0e14] border border-slate-200 dark:border-[#1e293b] group-hover:border-transparent rounded-xl flex items-center justify-center p-6 min-h-[80px] transition-colors duration-300 relative z-10">
                        <h3 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white uppercase tracking-widest text-center transition-colors">{subCat}</h3>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-12 text-center text-slate-500 font-medium text-sm">Nenhum resultado encontrado.</div>
                  )}
                </div>
              )}

              {activeTab === 'GRÁFICA' && selectedSubCategory && normSearchGlobal === '' && (!selectedProductType) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {displayTypes.length > 0 ? displayTypes.map(type => (
                    <div 
                      key={type} 
                      onClick={() => { triggerAnimation(); setSelectedProductType(type); setSearchTerm(''); setIsExtrasOpen(false); }} 
                      className="relative w-full cursor-pointer group rounded-xl p-[2px] transition-all duration-500 hover:scale-[1.02]"
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover:opacity-75 blur-md transition-all duration-500 -z-10"></div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 opacity-0 group-hover:opacity-75 transition-all duration-500 -z-10"></div>
                      <div className="w-full h-full bg-white dark:bg-[#121826] group-hover:bg-slate-50 dark:group-hover:bg-[#0b0e14] border border-slate-200 dark:border-[#1e293b] group-hover:border-transparent rounded-xl flex items-center justify-center p-6 min-h-[80px] transition-colors duration-300 relative z-10">
                        <h3 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white uppercase tracking-widest text-center transition-colors">{type}</h3>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-12 text-center text-slate-500 font-medium text-sm">Nenhum resultado encontrado.</div>
                  )}
                </div>
              )}

              {((activeTab === 'GRÁFICA' && selectedSubCategory && selectedProductType) || (['CARIMBO', 'SERVIÇOS'].includes(activeTab) && selectedSubCategory)) && (
                <div className="flex flex-col gap-6">
                  
                  <AcabamentosExtras 
                    activeTab={activeTab} selectedSubCategory={selectedSubCategory}
                    selectedProductType={selectedProductType}
                  />

                  {activeTab === 'SERVIÇOS' && <ServiceCalculator subCat={selectedSubCategory} formatPrice={formatPrice} />}

                  <ProductTable 
                    activeTab={activeTab} searchTerm={searchTerm}
                    selectedSubCategory={selectedSubCategory} selectedProductType={selectedProductType}
                    isMadeira={isMadeira} isAutomatico={isAutomatico}
                    isCopiaImpressao={isCopiaImpressao} isCapa={isCapa}
                    isEspiral={isEspiral} isPlastificacao={isPlastificacao}
                    formatPrice={formatPrice} getFinalProducts={getFinalProducts}
                    getProcessedGraficaProducts={getProcessedGraficaProducts}
                    isPanfletoOrSimilarSubCategory={isPanfletoOrSimilarSubCategory}
                  />
                </div>
              )}

              {activeTab === 'FORNECEDORES' && (
                <SuppliersView getFinalSuppliers={getFinalSuppliers} />
              )}

              {activeTab === 'CONTROLE_HORAS' && (
                <HoursControlView 
                  hoursData={hoursData} loadingHours={loadingHours}
                  handlePrint={handlePrint} fetchSheetData={fetchSheetData}
                  getHourTagClass={getHourTagClass}
                />
              )}

              {activeTab === 'ESCALA_FOLGAS' && (
                <FolgasView 
                  futureFolgas={futureFolgas} loadingHours={loadingHours}
                  handlePrint={handlePrint} fetchSheetData={fetchSheetData}
                />
              )}

              {activeTab === 'CONSULTAS' && (
                <ConsultasView 
                  consultaType={consultaType} setConsultaType={setConsultaType}
                  consultaInput={consultaInput} setConsultaInput={setConsultaInput}
                  consultaResult={consultaResult} setConsultaResult={setConsultaResult}
                  consultaLoading={consultaLoading} consultaError={consultaError}
                  setConsultaError={setConsultaError} handleConsulta={handleConsulta}
                  handlePrintConsulta={handlePrintConsulta} formatPrice={formatPrice}
                  handleExternalLink={handleExternalLink}
                />
              )}

              {activeTab === 'DOWNLOADS' && (
                <DownloadsView handleExternalLink={handleExternalLink} />
              )}

              {activeTab === 'UPLOADS' && (
                <UploadsView 
                  activeStore={activeStore} setActiveStore={setActiveStore}
                  uploadTargets={uploadTargets}
                  setSelectedTarget={setSelectedTarget} setModalOpen={setModalOpen}
                  setSelectedFile={setSelectedFile} setUploadMsg={setUploadMsg}
                />
              )}

              {activeTab === 'ADMIN' && (
                <AdminView 
                  handleProductUpload={handleProductUpload}
                  handleSupplierUpload={handleSupplierUpload}
                  handleUpdateUpload={handleUpdateUpload}
                  loadingUpload={loadingUpload} uploadStatus={uploadStatus}
                />
              )}

            </div>
          )}
        </div>

          <div className="mt-auto pt-8 pb-4 flex justify-center items-center w-full">
            <a 
              href="https://github.com/mrenanpx" 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={(e) => handleExternalLink("https://github.com/mrenanpx", e)}
              className="flex items-center gap-2 py-1.5 px-4 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 active:bg-emerald-100 dark:active:bg-emerald-500/10 active:text-emerald-700 dark:active:text-emerald-400 rounded-lg transition-all cursor-pointer group"
            >
              <svg className="w-4 h-4 fill-current opacity-60 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span className="tracking-wide">mrenanpx ({CURRENT_APP_VERSION})</span>
            </a>
          </div>

        </div>
      </main>
      </div>
    </div>
  );
}
