import { useState } from 'react';
import { Truck, ChevronDown, ChevronUp, Info, DollarSign, Percent, MapPin, AlertTriangle, Calculator } from 'lucide-react';
import { toast } from 'sonner';

// ==================== CONSTANTES LEGAIS ICMS BAHIA 2026 ====================
const ALIQUOTAS_INTERNAS_BA = {
  geral: 0.18,
  essencial: 0.17,
  combustivel: 0.27,
  lubrificante: 0.29
};

const ALIQUOTAS_INTERESTADUAIS = {
  '7': 0.07,  // Sul/Sudeste → Norte/Nordeste/CO
  '12': 0.12  // Demais combinações
};

const CFOPS_PRINCIPAIS = [
  { codigo: '5102', descricao: 'Venda mercadoria adquirida de terceiro (dentro UF)', operacao: 'venda', tipo: 'interna' },
  { codigo: '5405', descricao: 'Venda mercadoria produzida pelo estabelecimento (dentro UF)', operacao: 'venda', tipo: 'interna' },
  { codigo: '6102', descricao: 'Venda mercadoria adquirida de terceiro (fora UF)', operacao: 'venda', tipo: 'interestadual' },
  { codigo: '6404', descricao: 'Venda mercadoria produzida pelo estabelecimento (fora UF)', operacao: 'venda', tipo: 'interestadual' },
  { codigo: '5403', descricao: 'Saída para industrialização (dentro UF)', operacao: 'remessa', tipo: 'interna' },
  { codigo: '5401', descricao: 'Remessa para consignação (dentro UF)', operacao: 'remessa', tipo: 'interna' },
  { codigo: '5408', descricao: 'Devolução de mercadoria (dentro UF)', operacao: 'devolucao', tipo: 'interna' },
  { codigo: '5206', descricao: 'Lançamento débito ICMS por substituição tributária', operacao: 'st', tipo: 'interna' },
  { codigo: '6108', descricao: 'Devolução de mercadoria (fora UF)', operacao: 'devolucao', tipo: 'interestadual' },
  { codigo: '5949', descricao: 'Outra saída de mercadoria', operacao: 'outros', tipo: 'interna' }
];

// Regras específicas ICMS BA 2026
const REGIMES_ESPECIAIS_BA = [
  { value: 'normal', label: 'Regime Normal (Débito/Crédito)', descricao: 'Apuração normal com crédito de ICMS' },
  { value: 'simples', label: 'Simples Nacional', descricao: 'ICMS unificado no DAS (não calcula separado)' },
  { value: 'substituto', label: 'Substituto Tributário', descricao: 'Responsável por reter ICMS-ST' }
];

// ==================== FUNÇÕES DE CÁLCULO ====================

function calcularICMSInterno(valorOperacao, aliquota, isFundoPobre = false) {
  const icms = valorOperacao * aliquota;
  // Fundo de combate à pobreza (FCP) - adicional 2% na BA para alguns produtos
  const fcp = isFundoPobre ? valorOperacao * 0.02 : 0;

  return {
    baseCalculo: Math.round(valorOperacao * 100) / 100,
    aliquota: aliquota * 100,
    icms: Math.round(icms * 100) / 100,
    fcp: Math.round(fcp * 100) / 100,
    total: Math.round((icms + fcp) * 100) / 100
  };
}

function calcularDIFAL(valorOperacao, aliquotaInterna, aliquotaInterestadual, consumidorFinal) {
  const diffAliquota = aliquotaInterna - aliquotaInterestadual;

  // Partilha: 2026 → 40% origem / 60% destino (contribuinte)
  // 100% destino (consumidor final)
  const percentualDestino = consumidorFinal ? 1.0 : 0.60;
  const percentualOrigem = 1 - percentualDestino;

  const baseDIFAL = valorOperacao * diffAliquota;
  const difalDestino = baseDIFAL * percentualDestino;
  const difalOrigem = baseDIFAL * percentualOrigem;

  return {
    aliquotaInterna: aliquotaInterna * 100,
    aliquotaInterestadual: aliquotaInterestadual * 100,
    diffAliquota: diffAliquota * 100,
    baseDIFAL: Math.round(baseDIFAL * 100) / 100,
    difalDestino: Math.round(difalDestino * 100) / 100,
    difalOrigem: Math.round(difalOrigem * 100) / 100,
    consumidorFinal
  };
}

