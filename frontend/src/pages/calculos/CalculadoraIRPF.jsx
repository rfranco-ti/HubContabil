import { useState } from 'react';
import { User, ChevronDown, ChevronUp, Info, DollarSign, FileText, AlertTriangle, Calculator, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

// ==================== CONSTANTES LEGAIS IRPF 2026 ====================
const TABELA_IRPF_MENSAL = [
  { limite: 2428.80, aliquota: 0, deducao: 0 },
  { limite: 2826.65, aliquota: 0.075, deducao: 182.16 },
  { limite: 3751.05, aliquota: 0.15, deducao: 381.44 },
  { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },
  { limite: Infinity, aliquota: 0.275, deducao: 896.00 }
];

const TABELA_IRPF_ANUAL = [
  { limite: 28467.20, aliquota: 0, deducao: 0 },
  { limite: 33919.80, aliquota: 0.075, deducao: 2135.04 },
  { limite: 45012.60, aliquota: 0.15, deducao: 4577.28 },
  { limite: 55976.16, aliquota: 0.225, deducao: 7953.24 },
  { limite: Infinity, aliquota: 0.275, deducao: 10752.00 }
];

const DEDUCAO_DEPENDENTE = 189.59;
const DEDUCAO_DEPENDENTE_ANUAL = 2275.08;
const DESCONTO_SIMPLIFICADO = 607.20;
const DESCONTO_SIMPLIFICADO_ANUAL = 7286.40;
const LIMITE_INSTRUCIONAL_ANUAL = 3561.50;
const LIMITE_PREVIDENCIA_OFICIAL = 9030.34; // Teto INSS

// ==================== FUNÇÕES DE CÁLCULO ====================

function calcularIRRFMensal(baseTributavel, dependentes, usoSimplificado = false) {
  let baseCalculo = baseTributavel;

  if (usoSimplificado) {
    baseCalculo = Math.max(0, baseTributavel - DESCONTO_SIMPLIFICADO);
  } else {
    baseCalculo -= dependentes * DEDUCAO_DEPENDENTE;
  }

  if (baseCalculo <= 0) return {
    baseTributavel: baseTributavel,
    baseCalculo: 0,
    aliquota: 0,
    irrf: 0,
    faixa: 1,
    simplificado: usoSimplificado
  };

  const faixa = TABELA_IRPF_MENSAL.find(f => baseCalculo <= f.limite);
  const irrf = Math.max(0, (baseCalculo * faixa.aliquota) - faixa.deducao);
  const numFaixa = TABELA_IRPF_MENSAL.indexOf(faixa) + 1;

  return {
    baseTributavel,
    baseCalculo: Math.round(baseCalculo * 100) / 100,
    aliquota: faixa.aliquota * 100,
    irrf: Math.round(irrf * 100) / 100,
    faixa: numFaixa,
    simplificado: usoSimplificado
  };
}

function calcularIRRFAnual(baseTributavel, dependentes, usoSimplificado = false) {
  let baseCalculo = baseTributavel;

  if (usoSimplificado) {
    baseCalculo = Math.max(0, baseTributavel - DESCONTO_SIMPLIFICADO_ANUAL);
  } else {
    baseCalculo -= dependentes * DEDUCAO_DEPENDENTE_ANUAL;
  }

  if (baseCalculo <= 0) return {
    baseTributavel,
    baseCalculo: 0,
    aliquota: 0,
    irrf: 0,
    faixa: 1
  };

  const faixa = TABELA_IRPF_ANUAL.find(f => baseCalculo <= f.limite);
  const irrf = Math.max(0, (baseCalculo * faixa.aliquota) - faixa.deducao);
  const numFaixa = TABELA_IRPF_ANUAL.indexOf(faixa) + 1;

  return {
    baseTributavel,
    baseCalculo: Math.round(baseCalculo * 100) / 100,
    aliquota: faixa.aliquota * 100,
    irrf: Math.round(irrf * 100) / 100,
    faixa: numFaixa,
    simplificado: usoSimplificado
  };
}

function calcularCarnLe(rendimentoMensal, inssPago, dependentes) {
  // Base = rendimento - INSS - dependentes
  const base = rendimentoMensal - inssPago - (dependentes * DEDUCAO_DEPENDENTE);
  return calcularIRRFMensal(base, 0, false);
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function CalculadoraIRPFCompleta() {
  const [expandedSections, setExpandedSections] = useState({
    rendimentos: true,
    deducoes: true,
    tipoCalculo: true,
    outrasFontes: false,
    dependentes: true
  });

  const [formData, setFormData] = useState({
    tipoCalculo: 'mensal', // mensal, anual, carnLe, declaracao
    salarioMensal: '',
    outrosRendimentos: '',
    rendimento13: '',
    aluguelRecebido: '',
    proLabore: '',
    distribuicaoLucros: '',
    dependentes: 0,
    inssPago: '',
    previdenciaPrivada: '',
    despesasMedicas: '',
    despesasInstrucao: '',
    pensaoAlimenticia: '',
    usoSimplificado: false,
    retençõesMensal: '',
    isentoNaoTributavel: '',
    ganhoLiquidoBolsa: ''
  });

  const [resultado, setResultado] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const calcular = () => {
    const salario = parseFloat(formData.salarioMensal) || 0;
    if (formData.tipoCalculo === 'mensal' && salario === 0) {
      toast.error('Informe ao menos o salário mensal.');
      return;
    }

    const outrosRend = parseFloat(formData.outrosRendimentos) || 0;
    const inss = parseFloat(formData.inssPago) || 0;
    const dep = parseInt(formData.dependentes) || 0;
    const prevPriv = parseFloat(formData.previdenciaPrivada) || 0;
    const med = parseFloat(formData.despesasMedicas) || 0;
    const instr = parseFloat(formData.despesasInstrucao) || 0;
    const pensao = parseFloat(formData.pensaoAlimenticia) || 0;
    const aluguel = parseFloat(formData.aluguelRecebido) || 0;
    const proLabore = parseFloat(formData.proLabore) || 0;
    const distLucros = parseFloat(formData.distribuicaoLucros) || 0;
    const rend13 = parseFloat(formData.rendimento13) || 0;

    let res = { tipoCalculo: formData.tipoCalculo };

    if (formData.tipoCalculo === 'mensal') {
      // Rendimentos tributáveis
      const totalTributavel = salario + outrosRend + proLabore + aluguel;

      // Deduções
      const deducaoINSS = Math.min(inss, LIMITE_INSTRUCIONAL_ANUAL / 12);
      const deducaoPrevPriv = Math.min(prevPriv, totalTributavel * 0.12);
      const deducaoPensao = pensao;
      const deducaoMed = med;
      const deducaoInstr = Math.min(instr, LIMITE_INSTRUCIONAL_ANUAL / 12);

      const totalDeducoes = deducaoINSS + deducaoPrevPriv + deducaoPensao + deducaoMed + deducaoInstr;

      // Base tributável
      const baseTributavel = totalTributavel - totalDeducoes;

      // Calcular com e sem simplificado para comparar
      const resultNormal = calcularIRRFMensal(baseTributavel, dep, false);
      const resultSimplificado = calcularIRRFMensal(baseTributavel, 0, true);

      // Usa o mais vantajoso
      const maisVantajoso = resultNormal.irrf <= resultSimplificado.irrf ? resultNormal : resultSimplificado;

      res = {
        ...res,
        rendimentos: {
          salario: salario,
          outros: outrosRend,
          proLabore: proLabore,
          aluguel: aluguel,
          total: totalTributavel
        },
        deducoes: {
          inss: Math.round(deducaoINSS * 100) / 100,
          prevPrivada: Math.round(deducaoPrevPriv * 100) / 100,
          pensao: Math.round(deducaoPensao * 100) / 100,
          medica: Math.round(deducaoMed * 100) / 100,
          instrucao: Math.round(deducaoInstr * 100) / 100,
          total: Math.round(totalDeducoes * 100) / 100
        },
        baseTributavel: Math.round(baseTributavel * 100) / 100,
        comparativo: {
          normal: resultNormal,
          simplificado: resultSimplificado,
          maisVantajoso: maisVantajoso
        },
        irrf: maisVantajoso,
        distribuicaoLucros: distLucros, // Isento
        saldo: Math.round((salario + outrosRend + proLabore - maisVantajoso.irrf) * 100) / 100
      };

    } else if (formData.tipoCalculo === 'anual') {
      const totalAnual = (salario * 12) + outrosRend * 12 + proLabore * 12 + aluguel * 12 + rend13;
      const inssAnual = Math.min(inss * 12, LIMITE_INSTRUCIONAL_ANUAL);
      const prevPrivAnual = Math.min(prevPriv * 12, totalAnual * 0.12);

      const totalDeducoes = inssAnual + prevPrivAnual + pensao + med + Math.min(instr, LIMITE_INSTRUCIONAL_ANUAL);
      const baseTributavel = totalAnual - totalDeducoes;

      const resultNormal = calcularIRRFAnual(baseTributavel, dep, false);
      const resultSimplificado = calcularIRRFAnual(baseTributavel, 0, true);
      const maisVantajoso = resultNormal.irrf <= resultSimplificado.irrf ? resultNormal : resultSimplificado;

      res = {
        ...res,
        rendimentosAnual: Math.round(totalAnual * 100) / 100,
        deducoesAnual: Math.round(totalDeducoes * 100) / 100,
        baseTributavel: Math.round(baseTributavel * 100) / 100,
        comparativo: {
          normal: resultNormal,
          simplificado: resultSimplificado,
          maisVantajoso: maisVantajoso
        },
        irrf: maisVantajoso,
        irrf13: rend13 > 0 ? calcularIRRFMensal(rend13 / 12, dep, false).irrf * 12 : 0,
        irrfTotal: maisVantajoso.irrf + (rend13 > 0 ? calcularIRRFMensal(rend13 / 12, dep, false).irrf * 12 : 0)
      };

    } else if (formData.tipoCalculo === 'carnLe') {
      // Carnê-leão para rendimentos do exterior ou PF
      const resultadoCarnLe = calcularCarnLe(salario, inss, dep);
      res = {
        ...res,
        rendimento: salario,
        inssPago: inss,
        carnLe: resultadoCarnLe
      };
    }

    setResultado(res);
    toast.success('IRPF calculado com sucesso!');
  };

  const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const TIPOS_CALCULO = [
    { value: 'mensal', label: '📅 IRPF Mensal', desc: 'Cálculo mensal com INSS, dependentes e deduções' },
    { value: 'anual', label: '📊 IRPF Anual', desc: 'Declaração anual com todos os rendimentos' },
    { value: 'carnLe', label: '📝 Carnê-Leão', desc: 'Rendimentos de PF ou exterior' }
  ];

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Calculadora IRPF 2026</h1>
            <p className="text-slate-500">Cálculo completo: mensal, anual, carnê-leão, desconto simplificado, deduções e dependentes.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tipo de Cálculo */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('tipoCalculo')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">📋 Tipo de Cálculo</h2>
              {expandedSections.tipoCalculo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.tipoCalculo && (
              <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-3 gap-3">
                {TIPOS_CALCULO.map(tipo => (
                  <label key={tipo.value}
                    className={`flex flex-col p-4 rounded-xl cursor-pointer transition-all border-2 ${
                      formData.tipoCalculo === tipo.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}>
                    <input type="radio" name="tipoCalculo"
                      checked={formData.tipoCalculo === tipo.value}
                      onChange={() => handleChange('tipoCalculo', tipo.value)}
                      className="mb-2 w-4 h-4 text-indigo-600" />
                    <p className="text-sm font-bold text-slate-800">{tipo.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{tipo.desc}</p>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Rendimentos */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('rendimentos')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">💰 Rendimentos</h2>
              {expandedSections.rendimentos ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.rendimentos && (
              <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Salário/Pró-labore Mensal (R$)</label>
                  <input type="number" value={formData.salarioMensal} onChange={(e) => handleChange('salarioMensal', e.target.value)}
                    placeholder="Ex: 5.000,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Outros Rendimentos (R$)</label>
                  <input type="number" value={formData.outrosRendimentos} onChange={(e) => handleChange('outrosRendimentos', e.target.value)}
                    placeholder="Ex: 1.000,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Aluguel Recebido (R$)</label>
                  <input type="number" value={formData.aluguelRecebido} onChange={(e) => handleChange('aluguelRecebido', e.target.value)}
                    placeholder="Ex: 2.000,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
                {formData.tipoCalculo === 'anual' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">13º Salário (R$)</label>
                    <input type="number" value={formData.rendimento13} onChange={(e) => handleChange('rendimento13', e.target.value)}
                      placeholder="Ex: 3.000,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Distribuição de Lucros (Isento)</label>
                  <input type="number" value={formData.distribuicaoLucros} onChange={(e) => handleChange('distribuicaoLucros', e.target.value)}
                    placeholder="Ex: 10.000,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
              </div>
            )}
          </div>

          {/* Deduções */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('deducoes')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">📉 Deduções</h2>
              {expandedSections.deducoes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.deducoes && (
              <div className="p-5 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">INSS Pago (R$)</label>
                    <input type="number" value={formData.inssPago} onChange={(e) => handleChange('inssPago', e.target.value)}
                      placeholder="Mensal" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Previdência Privada PGBL (R$)</label>
                    <input type="number" value={formData.previdenciaPrivada} onChange={(e) => handleChange('previdenciaPrivada', e.target.value)}
                      placeholder="Até 12% da renda" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Despesas Médicas (R$)</label>
                    <input type="number" value={formData.despesasMedicas} onChange={(e) => handleChange('despesasMedicas', e.target.value)}
                      placeholder="Sem limite" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Despesas Instrução (R$)</label>
                    <input type="number" value={formData.despesasInstrucao} onChange={(e) => handleChange('despesasInstrucao', e.target.value)}
                      placeholder={`Máx: ${formatarMoeda(LIMITE_INSTRUCIONAL_ANUAL)}/ano`} className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Pensão Alimentícia Judicial (R$)</label>
                    <input type="number" value={formData.pensaoAlimenticia} onChange={(e) => handleChange('pensaoAlimenticia', e.target.value)}
                      placeholder="Valor mensal" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  </div>
                </div>

                <label className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.usoSimplificado}
                    onChange={(e) => handleChange('usoSimplificado', e.target.checked)} />
                  <div>
                    <span className="text-sm font-bold text-slate-700">Usar Desconto Simplificado</span>
                    <p className="text-xs text-slate-500">Substitui todas as deduções por {formatarMoeda(DESCONTO_SIMPLIFICADO)}/mês</p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Dependentes */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('dependentes')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">👨‍👩‍👧‍👦 Dependentes</h2>
              {expandedSections.dependentes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.dependentes && (
              <div className="p-5 pt-0">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Número de Dependentes</label>
                  <input type="number" value={formData.dependentes} onChange={(e) => handleChange('dependentes', parseInt(e.target.value))}
                    min="0" max="10" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  <p className="text-xs text-slate-500 mt-1">Dedução: {formatarMoeda(DEDUCAO_DEPENDENTE)}/mês por dependente</p>
                </div>
              </div>
            )}
          </div>

          {/* Botão */}
          <button onClick={calcular}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-indigo-500/20">
            <Calculator size={18} className="inline mr-2" /> Calcular IRPF
          </button>
        </div>

        {/* Resultado */}
        <div className="lg:col-span-1">
          {resultado ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sticky top-4 space-y-4">
              <h2 className="text-lg font-bold text-slate-800">Resultado IRPF 2026</h2>

              {/* Rendimentos */}
              {resultado.rendimentos && (
                <div className="p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-600 font-bold mb-2">💰 Rendimentos Tributáveis</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Salário/Prolabore</span><span className="font-bold">{formatarMoeda(resultado.rendimentos.salario)}</span></div>
                    {resultado.rendimentos.outros > 0 && <div className="flex justify-between"><span>Outros</span><span className="font-bold">{formatarMoeda(resultado.rendimentos.outros)}</span></div>}
                    {resultado.rendimentos.aluguel > 0 && <div className="flex justify-between"><span>Aluguel</span><span className="font-bold">{formatarMoeda(resultado.rendimentos.aluguel)}</span></div>}
                    <div className="border-t border-blue-200 pt-1 flex justify-between font-bold"><span>Total</span><span className="text-blue-600">{formatarMoeda(resultado.rendimentos.total)}</span></div>
                  </div>
                </div>
              )}

              {/* Deduções */}
              {resultado.deducoes && (
                <div className="p-3 bg-green-50 rounded-xl">
                  <p className="text-xs text-green-600 font-bold mb-2">📉 Deduções</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>INSS</span><span className="font-bold">{formatarMoeda(resultado.deducoes.inss)}</span></div>
                    {resultado.deducoes.prevPrivada > 0 && <div className="flex justify-between"><span>PGBL</span><span className="font-bold">{formatarMoeda(resultado.deducoes.prevPrivada)}</span></div>}
                    {resultado.deducoes.pensao > 0 && <div className="flex justify-between"><span>Pensão</span><span className="font-bold">{formatarMoeda(resultado.deducoes.pensao)}</span></div>}
                    {resultado.deducoes.medica > 0 && <div className="flex justify-between"><span>Médica</span><span className="font-bold">{formatarMoeda(resultado.deducoes.medica)}</span></div>}
                    {resultado.deducoes.instrucao > 0 && <div className="flex justify-between"><span>Instrução</span><span className="font-bold">{formatarMoeda(resultado.deducoes.instrucao)}</span></div>}
                    <div className="border-t border-green-200 pt-1 flex justify-between font-bold"><span>Total</span><span className="text-green-600">{formatarMoeda(resultado.deducoes.total)}</span></div>
                  </div>
                </div>
              )}

              {/* Base Tributável */}
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 font-bold mb-1">📊 Base Tributável</p>
                <p className="text-sm font-bold">{formatarMoeda(resultado.baseTributavel)}</p>
              </div>

              {/* Comparativo */}
              {resultado.comparativo && (
                <div className="p-3 bg-amber-50 rounded-xl">
                  <p className="text-xs text-amber-600 font-bold mb-2">⚖️ Comparativo: Normal vs Simplificado</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Normal (Faixa {resultado.comparativo.normal.faixa})</span>
                      <span className={`font-bold ${resultado.comparativo.maisVantajoso === resultado.comparativo.normal ? 'text-green-600' : 'text-slate-500'}`}>
                        {formatarMoeda(resultado.comparativo.normal.irrf)} {resultado.comparativo.maisVantajoso === resultado.comparativo.normal ? '✓' : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Simplificado</span>
                      <span className={`font-bold ${resultado.comparativo.maisVantajoso === resultado.comparativo.simplificado ? 'text-green-600' : 'text-slate-500'}`}>
                        {formatarMoeda(resultado.comparativo.simplificado.irrf)} {resultado.comparativo.maisVantajoso === resultado.comparativo.simplificado ? '✓' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* IRPF */}
              {resultado.irrf && (
                <div className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-xs text-indigo-600 font-bold mb-2">🏛️ IRPF a Pagar</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Base Cálculo</span><span className="font-bold">{formatarMoeda(resultado.irrf.baseCalculo)}</span></div>
                    <div className="flex justify-between"><span>Faixa/Alíquota</span><span className="font-bold">Faixa {resultado.irrf.faixa} ({resultado.irrf.aliquota}%)</span></div>
                    {resultado.irrf.simplificado && <p className="text-xs text-indigo-500">Usou desconto simplificado</p>}
                  </div>
                  <div className="bg-white rounded-lg p-3 mt-2">
                    <div className="flex justify-between">
                      <span className="font-black text-slate-800">IRPF MENSAL</span>
                      <span className="font-black text-indigo-600 text-xl">{formatarMoeda(resultado.irrf.irrf)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Carnê-Leão */}
              {resultado.carnLe && (
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-xs text-purple-600 font-bold mb-2">📝 Carnê-Leão</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Rendimento</span><span className="font-bold">{formatarMoeda(resultado.rendimento)}</span></div>
                    <div className="flex justify-between"><span>INSS</span><span className="font-bold">{formatarMoeda(resultado.inssPago)}</span></div>
                    <div className="flex justify-between font-bold"><span>Carnê-Leão</span><span className="text-purple-600">{formatarMoeda(resultado.carnLe.irrf)}</span></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center sticky top-4">
              <User size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Preencha os dados</h3>
              <p className="text-sm text-slate-500">Configure rendimentos e deduções.</p>
            </div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={20} className="text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-indigo-800">Base Legal Atualizada 2026</p>
          <p className="text-xs text-indigo-700 mt-1">
            Lei 7.713/88, Lei 9.250/95, Lei 14.789/2023 (nova tabela), MP 1.168/2023 (desconto simplificado).
            Tabela mensal: isento até R$ 2.428,80. Deduções: dependentes R$ 189,59, simplificado R$ 607,20/mês,
            instrução R$ 3.561,50/ano. PGBL até 12% da renda bruta. Despesas médicas sem limite.
            Distribuição de lucros isenta (Lei 9.249/95).
          </p>
        </div>
      </div>
    </div>
  );
}
