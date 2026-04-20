import { useState } from 'react';
import { Building2, ChevronDown, ChevronUp, Info, DollarSign, Percent, FileText, AlertTriangle, Calculator } from 'lucide-react';
import { toast } from 'sonner';

// ==================== CONSTANTES LEGAIS 2026 ====================
const ISS_MINIMO = 0.02;
const ISS_MAXIMO = 0.05;
const LIMITE_RETENCAO = 0; // Depende do município

// Lista LC 116/2003 - principais serviços
const LISTA_SERVICOS_LC116 = [
  { codigo: '1.01', descricao: 'Análise e desenvolvimento de sistemas', aliquotaPadrao: 0.05 },
  { codigo: '1.02', descricao: 'Programação computacional', aliquotaPadrao: 0.05 },
  { codigo: '1.03', descricao: 'Processamento de dados', aliquotaPadrao: 0.05 },
  { codigo: '1.04', descricao: 'Elaboração de programas de computador', aliquotaPadrao: 0.05 },
  { codigo: '1.05', descricao: 'Licenciamento de software', aliquotaPadrao: 0.05 },
  { codigo: '2.01', descricao: 'Consultoria e assessoria técnica', aliquotaPadrao: 0.05 },
  { codigo: '3.01', descricao: 'Construção civil', aliquotaPadrao: 0.05, deducaoMateriais: true },
  { codigo: '3.02', descricao: 'Reforma e ampliação', aliquotaPadrao: 0.05, deducaoMateriais: true },
  { codigo: '3.03', descricao: 'Demolição e terraplenagem', aliquotaPadrao: 0.05 },
  { codigo: '3.04', descricao: 'Instalações elétricas e hidráulicas', aliquotaPadrao: 0.05 },
  { codigo: '3.05', descricao: 'Acabamento e pintura', aliquotaPadrao: 0.05 },
  { codigo: '4.01', descricao: 'Limpeza e conservação', aliquotaPadrao: 0.05 },
  { codigo: '4.02', descricao: 'Vigilância e segurança', aliquotaPadrao: 0.05 },
  { codigo: '4.03', descricao: 'Locação de mão de obra', aliquotaPadrao: 0.05 },
  { codigo: '5.01', descricao: 'Administração de imóveis', aliquotaPadrao: 0.05 },
  { codigo: '5.02', descricao: 'Corretagem de imóveis', aliquotaPadrao: 0.05 },
  { codigo: '6.01', descricao: 'Contabilidade e auditoria', aliquotaPadrao: 0.05 },
  { codigo: '6.02', descricao: 'Advocacia', aliquotaPadrao: 0.05 },
  { codigo: '6.03', descricao: 'Engenharia e arquitetura', aliquotaPadrao: 0.05 },
  { codigo: '6.04', descricao: 'Publicidade e propaganda', aliquotaPadrao: 0.05 },
  { codigo: '7.01', descricao: 'Transporte de carga', aliquotaPadrao: 0.05 },
  { codigo: '7.02', descricao: 'Transporte de passageiros', aliquotaPadrao: 0.05 },
  { codigo: '8.01', descricao: 'Locação de veículos', aliquotaPadrao: 0.05 },
  { codigo: '9.01', descricao: 'Manutenção de veículos', aliquotaPadrao: 0.05 },
  { codigo: '10.01', descricao: 'Ensino e treinamento', aliquotaPadrao: 0.05 },
  { codigo: '11.01', descricao: 'Médicos e dentistas', aliquotaPadrao: 0.05 },
  { codigo: '11.02', descricao: 'Hospitais e clínicas', aliquotaPadrao: 0.05 },
  { codigo: '12.01', descricao: 'Laboratórios de análises', aliquotaPadrao: 0.05 },
  { codigo: '13.01', descricao: 'Eventos e organização', aliquotaPadrao: 0.05 },
  { codigo: '14.01', descricao: 'Fotografia e filmagem', aliquotaPadrao: 0.05 },
  { codigo: '15.01', descricao: 'Telecomunicações', aliquotaPadrao: 0.05 },
  { codigo: '16.01', descricao: 'Agenciamento de cargas', aliquotaPadrao: 0.05 },
  { codigo: '17.01', descricao: 'Intermediação de negócios', aliquotaPadrao: 0.05 },
  { codigo: '18.01', descricao: 'Tradução e interpretação', aliquotaPadrao: 0.05 },
  { codigo: '19.01', descricao: 'Pesquisa e desenvolvimento', aliquotaPadrao: 0.05 }
];

// ==================== FUNÇÕES DE CÁLCULO ====================

