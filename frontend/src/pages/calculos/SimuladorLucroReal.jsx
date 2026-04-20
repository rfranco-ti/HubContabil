import { useState } from 'react';
import { TrendingUp, ChevronDown, ChevronUp, Info, DollarSign, FileText, AlertTriangle, Calculator, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

// ==================== CONSTANTES LEGAIS 2026 ====================
const ALIQUOTA_IRPJ = 0.15;
const ADICIONAL_IRPJ_LIMITE = 20000; // por mês
const ALIQUOTA_ADICIONAL_IRPJ = 0.10;
const ALIQUOTA_CSLL = 0.09;
const LIMITE_COMPENSAU_PREJUIZO = 0.30; // 30% do lucro real

// ==================== FUNÇÕES DE CÁLCULO ====================

function calcularIRPJ(lucroReal, periodoMeses = 1) {
  const limiteMes = ADICIONAL_IRPJ_LIMITE * periodoMeses;
  const baseIRPJ = lucroReal;

  const irpjBase = baseIRPJ * ALIQUOTA_IRPJ;
  const baseAdicional = Math.max(0, baseIRPJ - limiteMes);
  const irpjAdicional = baseAdicional * ALIQUOTA_ADICIONAL_IRPJ;

  return {
    baseCalculo: Math.round(baseIRPJ * 100) / 100,
    irpjBase: Math.round(irpjBase * 100) / 100,
    baseAdicional: Math.round(baseAdicional * 100) / 100,
    irpjAdicional: Math.round(irpjAdicional * 100) / 100,
    irpjTotal: Math.round((irpjBase + irpjAdicional) * 100) / 100
  };
}

function calcularCSLL(lucroReal) {
  return {
    baseCalculo: Math.round(lucroReal * 100) / 100,
    csll: Math.round(lucroReal * ALIQUOTA_CSLL * 100) / 100
  };
}

function calcularLucroReal(lucroContabil, adicoes, exclusoes, prejuizoCompensar) {
  const lucroAjustado = lucroContabil + adicoes - exclusoes;
  const limiteCompensacao = lucroAjustado > 0 ? lucroAjustado * LIMITE_COMPENSAU_PREJUIZO : 0;
  const prejuizoUtilizado = Math.min(prejuizoCompensar, limiteCompensacao);
  const lucroReal = Math.max(0, lucroAjustado - prejuizoUtilizado);

  return {
    lucroContabil,
    adicoes,
    exclusoes,
    lucroAjustado: Math.round(lucroAjustado * 100) / 100,
    prejuizoAnterior: prejuizoCompensar,
    limiteCompensacao: Math.round(limiteCompensacao * 100) / 100,
    prejuizoUtilizado: Math.round(prejuizoUtilizado * 100) / 100,
    prejuizoRemanescente: Math.round((prejuizoCompensar - prejuizoUtilizado) * 100) / 100,
    lucroReal: Math.round(lucroReal * 100) / 100
  };
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function SimuladorLucroRealCompleto() {
  const [expandedSections, setExpandedSections] = useState({
    lucroContabil: true,
    adicoes: true,
    exclusoes: false,
    prejuizo: false,
    periodo: true
  });

  const [formData, setFormData] = useState({
    lucroContabil: '',
    periodoApuracao: 'trimestral', // mensal ou trimestral
    adicoes: {
      provisoesNaoDedutiveis: '',
      despesasSemDocumentacao: '',
      multasJurosMora: '',
      doacoesNaoDedutiveis: '',
      brindesEntretenimento: '',
      depreciacaoAceleradaNaoIncentivada: '',
      diferencasTemporarias: '',
      outrasAdicoes: ''
    },
    exclusoes: {
      receitasNaoTributaveis: '',
      rendimentosIsencao: '',
      dividendosRecebidos: '',
      jcp: '',
      outrasExclusoes: ''
    },
    prejuizoFiscal: '',
    compensarPrejuizo: false
  });

  const [resultado, setResultado] = useState(null);

  const handleChange = (section, field, value) => {
    if (section === 'lucroContabil' || section === 'periodoApuracao' || section === 'prejuizoFiscal' || section === 'compensarPrejuizo') {
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
    const lucroContabil = parseFloat(formData.lucroContabil) || 0;
    if (lucroContabil === 0 && !formData.compensarPrejuizo) {
      toast.error('Informe o lucro contábil ou ative compensação de prejuízo.');
      return;
    }

    const periodoMeses = formData.periodoApuracao === 'mensal' ? 1 : 3;

    // Somar adições
    const totalAdicoes = Object.values(formData.adicoes).reduce((acc, v) => acc + (parseFloat(v) || 0), 0);

    // Somar exclusões
    const totalExclusoes = Object.values(formData.exclusoes).reduce((acc, v) => acc + (parseFloat(v) || 0), 0);

    // Prejuízo fiscal
    const prejuizoCompensar = formData.compensarPrejuizo ? (parseFloat(formData.prejuizoFiscal) || 0) : 0;

    // Lucro Real
    const lucroRealData = calcularLucroReal(lucroContabil, totalAdicoes, totalExclusoes, prejuizoCompensar);

    // IRPJ
    const irpjData = calcularIRPJ(lucroRealData.lucroReal, periodoMeses);

    // CSLL
    const csllData = calcularCSLL(lucroRealData.lucroReal);

    // Total impostos
    const totalImpostos = irpjData.irpjTotal + csllData.csll;
    const cargaTributariaEfetiva = lucroRealData.lucroReal > 0 ? (totalImpostos / lucroRealData.lucroReal) * 100 : 0;

    setResultado({
      lucroReal: lucroRealData,
      irpj: irpjData,
      csll: csllData,
      totalImpostos: Math.round(totalImpostos * 100) / 100,
      cargaTributariaEfetiva: Math.round(cargaTributariaEfetiva * 100) / 100,
      periodo: formData.periodoApuracao === 'mensal' ? 'Mensal' : 'Trimestral',
      periodoMeses
    });

    toast.success('Lucro Real calculado com sucesso!');
  };

  const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const ADICOES_ITEMS = [
    { field: 'provisoesNaoDedutiveis', label: 'Provisões não dedutíveis', desc: 'Provisões sem contrapartida de despesa' },
    { field: 'despesasSemDocumentacao', label: 'Despesas sem documentação', desc: 'Comprovantes fiscais inexistentes' },
    { field: 'multasJurosMora', label: 'Multas e juros de mora', desc: 'Infrações legais e contratuais' },
    { field: 'doacoesNaoDedutiveis', label: 'Doações não dedutíveis', desc: 'Acima dos limites legais' },
    { field: 'brindesEntretenimento', label: 'Brindes e entretenimento', desc: 'Despesas de representação' },
    { field: 'depreciacaoAceleradaNaoIncentivada', label: 'Depreciação acelerada não incentivada', desc: 'Aceleração contábil sem amparo fiscal' },
    { field: 'diferencasTemporarias', label: 'Diferenças temporárias contábil/fiscal', desc: 'Ajustes LALUR' },
    { field: 'outrasAdicoes', label: 'Outras adições', desc: 'Demais ajustes positivos' }
  ];

  const EXCLUSOES_ITEMS = [
    { field: 'receitasNaoTributaveis', label: 'Receitas não tributáveis', desc: 'Receitas excluídas por lei' },
    { field: 'rendimentosIsencao', label: 'Rendimentos com isenção', desc: 'Juros sobre capital próprio, etc' },
    { field: 'dividendosRecebidos', label: 'Dividendos recebidos', desc: 'Lucros distribuídos por outras PJ' },
    { field: 'jcp', label: 'Juros sobre Capital Próprio', desc: 'JCP recebido (para IRPJ)' },
    { field: 'outrasExclusoes', label: 'Outras exclusões', desc: 'Demais ajustes negativos' }
  ];

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-violet-100 text-violet-600 p-3 rounded-2xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Simulador de Lucro Real 2026</h1>
            <p className="text-slate-500">Cálculo completo com adições, exclusões, LALUR, compensação de prejuízos fiscais (30%), IRPJ e CSLL.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-4">
          {/* Lucro Contábil */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('lucroContabil')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">💰 Lucro Contábil</h2>
              {expandedSections.lucroContabil ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.lucroContabil && (
              <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Lucro Líquido Contábil (R$)</label>
                  <input type="number" value={formData.lucroContabil} onChange={(e) => handleChange('lucroContabil', e.target.value)}
                    placeholder="Ex: 500.000,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Período de Apuração</label>
                  <select value={formData.periodoApuracao} onChange={(e) => handleChange('periodoApuracao', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                    <option value="mensal">Mensal (limite adicional R$ 20.000/mês)</option>
                    <option value="trimestral">Trimestral (limite adicional R$ 60.000/tri)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Adições LALUR */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('adicoes')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus size={18} className="text-red-500" />
                Adições (LALUR)
              </h2>
              {expandedSections.adicoes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.adicoes && (
              <div className="p-5 pt-0 space-y-3">
                {ADICOES_ITEMS.map(item => (
                  <div key={item.field} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                    <div className="md:col-span-2">
                      <p className="text-sm font-bold text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <input type="number" value={formData.adicoes[item.field]}
                      onChange={(e) => handleChange('adicoes', item.field, e.target.value)}
                      placeholder="R$ 0,00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exclusões LALUR */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('exclusoes')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Minus size={18} className="text-green-500" />
                Exclusões (LALUR)
              </h2>
              {expandedSections.exclusoes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.exclusoes && (
              <div className="p-5 pt-0 space-y-3">
                {EXCLUSOES_ITEMS.map(item => (
                  <div key={item.field} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                    <div className="md:col-span-2">
                      <p className="text-sm font-bold text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <input type="number" value={formData.exclusoes[item.field]}
                      onChange={(e) => handleChange('exclusoes', item.field, e.target.value)}
                      placeholder="R$ 0,00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prejuízo Fiscal */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('prejuizo')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">📉 Compensação de Prejuízos Fiscais</h2>
              {expandedSections.prejuizo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.prejuizo && (
              <div className="p-5 pt-0 space-y-4">
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.compensarPrejuizo}
                    onChange={(e) => handleChange('compensarPrejuizo', e.target.checked)} />
                  <div>
                    <span className="text-sm font-bold text-slate-700">Possui prejuízo fiscal acumulado?</span>
                    <p className="text-xs text-slate-500">Compensação limitada a 30% do Lucro Real (Lei 9.249/95)</p>
                  </div>
                </label>
                {formData.compensarPrejuizo && (
                  <div className="ml-6">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Prejuízo Fiscal Acumulado (R$)</label>
                    <input type="number" value={formData.prejuizoFiscal} onChange={(e) => handleChange('prejuizoFiscal', e.target.value)}
                      placeholder="Ex: 100.000,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botão */}
          <button onClick={calcular}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-violet-500/20">
            <Calculator size={18} className="inline mr-2" /> Calcular Lucro Real
          </button>
        </div>

        {/* Resultado */}
        <div className="lg:col-span-1">
          {resultado ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sticky top-4 space-y-4">
              <h2 className="text-lg font-bold text-slate-800">Resultado Lucro Real</h2>

              {/* Apuração */}
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 font-bold mb-2">📊 Lucro Real ({resultado.periodo})</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Lucro Contábil</span><span className="font-bold">{formatarMoeda(resultado.lucroReal.lucroContabil)}</span></div>
                  <div className="flex justify-between"><span>(+) Adições</span><span className="font-bold text-red-600">{formatarMoeda(resultado.lucroReal.adicoes)}</span></div>
                  <div className="flex justify-between"><span>(-) Exclusões</span><span className="font-bold text-green-600">-{formatarMoeda(resultado.lucroReal.exclusoes)}</span></div>
                  <div className="border-t border-slate-200 pt-1 flex justify-between font-bold"><span>Lucro Ajustado</span><span>{formatarMoeda(resultado.lucroReal.lucroAjustado)}</span></div>
                  {resultado.lucroReal.prejuizoUtilizado > 0 && (
                    <>
                      <div className="flex justify-between"><span>Prejuízo Compensado</span><span className="font-bold text-amber-600">-{formatarMoeda(resultado.lucroReal.prejuizoUtilizado)}</span></div>
                      {resultado.lucroReal.prejuizoRemanescente > 0 && <div className="flex justify-between"><span>Prejuízo Remanescente</span><span className="font-bold text-slate-500">{formatarMoeda(resultado.lucroReal.prejuizoRemanescente)}</span></div>}
                    </>
                  )}
                  <div className="bg-violet-50 rounded-lg p-2 mt-2 flex justify-between font-bold">
                    <span>Lucro Real</span>
                    <span className="text-violet-600">{formatarMoeda(resultado.lucroReal.lucroReal)}</span>
                  </div>
                </div>
              </div>

              {/* IRPJ */}
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 font-bold mb-2">🏛️ IRPJ</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Base Cálculo</span><span className="font-bold">{formatarMoeda(resultado.irpj.baseCalculo)}</span></div>
                  <div className="flex justify-between"><span>IRPJ (15%)</span><span className="font-bold">{formatarMoeda(resultado.irpj.irpjBase)}</span></div>
                  {resultado.irpj.baseAdicional > 0 && (
                    <>
                      <div className="flex justify-between"><span>Base Adicional</span><span className="font-bold">{formatarMoeda(resultado.irpj.baseAdicional)}</span></div>
                      <div className="flex justify-between"><span>Adicional (10%)</span><span className="font-bold">{formatarMoeda(resultado.irpj.irpjAdicional)}</span></div>
                    </>
                  )}
                  <div className="border-t border-blue-200 pt-1 flex justify-between font-bold">
                    <span>Total IRPJ</span>
                    <span className="text-blue-600">{formatarMoeda(resultado.irpj.irpjTotal)}</span>
                  </div>
                </div>
              </div>

              {/* CSLL */}
              <div className="p-3 bg-green-50 rounded-xl">
                <p className="text-xs text-green-600 font-bold mb-2">📋 CSLL</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Base Cálculo</span><span className="font-bold">{formatarMoeda(resultado.csll.baseCalculo)}</span></div>
                  <div className="flex justify-between"><span>CSLL (9%)</span><span className="font-bold">{formatarMoeda(resultado.csll.csll)}</span></div>
                </div>
              </div>

              {/* Total */}
              <div className="bg-violet-50 rounded-xl p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Total IRPJ</span><span className="font-bold">{formatarMoeda(resultado.irpj.irpjTotal)}</span></div>
                  <div className="flex justify-between text-sm"><span>Total CSLL</span><span className="font-bold">{formatarMoeda(resultado.csll.csll)}</span></div>
                  <div className="border-t border-violet-200 pt-2 flex justify-between">
                    <span className="font-black text-slate-800">TOTAL IMPOSTOS</span>
                    <span className="font-black text-violet-600 text-xl">{formatarMoeda(resultado.totalImpostos)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Carga Tributária Efetiva</span>
                    <span>{resultado.cargaTributariaEfetiva}%</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center sticky top-4">
              <TrendingUp size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Preencha os dados</h3>
              <p className="text-sm text-slate-500">Configure lucro contábil e ajustes LALUR.</p>
            </div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="mt-6 bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={20} className="text-violet-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-violet-800">Base Legal Atualizada 2026</p>
          <p className="text-xs text-violet-700 mt-1">
            Lei 9.249/95 (Lucro Real), Lei 12.973/2014 (normas contábeis), Dec. 9.580/2018 (RIR),
            IN RFB 1.700/2017 (LALUR). IRPJ: 15% + 10% adicional (base {">"} R$ 20.000/mês ou R$ 60.000/tri).
            CSLL: 9%. Compensação prejuízo fiscal: limitada a 30% do Lucro Real, sem limite temporal (Lei 12.973/2014).
          </p>
        </div>
      </div>
    </div>
  );
}
