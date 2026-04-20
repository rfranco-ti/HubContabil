import { useState } from 'react';
import { Wallet, ChevronDown, ChevronUp, Info, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// ==================== CONSTANTES LEGAIS 2026 ====================
const SALARIO_MINIMO_2026 = 1621.00;
const TETO_INSS_2026 = 9030.34;
const DEDUCAO_DEPENDENTE_IR = 189.59;
const VALOR_COTA_SALARIO_FAMILIA = 67.54;
const LIMITE_SALARIO_FAMILIA = 1621.00;
const PERCENTUAL_VT = 6;

// INSS 2026 - Tabela Progressiva
const FAIXAS_INSS = [
  { de: 0, ate: 1621.00, aliquota: 0.075 },
  { de: 1621.01, ate: 2902.84, aliquota: 0.09 },
  { de: 2902.85, ate: 4354.27, aliquota: 0.12 },
  { de: 4354.28, ate: 9030.34, aliquota: 0.14 }
];

// IRRF 2026 - Tabela Progressiva
const FAIXAS_IRRF = [
  { limite: 2259.20, aliquota: 0, deducao: 0 },
  { limite: 2826.65, aliquota: 0.075, deducao: 169.44 },
  { limite: 3751.05, aliquota: 0.15, deducao: 381.44 },
  { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },
  { limite: Infinity, aliquota: 0.275, deducao: 896.00 }
];

// ==================== FUNÇÕES DE CÁLCULO ====================

function calcularINSS(salario) {
  let inss = 0;
  let salarioRestante = salario;
  let limiteAnterior = 0;

  for (const faixa of FAIXAS_INSS) {
    const baseFaixa = Math.min(salarioRestante, faixa.ate - limiteAnterior);
    if (baseFaixa <= 0) break;

    inss += baseFaixa * faixa.aliquota;
    salarioRestante -= baseFaixa;
    limiteAnterior = faixa.ate;
  }

  return Math.round(inss * 100) / 100;
}

function calcularINSSDetalhado(salario) {
  const detalhes = [];
  let salarioRestante = salario;
  let limiteAnterior = 0;
  let total = 0;

  for (const faixa of FAIXAS_INSS) {
    const baseFaixa = Math.min(salarioRestante, faixa.ate - limiteAnterior);
    if (baseFaixa <= 0) break;

    const valor = baseFaixa * faixa.aliquota;
    total += valor;
    detalhes.push({
      faixa: `${(faixa.de).toLocaleString('pt-BR')} - ${(faixa.ate).toLocaleString('pt-BR')}`,
      base: baseFaixa,
      aliquota: faixa.aliquota * 100,
      valor
    });

    salarioRestante -= baseFaixa;
    limiteAnterior = faixa.ate;
  }

  return { total: Math.round(total * 100) / 100, detalhes };
}

function calcularIRRF(base, dependentes) {
  const deducaoDep = dependentes * DEDUCAO_DEPENDENTE_IR;
  const baseCalculo = base - deducaoDep;

  if (baseCalculo <= 0) return { valor: 0, baseCalculo: 0, faixa: 1, aliquotaEfetiva: 0 };

  const faixa = FAIXAS_IRRF.find(f => baseCalculo <= f.limite);
  const valor = Math.max(0, (baseCalculo * faixa.aliquota) - faixa.deducao);
  const numFaixa = FAIXAS_IRRF.indexOf(faixa) + 1;
  const aliquotaEfetiva = baseCalculo > 0 ? (valor / baseCalculo) * 100 : 0;

  return {
    valor: Math.round(valor * 100) / 100,
    baseCalculo: Math.round(baseCalculo * 100) / 100,
    faixa: numFaixa,
    aliquotaEfetiva: Math.round(aliquotaEfetiva * 100) / 100,
    deducaoDependentes: Math.round(deducaoDep * 100) / 100
  };
}

function calcularSalarioFamilia(salario, dependentesSF) {
  if (salario > LIMITE_SALARIO_FAMILIA) return 0;
  return dependentesSF * VALOR_COTA_SALARIO_FAMILIA;
}

function calcularHoraExtra(salario, jornadaMensal, qtd, percentual = 50) {
  const horaNormal = salario / jornadaMensal;
  const valorHE = horaNormal * (1 + percentual / 100);
  return { horaNormal, valorHE, total: Math.round(valorHE * qtd * 100) / 100 };
}

function calcularAdicionalNoturno(salario, jornadaMensal, horasNoturnas) {
  const horaNormal = salario / jornadaMensal;
  const fatorReducao = 60 / 52.5; // 1,1428
  const adicional = horaNormal * 0.20 * fatorReducao;
  return { adicional: Math.round(adicional * horasNoturnas * 100) / 100, horaNoturna: Math.round(horaNormal * fatorReducao * 100) / 100 };
}

function calcularInsalubridade(grau) {
  const percentuais = { minimo: 0.10, medio: 0.20, maximo: 0.40 };
  return Math.round(SALARIO_MINIMO_2026 * percentuais[grau] * 100) / 100;
}

function calcularPericulosidade(salario) {
  return Math.round(salario * 0.30 * 100) / 100;
}

function horasParaDecimal(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return h + (m / 60);
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function CalculadoraSalarioLiquidoCompleta() {
  const [expandedSections, setExpandedSections] = useState({
    dadosBasicicos: true,
    adicionais: false,
    faltas: false,
    descontos: false,
    beneficios: false
  });

  const [formData, setFormData] = useState({
    ano: 2026,
    salarioBruto: '',
    jornadaMensal: 220,
    dependentesIR: 0,
    dependentesSF: 0,
    tipoAdicional: 'nenhum',
    grauInsalubridade: 'medio',
    percentualPericulosidade: 30,
    adicionalNoturno: false,
    horasNoturnas: 0,
    horasExtrasDiurnas: 0,
    percentualHE: 50,
    horasExtrasNoturnas: 0,
    consignado: false,
    valorConsignado: '',
    planoSaude: false,
    valorPlanoSaude: '',
    valeRefeicao: false,
    valorVR: '',
    valeAlimentacao: false,
    valorVA: '',
    sindicato: false,
    valorSindicato: '',
    previdenciaPrivada: false,
    percentualPrevPriv: 0,
    odontologia: false,
    valorOdonto: '',
    seguroVida: false,
    valorSeguro: '',
    diasFalta: 0,
    horasFaltas: '',
    adiantamento: '',
    valeTransporte: false,
    outrosDescontos: ''
  });

  const [resultado, setResultado] = useState(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const calcular = () => {
    if (!formData.salarioBruto) {
      toast.error('Informe o salário bruto.');
      return;
    }

    const salario = parseFloat(formData.salarioBruto);
    const jornada = parseInt(formData.jornadaMensal) || 220;

    // ===== PROVENTOS =====

    // 1. Adicionais
    let adicionalValor = 0;
    if (formData.tipoAdicional === 'insalubridade') {
      adicionalValor = calcularInsalubridade(formData.grauInsalubridade);
    } else if (formData.tipoAdicional === 'periculosidade') {
      adicionalValor = calcularPericulosidade(salario);
    }

    // 2. Adicional Noturno
    let adicionalNoturnoValor = 0;
    let detalheAN = null;
    if (formData.adicionalNoturno && formData.horasNoturnas > 0) {
      detalheAN = calcularAdicionalNoturno(salario, jornada, formData.horasNoturnas);
      adicionalNoturnoValor = detalheAN.adicional;
    }

    // 3. Horas Extras
    let totalHEDiurnas = 0;
    let totalHENoturnas = 0;
    let detalheHE = null;
    if (formData.horasExtrasDiurnas > 0) {
      detalheHE = calcularHoraExtra(salario, jornada, formData.horasExtrasDiurnas, formData.percentualHE);
      totalHEDiurnas = detalheHE.total;
    }
    if (formData.horasExtrasNoturnas > 0) {
      const heNot = calcularHoraExtra(salario, jornada, formData.horasExtrasNoturnas, formData.percentualHE + 20);
      totalHENoturnas = heNot.total;
    }

    // Base salarial para cálculos
    const baseSalarial = salario + adicionalValor + adicionalNoturnoValor + totalHEDiurnas + totalHENoturnas;

    // 4. Salário Família
    const salarioFamilia = calcularSalarioFamilia(salario, parseInt(formData.dependentesSF));

    // Total Proventos
    const totalProventos = baseSalarial + salarioFamilia;

    // ===== DESCONTOS =====

    // 5. INSS
    const inssDetalhado = calcularINSSDetalhado(baseSalarial);

    // 6. IRRF
    const baseIRRF = baseSalarial - inssDetalhado.total;
    const irrfDetalhado = calcularIRRF(baseIRRF, parseInt(formData.dependentesIR));

    // 7. Descontos Opcionais
    const descontoConsignado = formData.consignado ? (parseFloat(formData.valorConsignado) || 0) : 0;
    const descontoPlanoSaude = formData.planoSaude ? (parseFloat(formData.valorPlanoSaude) || 0) : 0;
    const descontoVR = formData.valeRefeicao ? (parseFloat(formData.valorVR) || 0) : 0;
    const descontoVA = formData.valeAlimentacao ? (parseFloat(formData.valorVA) || 0) : 0;
    const descontoSindicato = formData.sindicato ? (parseFloat(formData.valorSindicato) || 0) : 0;
    const descontoPrevPriv = formData.previdenciaPrivada ? (salario * (formData.percentualPrevPriv / 100)) : 0;
    const descontoOdonto = formData.odontologia ? (parseFloat(formData.valorOdonto) || 0) : 0;
    const descontoSeguro = formData.seguroVida ? (parseFloat(formData.valorSeguro) || 0) : 0;

    // 8. Desconto Faltas
    const horasFaltasDecimal = horasParaDecimal(formData.horasFaltas);
    const valorHora = salario / jornada;
    const descontoFaltasDias = (salario / 30) * (parseInt(formData.diasFalta) || 0);
    const descontoFaltasHoras = valorHora * horasFaltasDecimal;
    const totalDescontoFaltas = descontoFaltasDias + descontoFaltasHoras;

    // 9. Vale Transporte
    const descontoVT = formData.valeTransporte ? Math.min(salario * (PERCENTUAL_VT / 100), salario) : 0;

    // 10. Adiantamento
    const descontoAdiantamento = parseFloat(formData.adiantamento) || 0;

    // 11. Outros
    const outrosDescontos = parseFloat(formData.outrosDescontos) || 0;

    // Total Descontos
    const totalDescontos = inssDetalhado.total + irrfDetalhado.valor +
      descontoConsignado + descontoPlanoSaude + descontoVR + descontoVA +
      descontoSindicato + descontoPrevPriv + descontoOdonto + descontoSeguro +
      totalDescontoFaltas + descontoVT + descontoAdiantamento + outrosDescontos;

    // Salário Líquido
    const salarioLiquido = totalProventos - totalDescontos;
    const aliquotaEfetiva = totalProventos > 0 ? (totalDescontos / totalProventos) * 100 : 0;

    setResultado({
      proventos: {
        salarioBase: salario,
        adicional: { tipo: formData.tipoAdicional, valor: adicionalValor },
        adicionalNoturno: adicionalNoturnoValor,
        horasExtras: { diurnas: totalHEDiurnas, noturnas: totalHENoturnas, total: totalHEDiurnas + totalHENoturnas },
        salarioFamilia,
        total: totalProventos
      },
      descontos: {
        inss: inssDetalhado,
        irrf: irrfDetalhado,
        consignado: descontoConsignado,
        planoSaude: descontoPlanoSaude,
        valeRefeicao: descontoVR,
        valeAlimentacao: descontoVA,
        sindicato: descontoSindicato,
        previdenciaPrivada: descontoPrevPriv,
        odontologia: descontoOdonto,
        seguroVida: descontoSeguro,
        faltas: { dias: descontoFaltasDias, horas: descontoFaltasHoras, total: totalDescontoFaltas },
        valeTransporte: descontoVT,
        adiantamento: descontoAdiantamento,
        outros: outrosDescontos,
        total: totalDescontos
      },
      salarioLiquido,
      aliquotaEfetiva: Math.round(aliquotaEfetiva * 100) / 100,
      detalhes: {
        detalheAN,
        detalheHE
      }
    });

    setMostrarDetalhes(true);
    toast.success('Salário líquido calculado com sucesso!');
  };

  const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-100 text-green-600 p-3 rounded-2xl">
            <Wallet size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Calculadora de Salário Líquido 2026</h1>
            <p className="text-slate-500">Cálculo completo com INSS progressivo, IRRF, adicionais, benefícios e descontos.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dados Básicos */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('dadosBasicicos')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                💰 Dados Básicos
              </h2>
              {expandedSections.dadosBasicicos ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.dadosBasicicos && (
              <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Ano-Calendário</label>
                  <select value={formData.ano} onChange={(e) => handleChange('ano', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                    <option value={2026}>2026 (Regra Atual)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Jornada Mensal (Horas)</label>
                  <select value={formData.jornadaMensal} onChange={(e) => handleChange('jornadaMensal', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                    <option value={220}>220h (44h/semana)</option>
                    <option value={200}>200h (40h/semana)</option>
                    <option value={180}>180h (36h/semana)</option>
                    <option value={150}>150h (30h/semana)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Salário Bruto (R$)</label>
                  <input type="number" value={formData.salarioBruto} onChange={(e) => handleChange('salarioBruto', e.target.value)}
                    placeholder="Ex: 3.000,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Dependentes IRRF</label>
                  <input type="number" value={formData.dependentesIR} onChange={(e) => handleChange('dependentesIR', parseInt(e.target.value))}
                    min="0" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  <p className="text-xs text-slate-500 mt-1">Dedução: {formatarMoeda(DEDUCAO_DEPENDENTE_IR)}/mês</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Dependentes Salário-Família</label>
                  <input type="number" value={formData.dependentesSF} onChange={(e) => handleChange('dependentesSF', parseInt(e.target.value))}
                    min="0" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  <p className="text-xs text-slate-500 mt-1">Cota: {formatarMoeda(VALOR_COTA_SALARIO_FAMILIA)} (até {formatarMoeda(LIMITE_SALARIO_FAMILIA)})</p>
                </div>
              </div>
            )}
          </div>

          {/* Adicionais */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('adicionais')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                ⚠️ Adicionais
              </h2>
              {expandedSections.adicionais ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.adicionais && (
              <div className="p-5 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Insalubridade ou Periculosidade?</label>
                    <select value={formData.tipoAdicional} onChange={(e) => handleChange('tipoAdicional', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                      <option value="nenhum">Nenhum</option>
                      <option value="insalubridade">Insalubridade (10/20/40% SM)</option>
                      <option value="periculosidade">Periculosidade (30% salário-base)</option>
                    </select>
                  </div>
                  {formData.tipoAdicional === 'insalubridade' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Grau de Insalubridade</label>
                      <select value={formData.grauInsalubridade} onChange={(e) => handleChange('grauInsalubridade', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                        <option value="minimo">Mínimo (10%) - {formatarMoeda(SALARIO_MINIMO_2026 * 0.10)}</option>
                        <option value="medio">Médio (20%) - {formatarMoeda(SALARIO_MINIMO_2026 * 0.20)}</option>
                        <option value="maximo">Máximo (40%) - {formatarMoeda(SALARIO_MINIMO_2026 * 0.40)}</option>
                      </select>
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.adicionalNoturno}
                    onChange={(e) => handleChange('adicionalNoturno', e.target.checked)} />
                  <span className="text-sm font-bold text-slate-700">Adicional Noturno (+20%, hora 52m30s)</span>
                </label>

                {formData.adicionalNoturno && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Horas Noturnas no Mês</label>
                      <input type="number" value={formData.horasNoturnas} onChange={(e) => handleChange('horasNoturnas', parseFloat(e.target.value))}
                        min="0" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.horasExtrasDiurnas > 0 || formData.horasExtrasNoturnas > 0}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        handleChange('horasExtrasDiurnas', 0);
                        handleChange('horasExtrasNoturnas', 0);
                      } else {
                        handleChange('horasExtrasDiurnas', 0);
                      }
                    }} />
                  <span className="text-sm font-bold text-slate-700">Informar Horas Extras</span>
                </label>

                {(formData.horasExtrasDiurnas > 0 || formData.horasExtrasNoturnas > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">HE Diurnas (qtd)</label>
                      <input type="number" value={formData.horasExtrasDiurnas} onChange={(e) => handleChange('horasExtrasDiurnas', parseFloat(e.target.value))}
                        min="0" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">% HE Diurna</label>
                      <select value={formData.percentualHE} onChange={(e) => handleChange('percentualHE', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                        <option value={50}>50% (padrão)</option>
                        <option value={60}>60%</option>
                        <option value={70}>70%</option>
                        <option value={100}>100% (dom/feriado)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">HE Noturnas (qtd)</label>
                      <input type="number" value={formData.horasExtrasNoturnas} onChange={(e) => handleChange('horasExtrasNoturnas', parseFloat(e.target.value))}
                        min="0" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Faltas */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('faltas')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                📅 Faltas e Atrasos
              </h2>
              {expandedSections.faltas ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.faltas && (
              <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Dias de Falta no Mês</label>
                  <input type="number" value={formData.diasFalta} onChange={(e) => handleChange('diasFalta', parseInt(e.target.value))}
                    min="0" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Horas Faltas (hh:mm)</label>
                  <input type="text" value={formData.horasFaltas} onChange={(e) => handleChange('horasFaltas', e.target.value)}
                    placeholder="Ex: 02:15" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
              </div>
            )}
          </div>

          {/* Descontos */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('descontos')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                ➖ Descontos
              </h2>
              {expandedSections.descontos ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.descontos && (
              <div className="p-5 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Desconto Adiantamento (R$)</label>
                    <input type="number" value={formData.adiantamento} onChange={(e) => handleChange('adiantamento', e.target.value)}
                      placeholder="Ex: 1.200,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Outros Descontos (R$)</label>
                    <input type="number" value={formData.outrosDescontos} onChange={(e) => handleChange('outrosDescontos', e.target.value)}
                      placeholder="Ex: 50,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  </div>
                </div>

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.valeTransporte}
                    onChange={(e) => handleChange('valeTransporte', e.target.checked)} />
                  <span className="text-sm font-bold text-slate-700">Descontar Vale Transporte ({PERCENTUAL_VT}%)</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.consignado}
                    onChange={(e) => handleChange('consignado', e.target.checked)} />
                  <span className="text-sm font-bold text-slate-700">Empréstimo Consignado</span>
                </label>
                {formData.consignado && (
                  <div className="ml-6">
                    <input type="number" value={formData.valorConsignado} onChange={(e) => handleChange('valorConsignado', e.target.value)}
                      placeholder="Valor mensal" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  </div>
                )}

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.previdenciaPrivada}
                    onChange={(e) => handleChange('previdenciaPrivada', e.target.checked)} />
                  <span className="text-sm font-bold text-slate-700">Previdência Privada (PGBL)</span>
                </label>
                {formData.previdenciaPrivada && (
                  <div className="ml-6">
                    <input type="number" value={formData.percentualPrevPriv} onChange={(e) => handleChange('percentualPrevPriv', parseFloat(e.target.value))}
                      placeholder="Percentual (máx 12%)" min="0" max="12" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Benefícios */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('beneficios')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                🎁 Benefícios
              </h2>
              {expandedSections.beneficios ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.beneficios && (
              <div className="p-5 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={formData.planoSaude}
                        onChange={(e) => handleChange('planoSaude', e.target.checked)} />
                      <span className="text-sm font-bold text-slate-700">Plano de Saúde</span>
                    </label>
                    {formData.planoSaude && (
                      <input type="number" value={formData.valorPlanoSaude} onChange={(e) => handleChange('valorPlanoSaude', e.target.value)}
                        placeholder="Coparticipação mensal" className="w-full px-4 py-3 border border-slate-300 rounded-xl mt-2" />
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={formData.valeRefeicao}
                        onChange={(e) => handleChange('valeRefeicao', e.target.checked)} />
                      <span className="text-sm font-bold text-slate-700">Vale Refeição</span>
                    </label>
                    {formData.valeRefeicao && (
                      <input type="number" value={formData.valorVR} onChange={(e) => handleChange('valorVR', e.target.value)}
                        placeholder="Desconto mensal" className="w-full px-4 py-3 border border-slate-300 rounded-xl mt-2" />
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={formData.valeAlimentacao}
                        onChange={(e) => handleChange('valeAlimentacao', e.target.checked)} />
                      <span className="text-sm font-bold text-slate-700">Vale Alimentação</span>
                    </label>
                    {formData.valeAlimentacao && (
                      <input type="number" value={formData.valorVA} onChange={(e) => handleChange('valorVA', e.target.value)}
                        placeholder="Desconto mensal" className="w-full px-4 py-3 border border-slate-300 rounded-xl mt-2" />
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={formData.odontologia}
                        onChange={(e) => handleChange('odontologia', e.target.checked)} />
                      <span className="text-sm font-bold text-slate-700">Assistência Odontológica</span>
                    </label>
                    {formData.odontologia && (
                      <input type="number" value={formData.valorOdonto} onChange={(e) => handleChange('valorOdonto', e.target.value)}
                        placeholder="Mensalidade" className="w-full px-4 py-3 border border-slate-300 rounded-xl mt-2" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botão Calcular */}
          <button onClick={calcular}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-green-500/20">
            <Wallet size={18} className="inline mr-2" /> Calcular Salário Líquido
          </button>
        </div>

        {/* Resultado */}
        <div className="lg:col-span-1">
          {resultado ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sticky top-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Resultado</h2>
                <button onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
                  className="text-blue-600 hover:text-blue-700">
                  {mostrarDetalhes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {/* Proventos */}
              <div>
                <p className="text-xs text-slate-500 font-bold mb-2">PROVENTOS</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm"><span>Salário Base</span><span className="font-bold">{formatarMoeda(resultado.proventos.salarioBase)}</span></div>
                  {resultado.proventos.adicional.valor > 0 && (
                    <div className="flex justify-between text-sm"><span>Adicional ({resultado.proventos.adicional.tipo})</span><span className="font-bold text-green-600">+{formatarMoeda(resultado.proventos.adicional.valor)}</span></div>
                  )}
                  {resultado.proventos.adicionalNoturno > 0 && (
                    <div className="flex justify-between text-sm"><span>Adic. Noturno</span><span className="font-bold text-green-600">+{formatarMoeda(resultado.proventos.adicionalNoturno)}</span></div>
                  )}
                  {resultado.proventos.horasExtras.total > 0 && (
                    <div className="flex justify-between text-sm"><span>Horas Extras</span><span className="font-bold text-green-600">+{formatarMoeda(resultado.proventos.horasExtras.total)}</span></div>
                  )}
                  {resultado.proventos.salarioFamilia > 0 && (
                    <div className="flex justify-between text-sm"><span>Salário-Família</span><span className="font-bold text-green-600">+{formatarMoeda(resultado.proventos.salarioFamilia)}</span></div>
                  )}
                  <div className="border-t pt-1 flex justify-between text-sm font-bold"><span>Total Proventos</span><span className="text-green-600">{formatarMoeda(resultado.proventos.total)}</span></div>
                </div>
              </div>

              {/* Descontos */}
              <div>
                <p className="text-xs text-slate-500 font-bold mb-2">DESCONTOS</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm"><span>INSS Progressivo</span><span className="font-bold text-red-600">-{formatarMoeda(resultado.descontos.inss.total)}</span></div>
                  {resultado.descontos.irrf.valor > 0 && (
                    <div className="flex justify-between text-sm"><span>IRRF (Faixa {resultado.descontos.irrf.faixa})</span><span className="font-bold text-red-600">-{formatarMoeda(resultado.descontos.irrf.valor)}</span></div>
                  )}
                  {resultado.descontos.consignado > 0 && (
                    <div className="flex justify-between text-sm"><span>Consignado</span><span className="font-bold text-red-600">-{formatarMoeda(resultado.descontos.consignado)}</span></div>
                  )}
                  {resultado.descontos.planoSaude > 0 && (
                    <div className="flex justify-between text-sm"><span>Plano Saúde</span><span className="font-bold text-red-600">-{formatarMoeda(resultado.descontos.planoSaude)}</span></div>
                  )}
                  {resultado.descontos.faltas.total > 0 && (
                    <div className="flex justify-between text-sm"><span>Faltas</span><span className="font-bold text-red-600">-{formatarMoeda(resultado.descontos.faltas.total)}</span></div>
                  )}
                  {resultado.descontos.valeTransporte > 0 && (
                    <div className="flex justify-between text-sm"><span>Vale Transporte</span><span className="font-bold text-red-600">-{formatarMoeda(resultado.descontos.valeTransporte)}</span></div>
                  )}
                  {resultado.descontos.adiantamento > 0 && (
                    <div className="flex justify-between text-sm"><span>Adiantamento</span><span className="font-bold text-red-600">-{formatarMoeda(resultado.descontos.adiantamento)}</span></div>
                  )}
                  <div className="border-t pt-1 flex justify-between text-sm font-bold"><span>Total Descontos</span><span className="text-red-600">-{formatarMoeda(resultado.descontos.total)}</span></div>
                </div>
              </div>

              {/* Líquido */}
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex justify-between"><span className="font-black text-slate-800">SALÁRIO LÍQUIDO</span><span className="font-black text-green-600 text-xl">{formatarMoeda(resultado.salarioLiquido)}</span></div>
                <p className="text-xs text-slate-500 mt-1">Alíquota efetiva: {resultado.aliquotaEfetiva}%</p>
              </div>

              {/* Detalhes Expansíveis */}
              {mostrarDetalhes && (
                <div className="space-y-3 border-t pt-3">
                  <details>
                    <summary className="text-xs font-bold text-slate-600 cursor-pointer">Detalhes INSS</summary>
                    <div className="mt-2 space-y-1">
                      {resultado.descontos.inss.detalhes.map((d, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span>Faixa {i+1} ({d.faixa})</span>
                          <span>{d.aliquota}%: {formatarMoeda(d.valor)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                  <details>
                    <summary className="text-xs font-bold text-slate-600 cursor-pointer">Detalhes IRRF</summary>
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between"><span>Base Cálculo</span><span>{formatarMoeda(resultado.descontos.irrf.baseCalculo)}</span></div>
                      <div className="flex justify-between"><span>Dedução Depend.</span><span>{formatarMoeda(resultado.descontos.irrf.deducaoDependentes)}</span></div>
                      <div className="flex justify-between"><span>Faixa/Alíq.</span><span>Faixa {resultado.descontos.irrf.faixa} ({resultado.descontos.irrf.aliquotaEfetiva}%)</span></div>
                    </div>
                  </details>
                  {resultado.detalhes.detalheAN && (
                    <details>
                      <summary className="text-xs font-bold text-slate-600 cursor-pointer">Detalhes Adic. Noturno</summary>
                      <div className="mt-2 text-xs space-y-1">
                        <div className="flex justify-between"><span>Hora Noturna</span><span>{formatarMoeda(resultado.detalhes.detalheAN.horaNoturna)}</span></div>
                        <div className="flex justify-between"><span>Total ({formData.horasNoturnas}h)</span><span>{formatarMoeda(resultado.detalhes.detalheAN.adicional)}</span></div>
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center sticky top-4">
              <Wallet size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Preencha os dados</h3>
              <p className="text-sm text-slate-500">Configure todos os campos e clique em calcular.</p>
            </div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Base Legal Atualizada 2026</p>
          <p className="text-xs text-blue-700 mt-1">
            INSS progressivo (Lei 8.212/91, Portaria MPS/MF nº 13/2026), IRRF (Lei 14.789/2023), Salário-Família (R$ {VALOR_COTA_SALARIO_FAMILIA}),
            Adicional Noturno (CLT Art. 73, hora 52m30s), Insalubridade (CLT 189-197, NR-15), Periculosidade (CLT 193-194, NR-16).
          </p>
        </div>
      </div>
    </div>
  );
}