function calcularISSBase(valorServico, deducaoMateriais, percentualDeducao) {
  const valorDeducao = valorServico * (percentualDeducao / 100);
  const baseCalculo = Math.max(0, valorServico - valorDeducao);
  return {
    valorServico,
    deducao: Math.round(valorDeducao * 100) / 100,
    baseCalculo: Math.round(baseCalculo * 100) / 100
  };
}

function calcularISS(baseCalculo, aliquota) {
  const iss = baseCalculo * aliquota;
  return {
    baseCalculo: Math.round(baseCalculo * 100) / 100,
    aliquota: aliquota * 100,
    iss: Math.round(iss * 100) / 100
  };
}

function calcularRetencao(iss, tomadorPessoaJuridica) {
  if (!tomadorPessoaJuridica) return { retido: false, valor: 0 };

  return {
    retido: true,
    valor: Math.round(iss * 100) / 100
  };
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function CalculadoraISSCompleta() {
  const [expandedSections, setExpandedSections] = useState({
    dadosServico: true,
    tipoServico: true,
    retencao: false,
    deducao: false
  });

  const [formData, setFormData] = useState({
    valorServico: '',
    codigoServico: '1.01',
    aliquotaPersonalizada: '',
    municipioPrestador: '',
    municipioTomador: '',
    tomadorPessoaJuridica: true,
    retemISS: true,
    deducaoMateriais: false,
    percentualDeducao: 0,
    valorMateriais: '',
    calcularCSLL: true,
    calcularPIS: true,
    calcularCOFINS: true,
    aliquotaCSLL: 0.04,
    aliquotaPIS: 0.0065,
    aliquotaCOFINS: 0.03
  });

  const [resultado, setResultado] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Auto-set deducao materiais when construction service selected
      if (field === 'codigoServico') {
        const servico = LISTA_SERVICOS_LC116.find(s => s.codigo === value);
        if (servico?.deducaoMateriais) {
          newData.deducaoMateriais = true;
          newData.percentualDeducao = 50; // default for construction
        } else {
          newData.deducaoMateriais = false;
          newData.percentualDeducao = 0;
        }
      }

      return newData;
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const calcular = () => {
    if (!formData.valorServico) {
      toast.error('Informe o valor do serviço.');
      return;
    }

    const valorServico = parseFloat(formData.valorServico);
    const servico = LISTA_SERVICOS_LC116.find(s => s.codigo === formData.codigoServico);
    const aliquota = formData.aliquotaPersonalizada
      ? parseFloat(formData.aliquotaPersonalizada) / 100
      : (servico?.aliquotaPadrao || 0.05);

    // Base de cálculo
    const baseData = calcularISSBase(
      valorServico,
      formData.deducaoMateriais,
      formData.percentualDeducao
    );

    // ISS
    const issData = calcularISS(baseData.baseCalculo, aliquota);

    // Retenção
    const retencaoData = calcularRetencao(issData.iss, formData.tomadorPessoaJuridica && formData.retemISS);

    // Impostos retidos na fonte (para pessoa jurídica)
    let csllRetida = 0;
    let pisRetido = 0;
    let cofinsRetida = 0;

    if (formData.tomadorPessoaJuridica && formData.retemISS) {
      if (formData.calcularCSLL) {
        csllRetida = valorServico * formData.aliquotaCSLL;
      }
      if (formData.calcularPIS) {
        pisRetido = valorServico * formData.aliquotaPIS;
      }
      if (formData.calcularCOFINS) {
        cofinsRetida = valorServico * formData.aliquotaCOFINS;
      }
    }

    // Total retido
    const totalRetido = retencaoData.valor + csllRetida + pisRetido + cofinsRetida;
    const liquidoReceber = valorServico - totalRetido;

    setResultado({
      servico,
      baseCalculo: baseData,
      iss: issData,
      retencao: retencaoData,
      impostosRetidos: {
        csll: csllRetida,
        pis: pisRetido,
        cofins: cofinsRetida,
        iss: retencaoData.valor,
        total: totalRetido
      },
      liquidoReceber: Math.round(liquidoReceber * 100) / 100,
      aliquotaEfetiva: valorServico > 0 ? (issData.iss / valorServico) * 100 : 0
    });

    toast.success('ISS calculado com sucesso!');
  };

  const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 text-purple-600 p-3 rounded-2xl">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Calculadora de ISS Retenção 2026</h1>
            <p className="text-slate-500">Cálculo completo com retenção na fonte, dedução de materiais e impostos retidos (CSLL, PIS, COFINS).</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dados do Serviço */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('dadosServico')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                💰 Dados do Serviço
              </h2>
              {expandedSections.dadosServico ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.dadosServico && (
              <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Valor do Serviço (R$)</label>
                  <input type="number" value={formData.valorServico} onChange={(e) => handleChange('valorServico', e.target.value)}
                    placeholder="Ex: 10.000,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Município do Prestador</label>
                  <input type="text" value={formData.municipioPrestador} onChange={(e) => handleChange('municipioPrestador', e.target.value)}
                    placeholder="Ex: Salvador/BA" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Município do Tomador</label>
                  <input type="text" value={formData.municipioTomador} onChange={(e) => handleChange('municipioTomador', e.target.value)}
                    placeholder="Ex: São Paulo/SP" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
              </div>
            )}
          </div>

          {/* Tipo de Serviço */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('tipoServico')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                📋 Tipo de Serviço (LC 116/2003)
              </h2>
              {expandedSections.tipoServico ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.tipoServico && (
              <div className="p-5 pt-0 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Código do Serviço</label>
                  <select value={formData.codigoServico} onChange={(e) => handleChange('codigoServico', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                    {LISTA_SERVICOS_LC116.map(s => (
                      <option key={s.codigo} value={s.codigo}>{s.codigo} - {s.descricao}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Alíquota ISS (%)</label>
                  <input type="number" value={formData.aliquotaPersonalizada || ''} onChange={(e) => handleChange('aliquotaPersonalizada', e.target.value)}
                    placeholder={`Padrão: ${(LISTA_SERVICOS_LC116.find(s => s.codigo === formData.codigoServico)?.aliquotaPadrao * 100).toFixed(0)}% (2-5%)`}
                    min="2" max="5" step="0.5" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  <p className="text-xs text-slate-500 mt-1">Deixe vazio para usar alíquota padrão. Mínimo 2%, máximo 5% (LC 116/2003).</p>
                </div>
              </div>
            )}
          </div>

          {/* Retenção */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('retencao')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                🏢 Retenção na Fonte
              </h2>
              {expandedSections.retencao ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.retencao && (
              <div className="p-5 pt-0 space-y-4">
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.tomadorPessoaJuridica}
                    onChange={(e) => handleChange('tomadorPessoaJuridica', e.target.checked)} />
                  <div>
                    <span className="text-sm font-bold text-slate-700">Tomador é Pessoa Jurídica?</span>
                    <p className="text-xs text-slate-500">Retenção obrigatória para PJ (Lei 9.718/98, IN 1.234/2012)</p>
                  </div>
                </label>

                {formData.tomadorPessoaJuridica && (
                  <>
                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={formData.retemISS}
                        onChange={(e) => handleChange('retemISS', e.target.checked)} />
                      <span className="text-sm font-bold text-slate-700">Reter ISS na fonte</span>
                    </label>

                    <div className="p-4 bg-blue-50 rounded-xl space-y-3">
                      <h3 className="text-sm font-bold text-blue-800">Impostos Retidos na Fonte</h3>

                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.calcularCSLL}
                          onChange={(e) => handleChange('calcularCSLL', e.target.checked)} />
                        <span className="text-sm font-bold text-slate-700">CSLL ({(formData.aliquotaCSLL * 100).toFixed(1)}%)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.calcularPIS}
                          onChange={(e) => handleChange('calcularPIS', e.target.checked)} />
                        <span className="text-sm font-bold text-slate-700">PIS ({(formData.aliquotaPIS * 100).toFixed(2)}%)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.calcularCOFINS}
                          onChange={(e) => handleChange('calcularCOFINS', e.target.checked)} />
                        <span className="text-sm font-bold text-slate-700">COFINS ({(formData.aliquotaCOFINS * 100).toFixed(1)}%)</span>
                      </label>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Dedução Materiais */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('deducao')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                📦 Dedução de Materiais (Construção Civil)
              </h2>
              {expandedSections.deducao ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.deducao && (
              <div className="p-5 pt-0 space-y-4">
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.deducaoMateriais}
                    onChange={(e) => handleChange('deducaoMateriais', e.target.checked)} />
                  <div>
                    <span className="text-sm font-bold text-slate-700">Aplicar dedução de materiais?</span>
                    <p className="text-xs text-slate-500">Construção civil: materiais agregados permanentemente à obra</p>
                  </div>
                </label>

                {formData.deducaoMateriais && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">% Dedução</label>
                      <input type="number" value={formData.percentualDeducao} onChange={(e) => handleChange('percentualDeducao', parseFloat(e.target.value))}
                        min="0" max="100" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Valor Materiais (R$)</label>
                      <input type="number" value={formData.valorMateriais} onChange={(e) => handleChange('valorMateriais', e.target.value)}
                        placeholder="Ex: 5.000,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botão Calcular */}
          <button onClick={calcular}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-purple-500/20">
            <Calculator size={18} className="inline mr-2" /> Calcular ISS
          </button>
        </div>

        {/* Resultado */}
        <div className="lg:col-span-1">
          {resultado ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sticky top-4 space-y-4">
              <h2 className="text-lg font-bold text-slate-800">Resultado</h2>

              {/* Serviço */}
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 font-bold mb-1">📋 Serviço</p>
                <p className="text-sm font-bold text-slate-800">{resultado.servico.codigo} - {resultado.servico.descricao}</p>
                <p className="text-xs text-slate-500">Valor: {formatarMoeda(formData.valorServico)}</p>
              </div>

              {/* Base de Cálculo */}
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 font-bold mb-2">📊 Base de Cálculo</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Valor Serviço</span><span className="font-bold">{formatarMoeda(resultado.baseCalculo.valorServico)}</span></div>
                  {resultado.baseCalculo.deducao > 0 && (
                    <div className="flex justify-between"><span>Dedução Materiais</span><span className="font-bold text-red-600">-{formatarMoeda(resultado.baseCalculo.deducao)}</span></div>
                  )}
                  <div className="border-t border-blue-200 pt-1 flex justify-between font-bold">
                    <span>Base ISS</span>
                    <span className="text-blue-600">{formatarMoeda(resultado.baseCalculo.baseCalculo)}</span>
                  </div>
                </div>
              </div>

              {/* ISS */}
              <div className="p-3 bg-green-50 rounded-xl">
                <p className="text-xs text-green-600 font-bold mb-2">🏛️ ISS</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Alíquota</span><span className="font-bold">{resultado.iss.aliquota}%</span></div>
                  <div className="flex justify-between"><span>Valor ISS</span><span className="font-bold">{formatarMoeda(resultado.iss.iss)}</span></div>
                  <div className="flex justify-between"><span>Alíquota Efetiva</span><span className="font-bold">{resultado.aliquotaEfetiva.toFixed(2)}%</span></div>
                </div>
              </div>

              {/* Retenção */}
              {resultado.retencao.retido && (
                <div className="p-3 bg-amber-50 rounded-xl">
                  <p className="text-xs text-amber-600 font-bold mb-2">📝 Retenção na Fonte</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>ISS Retido</span><span className="font-bold">{formatarMoeda(resultado.impostosRetidos.iss)}</span></div>
                    {resultado.impostosRetidos.csll > 0 && (
                      <div className="flex justify-between"><span>CSLL</span><span className="font-bold">{formatarMoeda(resultado.impostosRetidos.csll)}</span></div>
                    )}
                    {resultado.impostosRetidos.pis > 0 && (
                      <div className="flex justify-between"><span>PIS</span><span className="font-bold">{formatarMoeda(resultado.impostosRetidos.pis)}</span></div>
                    )}
                    {resultado.impostosRetidos.cofins > 0 && (
                      <div className="flex justify-between"><span>COFINS</span><span className="font-bold">{formatarMoeda(resultado.impostosRetidos.cofins)}</span></div>
                    )}
                    <div className="border-t border-amber-200 pt-1 flex justify-between font-bold">
                      <span>Total Retido</span>
                      <span className="text-amber-600">{formatarMoeda(resultado.impostosRetidos.total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Líquido */}
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex justify-between">
                  <span className="font-black text-slate-800">LÍQUIDO A RECEBER</span>
                  <span className="font-black text-purple-600 text-xl">{formatarMoeda(resultado.liquidoReceber)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center sticky top-4">
              <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Preencha os dados</h3>
              <p className="text-sm text-slate-500">Configure o serviço e clique em calcular.</p>
            </div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-purple-800">Base Legal Atualizada 2026</p>
          <p className="text-xs text-purple-700 mt-1">
            LC 116/2003 (lista de serviços), CF/88 Art. 156, III (base constitucional), Lei 9.718/98 (retenção),
            IN RFB 1.234/2012 (retenção CSLL/PIS/COFINS), Dec. 44.049/2012 (regulamentação retenção).
            Alíquotas: mínimo 2%, máximo 5%. Dedução materiais: construção civil (materiais agregados permanentemente).
          </p>
        </div>
      </div>
    </div>
  );
}
