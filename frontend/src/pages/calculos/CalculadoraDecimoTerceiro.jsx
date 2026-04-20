import { useState } from 'react';
import { DollarSign, ChevronDown, ChevronUp, Info, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// ==================== CONSTANTES LEGAIS 2026 ====================
const SALARIO_MINIMO_2026 = 1621.00;
const TETO_INSS_2026 = 9030.34;
const DEDUCAO_DEPENDENTE_IR = 189.59;

const FAIXAS_INSS = [
  { limite: 1621.00, aliquota: 0.075 },
  { limite: 2902.84, aliquota: 0.09 },
  { limite: 4354.27, aliquota: 0.12 },
  { limite: 9030.34, aliquota: 0.14 }
];

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
  let restante = salario;
  let limiteAnterior = 0;

  for (const faixa of FAIXAS_INSS) {
    const baseFaixa = Math.min(restante, faixa.limite - limiteAnterior);
    if (baseFaixa <= 0) break;
    inss += baseFaixa * faixa.aliquota;
    restante -= baseFaixa;
    limiteAnterior = faixa.limite;
  }
  return Math.round(inss * 100) / 100;
}

function calcularINSSDetalhado(salario) {
  const detalhes = [];
  let restante = salario;
  let limiteAnterior = 0;
  let total = 0;

  for (const faixa of FAIXAS_INSS) {
    const base = Math.min(restante, faixa.limite - limiteAnterior);
    if (base <= 0) break;
    const valor = base * faixa.aliquota;
    total += valor;
    detalhes.push({ faixa: `${faixa.limite.toLocaleString('pt-BR')}`, aliquota: faixa.aliquota * 100, valor });
    restante -= base;
    limiteAnterior = faixa.limite;
  }
  return { total: Math.round(total * 100) / 100, detalhes };
}

function calcularIRRF(base, dependentes) {
  const deducaoDep = dependentes * DEDUCAO_DEPENDENTE_IR;
  const baseCalculo = base - deducaoDep;
  if (baseCalculo <= 0) return { valor: 0, baseCalculo: 0, faixa: 1 };

  const faixa = FAIXAS_IRRF.find(f => baseCalculo <= f.limite);
  const valor = Math.max(0, (baseCalculo * faixa.aliquota) - faixa.deducao);
  return { valor: Math.round(valor * 100) / 100, baseCalculo: Math.round(baseCalculo * 100) / 100, faixa: FAIXAS_IRRF.indexOf(faixa) + 1 };
}

function calcular13Integral(salario, dependentesIR, calcularINSS, calcularIRRF) {
  const bruto = salario;

  // 1ª Parcela: 50% sem descontos
  const primeiraParcela = bruto * 0.5;

  // 2ª Parcela: 50% com descontos
  const segundaParcelaBruta = bruto * 0.5;
  const inss2 = calcularINSS ? calcularINSS(segundaParcelaBruta) : 0;
  const baseIRRF = segundaParcelaBruta - inss2;
  const irrf2 = calcularIRRF ? calcularIRRF(baseIRRF, dependentesIR).valor : 0;
  const segundaParcelaLiquida = segundaParcelaBruta - inss2 - irrf2;

  const totalINSS = inss2;
  const totalIRRF = irrf2;
  const totalLiquido = primeiraParcela + segundaParcelaLiquida;

  return {
    bruto,
    primeiraParcela: Math.round(primeiraParcela * 100) / 100,
    segundaParcela: {
      bruta: Math.round(segundaParcelaBruta * 100) / 100,
      inss: Math.round(inss2 * 100) / 100,
      irrf: Math.round(irrf2 * 100) / 100,
      liquida: Math.round(segundaParcelaLiquida * 100) / 100
    },
    totalINSS: Math.round(totalINSS * 100) / 100,
    totalIRRF: Math.round(totalIRRF * 100) / 100,
    totalLiquido: Math.round(totalLiquido * 100) / 100
  };
}

