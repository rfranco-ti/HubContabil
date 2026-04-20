import { useState } from 'react';
import { Percent, ChevronDown, ChevronUp, Info, DollarSign, Calculator, Plus, Minus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// ==================== CONSTANTES LEGAIS 2026 ====================
const ALIQUOTA_PIS = 0.0165;
const ALIQUOTA_COFINS = 0.076;
const ALIQUOTA_TOTAL = ALIQUOTA_PIS + ALIQUOTA_COFINS; // 9.25%

// ==================== FUNÇÕES DE CÁLCULO ====================

function calcularPIS(receitaBruta, aliquota = ALIQUOTA_PIS) {
  return {
    baseCalculo: Math.round(receitaBruta * 100) / 100,
    aliquota: aliquota * 100,
    pis: Math.round(receitaBruta * aliquota * 100) / 100
  };
}

function calcularCOFINS(receitaBruta, aliquota = ALIQUOTA_COFINS) {
  return {
    baseCalculo: Math.round(receitaBruta * 100) / 100,
    aliquota: aliquota * 100,
    cofins: Math.round(receitaBruta * aliquota * 100) / 100
  };
}

function calcularCreditos(baseCredito, tipo) {
  const pisCredito = baseCredito * ALIQUOTA_PIS;
  const cofinsCredito = baseCredito * ALIQUOTA_COFINS;
  return {
    baseCredito: Math.round(baseCredito * 100) / 100,
    pisCredito: Math.round(pisCredito * 100) / 100,
    cofinsCredito: Math.round(cofinsCredito * 100) / 100,
    totalCreditos: Math.round((pisCredito + cofinsCredito) * 100) / 100,
    tipo
  };
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function CalculadoraPISCOFINSCompleta() {
  const [expandedSections, setExpandedSections] = useState({
    receitas: true,
    creditos: true,
    exclusoes: false,
    comparativo: false
  });

  const [formData, setFormData] = useState({
    receitaBruta: '',
    exclusaoICMS: false,
    valorICMSExcluido: '',
    receitasNaoTributaveis: '',
    creditos: {
      insumos: '',
      energiaEletrica: '',
      alugueisPredios: '',
      alugueisMaquinas: '',
      depreciacao: '',
      fretesVendas: '',
      servicosTerceiros: '',
      estocagem: '',
      outrosCreditos: ''
    },
    periodoApuracao: 'mensal'
  });

  const [resultado, setResultado] = useState(null);

  const handleChange = (section, field, value) => {
    if (section === 'receitaBruta' || section === 'exclusaoICMS' || section === 'valorICMSExcluido' || section === 'receitasNaoTributaveis' || section === 'periodoApuracao') {
      setFormData(prev => ({ ...prev, [section]: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const calcular = () => {
    if (!formData.receitaBruta) {
      toast.error('Informe a receita bruta.');
      return;
    }

    const receitaBruta = parseFloat(formData.receitaBruta);
    const icmsExcluido = formData.exclusaoICMS ? (parseFloat(formData.valorICMSExcluido) || 0) : 0;
    const receitasNaoTrib = parseFloat(formData.receitasNaoTributaveis) || 0;

    // Base de cálculo (com exclusão do ICMS se aplicável)
    const baseCalculo = receitaBruta - icmsExcluido - receitasNaoTrib;

    // Débitos PIS/COFINS
    const pisDebito = calcularPIS(baseCalculo);
    const cofinsDebito = calcularCOFINS(baseCalculo);

    // Créditos
    const totalCreditosBase = Object.values(formData.creditos).reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
    const creditosData = totalCreditosBase > 0 ? calcularCreditos(totalCreditosBase, 'diversos') : null;

    // Líquido a pagar
    const pisLiquido = pisDebito.pis - (creditosData?.pisCredito || 0);
    const cofinsLiquido = cofinsDebito.cofins - (creditosData?.cofinsCredito || 0);
    const totalLiquido = pisLiquido + cofinsLiquido;

    // Carga efetiva
    const cargaEfetiva = receitaBruta > 0 ? (totalLiquido / receitaBruta) * 100 : 0;

    setResultado({
      receitaBruta,
      icmsExcluido,
      receitasNaoTributaveis: receitasNaoTrib,
      baseCalculo: Math.round(baseCalculo * 100) / 100,
      pis: pisDebito,
      cofins: cofinsDebito,
      creditos: creditosData,
      pisLiquido: Math.round(Math.max(0, pisLiquido) * 100) / 100,
      cofinsLiquido: Math.round(Math.max(0, cofinsLiquido) * 100) / 100,
      totalLiquido: Math.round(Math.max(0, totalLiquido) * 100) / 100,
      cargaEfetiva: Math.round(cargaEfetiva * 100) / 100,
      periodo: formData.periodoApuracao === 'mensal' ? 'Mensal' : 'Trimestral'
    });

    toast.success('PIS/COFINS calculado com sucesso!');
  };

  const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const CREDITOS_ITEMS = [
    { field: 'insumos', label: 'Insumos e matéria-prima', desc: 'Bens aplicados na produção' },
    { field: 'energiaEletrica', label: 'Energia elétrica', desc: 'Consumo na produção/estabelecimento' },
    { field: 'alugueisPredios', label: 'Aluguéis de prédios', desc: 'Imóveis utilizados pela empresa' },
    { field: 'alugueisMaquinas', label: 'Aluguéis de máquinas', desc: 'Equipamentos em operação' },
    { field: 'depreciacao', label: 'Depreciação e amortização', desc: 'Bens do ativo imobilizado' },
    { field: 'fretesVendas', label: 'Fretes sobre vendas', desc: 'Transporte de mercadorias' },
    { field: 'servicosTerceiros', label: 'Serviços de terceiros (PJ)', desc: 'Pessoas jurídicas' },
    { field: 'estocagem', label: 'Estocagem e armazenagem', desc: 'Custos de armazenamento' },
    { field: 'outrosCreditos', label: 'Outros créditos permitidos', desc: 'Demais créditos legais' }
  ];

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-teal-100 text-teal-600 p-3 rounded-2xl">
            <Percent size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Calculadora PIS/COFINS Não-Cumulativo 2026</h1>
            <p className="text-slate-500">Cálculo completo com créditos permitidos, exclusão do ICMS da base e alíquotas 1,65%/7,6%.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-4">
          {/* Receitas */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('receitas')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">💰 Receitas</h2>
              {expandedSections.receitas ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.receitas && (
              <div className="p-5 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Receita Bruta (R$)</label>
                    <input type="number" value={formData.receitaBruta} onChange={(e) => handleChange('receitaBruta', e.target.value)}
                      placeholder="Ex: 500.000,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Receitas Não Tributáveis (R$)</label>
                    <input type="number" value={formData.receitasNaoTributaveis} onChange={(e) => handleChange('receitasNaoTributaveis', e.target.value)}
                      placeholder="Ex: dividendos, JCP" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  </div>
                </div>

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.exclusaoICMS}
                    onChange={(e) => handleChange('exclusaoICMS', e.target.checked)} />
                  <div>
                    <span className="text-sm font-bold text-slate-700">Excluir ICMS da base de PIS/COFINS?</span>
                    <p className="text-xs text-slate-500">Tese vencedora no STF (Tema 69, RE 574.706)</p>
                  </div>
                </label>

                {formData.exclusaoICMS && (
                  <div className="ml-6">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Valor do ICMS a excluir (R$)</label>
                    <input type="number" value={formData.valorICMSExcluido} onChange={(e) => handleChange('valorICMSExcluido', e.target.value)}
                      placeholder="Ex: 90.000,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Período de Apuração</label>
                  <select value={formData.periodoApuracao} onChange={(e) => handleChange('periodoApuracao', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                    <option value="mensal">Mensal</option>
                    <option value="trimestral">Trimestral</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Créditos */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('creditos')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus size={18} className="text-teal-500" />
                Créditos Permitidos
              </h2>
              {expandedSections.creditos ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.creditos && (
              <div className="p-5 pt-0 space-y-3">
                {CREDITOS_ITEMS.map(item => (
                  <div key={item.field} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                    <div className="md:col-span-2">
                      <p className="text-sm font-bold text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <input type="number" value={formData.creditos[item.field]}
                      onChange={(e) => handleChange('creditos', item.field, e.target.value)}
                      placeholder="R$ 0,00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botão */}
          <button onClick={calcular}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-teal-500/20">
            <Calculator size={18} className="inline mr-2" /> Calcular PIS/COFINS
          </button>
        </div>

        {/* Resultado */}
        <div className="lg:col-span-1">
          {resultado ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sticky top-4 space-y-4">
              <h2 className="text-lg font-bold text-slate-800">Resultado PIS/COFINS</h2>

              {/* Base */}
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 font-bold mb-2">📊 Base de Cálculo</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Receita Bruta</span><span className="font-bold">{formatarMoeda(resultado.receitaBruta)}</span></div>
                  {resultado.icmsExcluido > 0 && <div className="flex justify-between"><span>ICMS Excluído</span><span className="font-bold text-red-600">-{formatarMoeda(resultado.icmsExcluido)}</span></div>}
                  {resultado.receitasNaoTributaveis > 0 && <div className="flex justify-between"><span>Receitas Não Trib.</span><span className="font-bold text-green-600">-{formatarMoeda(resultado.receitasNaoTributaveis)}</span></div>}
                  <div className="border-t border-slate-200 pt-1 flex justify-between font-bold"><span>Base PIS/COFINS</span><span className="text-teal-600">{formatarMoeda(resultado.baseCalculo)}</span></div>
                </div>
              </div>

              {/* Débitos */}
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 font-bold mb-2">📤 Débitos</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>PIS (1,65%)</span><span className="font-bold">{formatarMoeda(resultado.pis.pis)}</span></div>
                  <div className="flex justify-between"><span>COFINS (7,6%)</span><span className="font-bold">{formatarMoeda(resultado.cofins.cofins)}</span></div>
                  <div className="flex justify-between font-bold"><span>Total Débitos</span><span className="text-blue-600">{formatarMoeda(resultado.pis.pis + resultado.cofins.cofins)}</span></div>
                </div>
              </div>

              {/* Créditos */}
              {resultado.creditos && (
                <div className="p-3 bg-green-50 rounded-xl">
                  <p className="text-xs text-green-600 font-bold mb-2">💳 Créditos</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Base Créditos</span><span className="font-bold">{formatarMoeda(resultado.creditos.baseCredito)}</span></div>
                    <div className="flex justify-between"><span>Crédito PIS (1,65%)</span><span className="font-bold text-green-600">{formatarMoeda(resultado.creditos.pisCredito)}</span></div>
                    <div className="flex justify-between"><span>Crédito COFINS (7,6%)</span><span className="font-bold text-green-600">{formatarMoeda(resultado.creditos.cofinsCredito)}</span></div>
                    <div className="border-t border-green-200 pt-1 flex justify-between font-bold"><span>Total Créditos</span><span className="text-green-600">{formatarMoeda(resultado.creditos.totalCreditos)}</span></div>
                  </div>
                </div>
              )}

              {/* Líquido */}
              <div className="bg-teal-50 rounded-xl p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>PIS Líquido</span><span className="font-bold">{formatarMoeda(resultado.pisLiquido)}</span></div>
                  <div className="flex justify-between text-sm"><span>COFINS Líquida</span><span className="font-bold">{formatarMoeda(resultado.cofinsLiquido)}</span></div>
                  <div className="border-t border-teal-200 pt-2 flex justify-between">
                    <span className="font-black text-slate-800">TOTAL A PAGAR</span>
                    <span className="font-black text-teal-600 text-xl">{formatarMoeda(resultado.totalLiquido)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Carga Tributária Efetiva</span>
                    <span>{resultado.cargaEfetiva}%</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center sticky top-4">
              <Percent size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Preencha os dados</h3>
              <p className="text-sm text-slate-500">Configure receitas e créditos permitidos.</p>
            </div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="mt-6 bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={20} className="text-teal-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-teal-800">Base Legal Atualizada 2026</p>
          <p className="text-xs text-teal-700 mt-1">
            Lei 10.637/2002 (PIS não-cumulativo), Lei 10.833/2003 (COFINS não-cumulativa), EC 103/2019.
            Alíquotas: PIS 1,65%, COFINS 7,6% (total 9,25%). Exclusão ICMS: STF Tema 69 (RE 574.706/STF).
            Créditos: insumos, energia, aluguéis, depreciação, fretes, serviços PJ, estocagem (Leis 10.637/02 e 10.833/03).
            Receita Federal limita créditos complementares na exclusão do ICMS (Solução de Consulta nº 21/2026).
          </p>
        </div>
      </div>
    </div>
  );
}