function calcularST(valorOperacao, mva, aliquotaInterna, icmsProprio) {
  // Base ST = Valor Operação × (1 + MVA)
  const baseST = valorOperacao * (1 + mva);

  // ICMS ST = (Base ST × Alíquota Interna) - ICMS Próprio
  const icmsST = (baseST * aliquotaInterna) - icmsProprio;

  return {
    baseST: Math.round(baseST * 100) / 100,
    mva: mva * 100,
    icmsST: Math.round(Math.max(0, icmsST) * 100) / 100
  };
}

function calcularCreditoICMS(valorOperacao, aliquota) {
  const credito = valorOperacao * aliquota;
  return {
    base: Math.round(valorOperacao * 100) / 100,
    aliquota: aliquota * 100,
    credito: Math.round(credito * 100) / 100
  };
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function CalculadoraICMSBahiaCompleta() {
  const [expandedSections, setExpandedSections] = useState({
    operacao: true,
    tipoOperacao: true,
    diferencial: false,
    substituicao: false,
    credito: false
  });

  const [formData, setFormData] = useState({
    valorOperacao: '',
    tipoOperacao: 'venda',
    cfop: '5102',
    regimeEspecial: 'normal',
    tipoMercadoria: 'geral',
    aliquotaInterna: 0.18,
    aliquotaInterestadual: 0.07,
    ufDestino: '',
    ufOrigem: 'BA',
    isConsumidorFinal: false,
    calcularDIFAL: false,
    calcularST: false,
    mva: 0,
    calcularCredito: false,
    isFundoPobre: false,
    valorCreditoAnterior: ''
  });

  const [resultado, setResultado] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Auto-set aliquota based on tipo mercadoria
      if (field === 'tipoMercadoria' && value) {
        newData.aliquotaInterna = ALIQUOTAS_INTERNAS_BA[value];
      }

      // Auto-set interestadual based on destination
      if (field === 'ufDestino' && value) {
        const estadosNorteNordesteCO = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'MA', 'PA', 'PB', 'PE', 'PI', 'RN', 'RO', 'RR', 'SE', 'TO', 'DF', 'GO', 'MS', 'MT'];
        if (estadosNorteNordesteCO.includes(value)) {
          newData.aliquotaInterestadual = 0.07;
        } else {
          newData.aliquotaInterestadual = 0.12;
        }
      }

      // Auto-set CFOP
      if (field === 'tipoOperacao') {
        if (value === 'venda') newData.cfop = formData.ufDestino ? '6102' : '5102';
        else if (value === 'devolucao') newData.cfop = formData.ufDestino ? '6108' : '5408';
        else newData.cfop = '5949';
      }

      return newData;
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const calcular = () => {
    if (!formData.valorOperacao) {
      toast.error('Informe o valor da operação.');
      return;
    }

    const valor = parseFloat(formData.valorOperacao);
    const cfopInfo = CFOPS_PRINCIPAIS.find(c => c.codigo === formData.cfop);

    let resultadoParcial = {
      cfop: cfopInfo,
      valorOperacao: valor,
      tipoOperacao: formData.tipoOperacao,
      regime: formData.regimeEspecial
    };

    // Se Simples Nacional, não calcula ICMS separado
    if (formData.regimeEspecial === 'simples') {
      resultadoParcial.simplesNacional = true;
      resultadoParcial.mensagem = 'ICMS unificado no DAS. Não há cálculo separado.';
      setResultado(resultadoParcial);
      toast.success('Cálculo para Simples Nacional informado.');
      return;
    }

    // ICMS Interno
    resultadoParcial.icmsInterno = calcularICMSInterno(
      valor,
      formData.aliquotaInterna,
      formData.isFundoPobre
    );

    // DIFAL
    if (formData.calcularDIFAL) {
      resultadoParcial.difal = calcularDIFAL(
        valor,
        formData.aliquotaInterna,
        formData.aliquotaInterestadual,
        formData.isConsumidorFinal
      );
    }

    // Substituição Tributária
    if (formData.calcularST) {
      const mva = parseFloat(formData.mva) / 100;
      resultadoParcial.st = calcularST(
        valor,
        mva,
        formData.aliquotaInterna,
        resultadoParcial.icmsInterno.icms
      );
    }

    // Crédito ICMS
    if (formData.calcularCredito) {
      resultadoParcial.credito = calcularCreditoICMS(valor, formData.aliquotaInterna);
    }

    // Totais
    const icmsDebito = resultadoParcial.icmsInterno.total;
    const icmsCredito = resultadoParcial.credito?.credito || 0;
    const icmsST = resultadoParcial.st?.icmsST || 0;
    const difal = resultadoParcial.difal?.difalDestino || 0;

    resultadoParcial.resumo = {
      debitoICMS: icmsDebito,
      creditoICMS: icmsCredito,
      icmsST,
      difal,
      totalRecolher: Math.round((icmsDebito - icmsCredito + icmsST + difal) * 100) / 100
    };

    setResultado(resultadoParcial);
    toast.success('ICMS calculado com sucesso!');
  };

  const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const TIPO_MERCADORIA = [
    { value: 'geral', label: 'Geral (18%)', aliquota: 0.18 },
    { value: 'essencial', label: 'Essencial (17%)', aliquota: 0.17 },
    { value: 'combustivel', label: 'Combustível (27%)', aliquota: 0.27 },
    { value: 'lubrificante', label: 'Lubrificante (29%)', aliquota: 0.29 }
  ];

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Calculadora ICMS Bahia 2026</h1>
            <p className="text-slate-500">Cálculo completo: interno, DIFAL, Substituição Tributária, créditos e regras específicas da BA.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dados da Operação */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('operacao')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">💰 Dados da Operação</h2>
              {expandedSections.operacao ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.operacao && (
              <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Valor da Operação (R$)</label>
                  <input type="number" value={formData.valorOperacao} onChange={(e) => handleChange('valorOperacao', e.target.value)}
                    placeholder="Ex: 10.000,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tipo de Mercadoria</label>
                  <select value={formData.tipoMercadoria} onChange={(e) => handleChange('tipoMercadoria', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                    {TIPO_MERCADORIA.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Regime Especial</label>
                  <select value={formData.regimeEspecial} onChange={(e) => handleChange('regimeEspecial', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                    {REGIMES_ESPECIAIS_BA.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Alíquota Interna (%)</label>
                  <input type="number" value={formData.aliquotaInterna * 100} onChange={(e) => handleChange('aliquotaInterna', parseFloat(e.target.value) / 100)}
                    min="0" max="100" step="0.5" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  <p className="text-xs text-slate-500 mt-1">Auto-ajustado pelo tipo de mercadoria</p>
                </div>
              </div>
            )}
          </div>

          {/* Tipo de Operação */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('tipoOperacao')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">📋 Tipo de Operação</h2>
              {expandedSections.tipoOperacao ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.tipoOperacao && (
              <div className="p-5 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className={`flex flex-col p-4 rounded-xl cursor-pointer border-2 ${
                    formData.tipoOperacao === 'venda' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <input type="radio" name="tipoOperacao" checked={formData.tipoOperacao === 'venda'}
                      onChange={() => handleChange('tipoOperacao', 'venda')} className="mb-2 w-4 h-4" />
                    <p className="text-sm font-bold text-slate-800">Venda</p>
                    <p className="text-xs text-slate-500">Saída de mercadoria</p>
                  </label>
                  <label className={`flex flex-col p-4 rounded-xl cursor-pointer border-2 ${
                    formData.tipoOperacao === 'devolucao' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <input type="radio" name="tipoOperacao" checked={formData.tipoOperacao === 'devolucao'}
                      onChange={() => handleChange('tipoOperacao', 'devolucao')} className="mb-2 w-4 h-4" />
                    <p className="text-sm font-bold text-slate-800">Devolução</p>
                    <p className="text-xs text-slate-500">Retorno de mercadoria</p>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">CFOP</label>
                    <select value={formData.cfop} onChange={(e) => handleChange('cfop', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                      {CFOPS_PRINCIPAIS.map(c => (
                        <option key={c.codigo} value={c.codigo}>{c.codigo} - {c.descricao}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">UF Origem</label>
                    <select value={formData.ufOrigem} onChange={(e) => handleChange('ufOrigem', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                      <option value="BA">Bahia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">UF Destino</label>
                    <select value={formData.ufDestino} onChange={(e) => handleChange('ufDestino', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                      <option value="">Selecione...</option>
                      {['BA', 'SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'PE', 'CE', 'MA', 'PA', 'GO', 'DF', 'AM', 'MT', 'MS', 'AL', 'PB', 'RN', 'PI', 'SE', 'TO', 'RO', 'AC', 'AP', 'RR'].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.ufDestino && formData.ufDestino !== 'BA' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Alíquota Interestadual (%)</label>
                      <select value={formData.aliquotaInterestadual * 100} onChange={(e) => handleChange('aliquotaInterestadual', parseFloat(e.target.value) / 100)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                        <option value={7}>7% (Norte/Nordeste/CO)</option>
                        <option value={12}>12% (Demais)</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={formData.isConsumidorFinal}
                        onChange={(e) => handleChange('isConsumidorFinal', e.target.checked)} />
                      <span className="text-sm font-bold text-slate-700">Consumidor Final?</span>
                    </label>
                  </div>
                )}

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.calcularDIFAL}
                    onChange={(e) => handleChange('calcularDIFAL', e.target.checked)} />
                  <span className="text-sm font-bold text-slate-700">Calcular DIFAL (Diferencial de Alíquota)</span>
                </label>
              </div>
            )}
          </div>

          {/* Substituição Tributária */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('substituicao')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">🔄 Substituição Tributária</h2>
              {expandedSections.substituicao ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.substituicao && (
              <div className="p-5 pt-0 space-y-4">
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.calcularST}
                    onChange={(e) => handleChange('calcularST', e.target.checked)} />
                  <span className="text-sm font-bold text-slate-700">Calcular ICMS-ST</span>
                </label>
                {formData.calcularST && (
                  <div className="ml-6">
                    <label className="block text-sm font-bold text-slate-700 mb-1">MVA (%)</label>
                    <input type="number" value={formData.mva} onChange={(e) => handleChange('mva', e.target.value)}
                      placeholder="Ex: 50" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                    <p className="text-xs text-slate-500 mt-1">Margem de Valor Adicionado (definida por convênio/protocolo)</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Créditos */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('credito')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">💳 Créditos de ICMS</h2>
              {expandedSections.credito ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.credito && (
              <div className="p-5 pt-0 space-y-4">
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.calcularCredito}
                    onChange={(e) => handleChange('calcularCredito', e.target.checked)} />
                  <span className="text-sm font-bold text-slate-700">Calcular Crédito de ICMS (entrada)</span>
                </label>
                {formData.calcularCredito && (
                  <div className="ml-6">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Valor Crédito Anterior (R$)</label>
                    <input type="number" value={formData.valorCreditoAnterior} onChange={(e) => handleChange('valorCreditoAnterior', e.target.value)}
                      placeholder="Créditos acumulados" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botão */}
          <button onClick={calcular}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-orange-500/20">
            <Calculator size={18} className="inline mr-2" /> Calcular ICMS
          </button>
        </div>

        {/* Resultado */}
        <div className="lg:col-span-1">
          {resultado ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sticky top-4 space-y-4">
              <h2 className="text-lg font-bold text-slate-800">Resultado</h2>

              {resultado.simplesNacional ? (
                <div className="p-4 bg-green-50 rounded-xl text-center">
                  <p className="text-sm font-bold text-green-800">Simples Nacional</p>
                  <p className="text-xs text-green-600 mt-1">{resultado.mensagem}</p>
                </div>
              ) : (
                <>
                  {/* CFOP */}
                  {resultado.cfop && (
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-600 font-bold mb-1">📋 CFOP: {resultado.cfop.codigo}</p>
                      <p className="text-xs text-slate-500">{resultado.cfop.descricao}</p>
                    </div>
                  )}

                  {/* ICMS Interno */}
                  {resultado.icmsInterno && (
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <p className="text-xs text-blue-600 font-bold mb-2">🏛️ ICMS Interno</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Base Cálculo</span><span className="font-bold">{formatarMoeda(resultado.icmsInterno.baseCalculo)}</span></div>
                        <div className="flex justify-between"><span>Alíquota</span><span className="font-bold">{resultado.icmsInterno.aliquota}%</span></div>
                        <div className="flex justify-between"><span>ICMS</span><span className="font-bold">{formatarMoeda(resultado.icmsInterno.icms)}</span></div>
                        {resultado.icmsInterno.fcp > 0 && (
                          <div className="flex justify-between"><span>FCP (2%)</span><span className="font-bold">{formatarMoeda(resultado.icmsInterno.fcp)}</span></div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DIFAL */}
                  {resultado.difal && (
                    <div className="p-3 bg-amber-50 rounded-xl">
                      <p className="text-xs text-amber-600 font-bold mb-2">🔄 DIFAL</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Diff Alíquotas</span><span className="font-bold">{resultado.difal.diffAliquota.toFixed(1)}%</span></div>
                        <div className="flex justify-between"><span>Base DIFAL</span><span className="font-bold">{formatarMoeda(resultado.difal.baseDIFAL)}</span></div>
                        <div className="flex justify-between"><span>Destino ({resultado.difal.consumidorFinal ? '100%' : '60%'})</span><span className="font-bold text-amber-600">{formatarMoeda(resultado.difal.difalDestino)}</span></div>
                        {!resultado.difal.consumidorFinal && (
                          <div className="flex justify-between"><span>Origem (40%)</span><span className="font-bold">{formatarMoeda(resultado.difal.difalOrigem)}</span></div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ST */}
                  {resultado.st && (
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <p className="text-xs text-purple-600 font-bold mb-2">🔄 Substituição Tributária</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Base ST (MVA {resultado.st.mva}%)</span><span className="font-bold">{formatarMoeda(resultado.st.baseST)}</span></div>
                        <div className="flex justify-between"><span>ICMS-ST</span><span className="font-bold">{formatarMoeda(resultado.st.icmsST)}</span></div>
                      </div>
                    </div>
                  )}

                  {/* Crédito */}
                  {resultado.credito && (
                    <div className="p-3 bg-green-50 rounded-xl">
                      <p className="text-xs text-green-600 font-bold mb-2">💳 Crédito de ICMS</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Crédito</span><span className="font-bold">{formatarMoeda(resultado.credito.credito)}</span></div>
                      </div>
                    </div>
                  )}

                  {/* Resumo */}
                  {resultado.resumo && (
                    <div className="border-t pt-3">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Débito ICMS</span><span className="font-bold">{formatarMoeda(resultado.resumo.debitoICMS)}</span></div>
                        {resultado.resumo.creditoICMS > 0 && (
                          <div className="flex justify-between"><span>Crédito ICMS</span><span className="font-bold text-green-600">-{formatarMoeda(resultado.resumo.creditoICMS)}</span></div>
                        )}
                        {resultado.resumo.icmsST > 0 && (
                          <div className="flex justify-between"><span>ICMS-ST</span><span className="font-bold">{formatarMoeda(resultado.resumo.icmsST)}</span></div>
                        )}
                        {resultado.resumo.difal > 0 && (
                          <div className="flex justify-between"><span>DIFAL</span><span className="font-bold">{formatarMoeda(resultado.resumo.difal)}</span></div>
                        )}
                      </div>
                      <div className="bg-orange-50 rounded-xl p-4 mt-3">
                        <div className="flex justify-between">
                          <span className="font-black text-slate-800">TOTAL A RECOLHER</span>
                          <span className="font-black text-orange-600 text-xl">{formatarMoeda(resultado.resumo.totalRecolher)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center sticky top-4">
              <Truck size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Preencha os dados</h3>
              <p className="text-sm text-slate-500">Configure a operação e clique em calcular.</p>
            </div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-orange-800">Base Legal Atualizada 2026 - Bahia</p>
          <p className="text-xs text-orange-700 mt-1">
            LC 87/96 (Lei Kandir), RICMS/BA (Dec. 6.284/1997), Convênios CONFAZ, Protocolos ICMS BA.
            Alíquotas internas BA: Geral 18%, Essencial 17%, Combustível 27%, Lubrificante 29%.
            DIFAL: EC 87/2015 (partilha 40/60% contribuinte, 100% consumidor final em 2026).
            FCP: Fundo de Combate à Pobreza (2% adicional). MVA definida por protocolo/convênio.
          </p>
        </div>
      </div>
    </div>
  );
}