function calcular13Proporcional(salario, meses, dependentesIR, calcularINSS, calcularIRRF) {
  const mesesReais = Math.min(Math.max(0, meses), 12);
  const bruto = (salario / 12) * mesesReais;

  const primeiraParcela = bruto * 0.5;
  const segundaParcelaBruta = bruto * 0.5;

  const inss2 = calcularINSS ? calcularINSS(segundaParcelaBruta) : 0;
  const baseIRRF = segundaParcelaBruta - inss2;
  const irrf2 = calcularIRRF ? calcularIRRF(baseIRRF, dependentesIR).valor : 0;
  const segundaParcelaLiquida = segundaParcelaBruta - inss2 - irrf2;

  return {
    meses: mesesReais,
    bruto: Math.round(bruto * 100) / 100,
    primeiraParcela: Math.round(primeiraParcela * 100) / 100,
    segundaParcela: {
      bruta: Math.round(segundaParcelaBruta * 100) / 100,
      inss: Math.round(inss2 * 100) / 100,
      irrf: Math.round(irrf2 * 100) / 100,
      liquida: Math.round(segundaParcelaLiquida * 100) / 100
    },
    totalINSS: Math.round(inss2 * 100) / 100,
    totalIRRF: Math.round(irrf2 * 100) / 100,
    totalLiquido: Math.round((primeiraParcela + segundaParcelaLiquida) * 100) / 100
  };
}

function contarMeses13(dataAdmissao, dataReferencia, anoReferencia) {
  const adm = new Date(dataAdmissao);
  const ref = new Date(dataReferencia);
  const inicioAno = new Date(anoReferencia, 0, 1);

  const dataBase = adm > inicioAno ? adm : inicioAno;
  let meses = 0;

  for (let mes = dataBase.getMonth(); mes <= ref.getMonth(); mes++) {
    const diasNoMes = mes === ref.getMonth() ? ref.getDate() : 30;
    if (diasNoMes >= 15) meses++;
  }

  return Math.min(Math.max(0, meses), 12);
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function CalculadoraDecimoTerceiroCompleta() {
  const [expandedSections, setExpandedSections] = useState({
    dadosBasicos: true,
    tipoCalculo: true,
    datas: false,
    opcoes: false
  });

  const [formData, setFormData] = useState({
    salarioBruto: '',
    tipoCalculo: 'integral', // integral, proporcional, rescisorio
    mesesProporcionais: 0,
    dataAdmissao: '',
    dataRescisao: '',
    anoReferencia: 2026,
    dependentesIR: 0,
    calcularINSS: true,
    calcularIRRF: true,
    primeiraParcelaPaga: false,
    valorPrimeiraParcela: '',
    adiantamento: ''
  });

  const [resultado, setResultado] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      if ((field === 'dataAdmissao' || field === 'dataRescisao' || field === 'anoReferencia') &&
          newData.dataAdmissao && newData.dataRescisao) {
        newData.mesesProporcionais = contarMeses13(newData.dataAdmissao, newData.dataRescisao, newData.anoReferencia);
      }

      return newData;
    });
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
    const calcINSS = formData.calcularINSS ? calcularINSS : null;
    const calcIRRF = formData.calcularIRRF ? calcularIRRF : null;
    const depIR = parseInt(formData.dependentesIR) || 0;

    let res = {};

    if (formData.tipoCalculo === 'integral') {
      res = calcular13Integral(salario, depIR, calcINSS, calcIRRF);
      res.tipo = '13º Integral';
    } else if (formData.tipoCalculo === 'proporcional') {
      const meses = parseInt(formData.mesesProporcionais) || 0;
      res = calcular13Proporcional(salario, meses, depIR, calcINSS, calcIRRF);
      res.tipo = `13º Proporcional (${meses}/12)`;
    } else {
      // Rescisório
      const meses = parseInt(formData.mesesProporcionais) || 0;
      res = calcular13Proporcional(salario, meses, depIR, calcINSS, calcIRRF);
      res.tipo = `13º Rescisório (${meses}/12)`;
    }

    // Adiantamento
    const adiantamento = parseFloat(formData.adiantamento) || 0;
    if (adiantamento > 0) {
      res.adiantamento = adiantamento;
      res.totalLiquido -= adiantamento;
    }

    // Se 1ª parcela já paga
    if (formData.primeiraParcelaPaga) {
      res.primeiraParcelaPaga = true;
      res.restantePagar = res.segundaParcela.liquida - (res.adiantamento || 0);
    }

    setResultado(res);
    toast.success('13º calculado com sucesso!');
  };

  const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const TIPOS = [
    { value: 'integral', label: '💰 13º Integral', desc: 'Salário integral do ano, 2 parcelas (50% cada)' },
    { value: 'proporcional', label: '📊 13º Proporcional', desc: 'Fração de meses trabalhados no ano' },
    { value: 'rescisorio', label: '💼 13º Rescisório', desc: 'Proporcional na rescisão contratual' }
  ];

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-100 text-green-600 p-3 rounded-2xl">
            <DollarSign size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Calculadora de 13º Salário 2026</h1>
            <p className="text-slate-500">Cálculo completo: integral, proporcional e rescisório com INSS e IRRF detalhados.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dados Básicos */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('dadosBasicos')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">💰 Dados Salariais</h2>
              {expandedSections.dadosBasicos ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.dadosBasicos && (
              <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            )}
          </div>

          {/* Tipo de Cálculo */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('tipoCalculo')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">📋 Tipo de Cálculo</h2>
              {expandedSections.tipoCalculo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.tipoCalculo && (
              <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-3 gap-3">
                {TIPOS.map(tipo => (
                  <label key={tipo.value}
                    className={`flex flex-col p-4 rounded-xl cursor-pointer transition-all border-2 ${
                      formData.tipoCalculo === tipo.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}>
                    <input type="radio" name="tipoCalculo"
                      checked={formData.tipoCalculo === tipo.value}
                      onChange={() => handleChange('tipoCalculo', tipo.value)}
                      className="mb-2 w-4 h-4 text-green-600" />
                    <p className="text-sm font-bold text-slate-800">{tipo.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{tipo.desc}</p>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Datas */}
          {(formData.tipoCalculo === 'proporcional' || formData.tipoCalculo === 'rescisorio') && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <button onClick={() => toggleSection('datas')}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                <h2 className="text-lg font-bold text-slate-800">📅 Datas e Meses</h2>
                {expandedSections.datas ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSections.datas && (
                <div className="p-5 pt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Data Admissão</label>
                      <input type="date" value={formData.dataAdmissao} onChange={(e) => handleChange('dataAdmissao', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Data Referência/Rescisão</label>
                      <input type="date" value={formData.dataRescisao} onChange={(e) => handleChange('dataRescisao', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Meses (auto/manual)</label>
                      <input type="number" value={formData.mesesProporcionais} onChange={(e) => handleChange('mesesProporcionais', parseInt(e.target.value))}
                        min="0" max="12" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Meses com ≥ 15 dias trabalhados contam integralmente.</p>
                </div>
              )}
            </div>
          )}

          {/* Opções */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('opcoes')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">⚙️ Opções de Cálculo</h2>
              {expandedSections.opcoes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.opcoes && (
              <div className="p-5 pt-0 space-y-4">
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.calcularINSS}
                    onChange={(e) => handleChange('calcularINSS', e.target.checked)} />
                  <span className="text-sm font-bold text-slate-700">Calcular INSS (2ª parcela)</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.calcularIRRF}
                    onChange={(e) => handleChange('calcularIRRF', e.target.checked)} />
                  <span className="text-sm font-bold text-slate-700">Calcular IRRF (2ª parcela)</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.primeiraParcelaPaga}
                    onChange={(e) => handleChange('primeiraParcelaPaga', e.target.checked)} />
                  <span className="text-sm font-bold text-slate-700">1ª Parcela já paga (antecipação)</span>
                </label>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Adiantamento/Desconto (R$)</label>
                  <input type="number" value={formData.adiantamento} onChange={(e) => handleChange('adiantamento', e.target.value)}
                    placeholder="Ex: 500,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
              </div>
            )}
          </div>

          {/* Botão */}
          <button onClick={calcular}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-green-500/20">
            <DollarSign size={18} className="inline mr-2" /> Calcular 13º Salário
          </button>
        </div>

        {/* Resultado */}
        <div className="lg:col-span-1">
          {resultado ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sticky top-4 space-y-4">
              <h2 className="text-lg font-bold text-slate-800">{resultado.tipo}</h2>

              <div className="p-3 bg-green-50 rounded-xl">
                <p className="text-xs text-green-600 font-bold mb-2">💵 1ª Parcela (Antecipação)</p>
                <div className="flex justify-between text-sm">
                  <span>50% sem descontos</span>
                  <span className="font-bold">{formatarMoeda(resultado.primeiraParcela)}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 font-bold mb-2">💰 2ª Parcela (com descontos)</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Valor Bruto</span><span className="font-bold">{formatarMoeda(resultado.segundaParcela.bruta)}</span></div>
                  {resultado.segundaParcela.inss > 0 && (
                    <div className="flex justify-between"><span>INSS</span><span className="font-bold text-red-600">-{formatarMoeda(resultado.segundaParcela.inss)}</span></div>
                  )}
                  {resultado.segundaParcela.irrf > 0 && (
                    <div className="flex justify-between"><span>IRRF (Faixa {resultado.segundaParcela.irrf > 0 ? resultado.totalIRRF > 0 ? 'aplicável' : '' : ''})</span><span className="font-bold text-red-600">-{formatarMoeda(resultado.segundaParcela.irrf)}</span></div>
                  )}
                  <div className="border-t border-blue-200 pt-1 flex justify-between font-bold">
                    <span>Líquida</span>
                    <span className="text-green-600">{formatarMoeda(resultado.segundaParcela.liquida)}</span>
                  </div>
                </div>
              </div>

              {resultado.adiantamento > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl">
                  <div className="flex justify-between text-sm"><span>Adiantamento</span><span className="font-bold text-red-600">-{formatarMoeda(resultado.adiantamento)}</span></div>
                </div>
              )}

              <div className="border-t pt-3">
                <div className="flex justify-between text-sm"><span>Total Bruto</span><span className="font-bold">{formatarMoeda(resultado.bruto)}</span></div>
                <div className="flex justify-between text-sm"><span>Total INSS</span><span className="font-bold text-red-600">-{formatarMoeda(resultado.totalINSS)}</span></div>
                {resultado.totalIRRF > 0 && (
                  <div className="flex justify-between text-sm"><span>Total IRRF</span><span className="font-bold text-red-600">-{formatarMoeda(resultado.totalIRRF)}</span></div>
                )}
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex justify-between">
                  <span className="font-black text-slate-800">TOTAL LÍQUIDO</span>
                  <span className="font-black text-green-600 text-xl">{formatarMoeda(resultado.totalLiquido)}</span>
                </div>
                {resultado.primeiraParcelaPaga && (
                  <p className="text-xs text-slate-500 mt-1">Restante a pagar (2ª parcela): {formatarMoeda(resultado.restantePagar)}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center sticky top-4">
              <DollarSign size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Preencha os dados</h3>
              <p className="text-sm text-slate-500">Configure o tipo de cálculo e clique em calcular.</p>
            </div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800">Base Legal Atualizada 2026</p>
          <p className="text-xs text-green-700 mt-1">
            Lei 4.090/62 (instituição), Lei 4.749/65 (parcelas), CLT Art. 489-490, Decreto 57.155/65.
            Prazos 2026: 1ª parcela até 30/11, 2ª parcela até 20/12. INSS progressivo (Lei 8.212/91),
            IRRF tabela progressiva (Lei 14.789/2023). Meses com ≥ 15 dias contam integralmente.
          </p>
        </div>
      </div>
    </div>
  );
}
