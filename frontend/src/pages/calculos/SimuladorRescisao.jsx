import { useState } from 'react';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Info,
  Download,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

// ==================== CONSTANTES 2026 ====================
const SALARIO_MINIMO_2026 = 1621.00;
const TETO_INSS_2026 = 9030.34;
const DEDUCAO_DEPENDENTE_IR = 189.59;
const VALOR_COTA_SALARIO_FAMILIA = 67.54;
const LIMITE_SALARIO_FAMILIA = 1621.00;

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

const MOTIVOS_DESLIGAMENTO = [
  { value: 'sem_justa_causa', label: 'Demissão SEM Justa Causa' },
  { value: 'com_justa_causa', label: 'Demissão COM Justa Causa' },
  { value: 'pedido_demissao', label: 'Pedido de Demissão' },
  { value: 'acordo_mutuo', label: 'Acordo Mútuo (Art. 484-A)' }
];

const TIPOS_AVISO = [
  { value: 'indenizado', label: 'Indenizado' },
  { value: 'trabalhado', label: 'Trabalhado' },
  { value: 'nao_aplicavel', label: 'Não Aplicável' }
];

// ==================== FUNÇÕES DE CÁLCULO ====================

function calcularTempoServico(admissao, rescisao) {
  const dataAdm = new Date(admissao);
  const dataResc = new Date(rescisao);
  
  let anos = dataResc.getFullYear() - dataAdm.getFullYear();
  let meses = dataResc.getMonth() - dataAdm.getMonth();
  let dias = dataResc.getDate() - dataAdm.getDate();
  
  if (dias < 0) {
    meses--;
    dias += 30;
  }
  if (meses < 0) {
    anos--;
    meses += 12;
  }
  
  const totalMeses = anos * 12 + meses;
  const totalDias = Math.floor((dataResc - dataAdm) / (1000 * 60 * 60 * 24));
  
  return { anos, meses, dias, totalMeses, totalDias };
}

function calcularAvisoPrevio(anosCompletos, salario, tipo) {
  if (tipo === 'nao_aplicavel') return { dias: 0, valor: 0 };
  
  const dias = Math.min(90, Math.max(30, 30 + (anosCompletos * 3)));
  const valor = (salario / 30) * dias;
  
  return { dias, valor };
}

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
  
  return Math.min(inss, TETO_INSS_2026 * 0.14);
}

function calcularIRRF(base, dependentes = 0) {
  const deducaoDep = dependentes * DEDUCAO_DEPENDENTE_IR;
  const baseCalculo = base - deducaoDep;
  
  if (baseCalculo <= 0) return { valor: 0, baseCalculo: 0, faixa: 1 };
  
  const faixa = FAIXAS_IRRF.find(f => baseCalculo <= f.limite);
  const valor = Math.max(0, (baseCalculo * faixa.aliquota) - faixa.deducao);
  const numFaixa = FAIXAS_IRRF.indexOf(faixa) + 1;
  
  return { valor: Math.round(valor * 100) / 100, baseCalculo, faixa: numFaixa };
}

function calcularFeriasProporcionais(salario, dataAdmissao, dataRescisaoProjetada, faltas) {
  const adm = new Date(dataAdmissao);
  const resc = new Date(dataRescisaoProjetada);
  
  let meses = 0;
  let dataAtual = new Date(adm);
  
  while (dataAtual < resc) {
    const diaMes = dataAtual.getDate();
    dataAtual.setMonth(dataAtual.getMonth() + 1);
    
    if (diaMes <= 15) {
      meses++;
    }
  }
  
  meses = Math.min(meses, 12);
  
  if (faltas) {
    // Verificar impacto das faltas nas férias (art. 130 CLT)
    // Simplificado: não aplicar redução neste exemplo
  }
  
  const valorFerias = (salario / 12) * meses;
  const terco = valorFerias / 3;
  
  return { meses, valorFerias: Math.round(valorFerias * 100) / 100, terco: Math.round(terco * 100) / 100 };
}

function calcularDecimoTerceiro(salario, dataAdmissao, dataRescisaoProjetada, anoRescisao, faltas) {
  const adm = new Date(dataAdmissao);
  const resc = new Date(dataRescisaoProjetada);
  
  const inicioAno = new Date(anoRescisao, 0, 1);
  const dataBase = adm > inicioAno ? adm : inicioAno;
  
  let meses = 0;
  for (let mes = dataBase.getMonth(); mes <= resc.getMonth(); mes++) {
    const diasNoMes = mes === resc.getMonth() ? resc.getDate() : 30;
    if (diasNoMes >= 15) {
      meses++;
    }
  }
  
  meses = Math.min(meses, 12);
  
  if (faltas) {
    // Simplificado: não aplicar redução
  }
  
  const valor = (salario / 12) * meses;
  
  return { meses, valor: Math.round(valor * 100) / 100 };
}

function calcularSeguroDesemprego(salario, mesesTrabalhados, numSolicitacoes) {
  const media = salario;
  
  let parcela;
  if (media <= 1902.42) {
    parcela = media * 0.80;
  } else if (media <= 3170.71) {
    parcela = (media * 0.50) + 760.90;
  } else {
    parcela = 2250.52;
  }
  
  parcela = Math.max(SALARIO_MINIMO_2026, Math.min(2250.52, parcela));
  
  let parcelas;
  if (numSolicitacoes === 0) {
    parcelas = mesesTrabalhados >= 24 ? 5 : mesesTrabalhados >= 12 ? 4 : 0;
  } else if (numSolicitacoes === 1) {
    parcelas = mesesTrabalhados >= 12 ? 5 : mesesTrabalhados >= 9 ? 4 : mesesTrabalhados >= 6 ? 3 : 0;
  } else {
    parcelas = mesesTrabalhados >= 6 ? 5 : 0;
  }
  
  return {
    media,
    valorParcela: Math.round(parcela * 100) / 100,
    numParcelas: parcelas,
    total: Math.round(parcela * parcelas * 100) / 100
  };
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function SimuladorRescisao() {
  const [formData, setFormData] = useState({
    anoRescisao: 2026,
    dataAdmissao: '',
    dataRescisao: '',
    salario: '',
    jornadaMensal: 220,
    saldoFGTS: '',
    dependentesIR: 0,
    dependentesSalarioFamilia: 0,
    feriasVencidas: false,
    faltasPeriodo: 0,
    motivoDesligamento: 'sem_justa_causa',
    tipoAviso: 'indenizado',
    dataAviso: '',
    insalubridade: 'nenhum',
    periculosidade: false,
    adicionalNoturno: false,
    horasExtras: false,
    qtdHorasExtras: 0,
    percentualHE: 50,
    diasFaltaMes: 0,
    horasFaltas: '',
    adiantamento: '',
    valeTransporte: false,
    outrosDescontos: '',
    divisorSalarial: '30'
  });

  const [resultado, setResultado] = useState(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calcularRescisao = () => {
    // Validações
    if (!formData.dataAdmissao || !formData.dataRescisao || !formData.salario) {
      toast.error('Preencha data de admissão, data de rescisão e salário.');
      return;
    }

    const salario = parseFloat(formData.salario);
    const admissao = formData.dataAdmissao;
    const rescisao = formData.dataRescisao;
    
    // 1. Tempo de serviço
    const tempo = calcularTempoServico(admissao, rescisao);
    
    // 2. Aviso prévio
    const aviso = calcularAvisoPrevio(tempo.anos, salario, formData.tipoAviso);
    
    // 3. Data projetada
    const dataProjetada = formData.tipoAviso === 'indenizado'
      ? new Date(new Date(rescisao).getTime() + aviso.dias * 24 * 60 * 60 * 1000)
      : new Date(rescisao);
    
    // 4. Saldo de salário
    const diasMes = formData.divisorSalarial === '30'
      ? new Date(rescisao).getDate()
      : new Date(rescisao).getDate();
    const saldoSalario = (salario / 30) * diasMes;
    
    // 5. Férias vencidas
    const feriasVencidas = formData.feriasVencidas
      ? { valor: salario, terco: salario / 3 }
      : null;
    
    // 6. Férias proporcionais
    const feriasProp = calcularFeriasProporcionais(salario, admissao, dataProjetada.toISOString(), parseInt(formData.faltasPeriodo));
    
    // 7. 13º proporcional
    const decimo = calcularDecimoTerceiro(salario, admissao, dataProjetada.toISOString(), formData.anoRescisao, parseInt(formData.faltasPeriodo));
    
    // 8. Multa FGTS
    let multaFGTS = 0;
    const saldoFGTS = parseFloat(formData.saldoFGTS) || 0;
    
    if (formData.motivoDesligamento === 'sem_justa_causa') {
      multaFGTS = saldoFGTS * 0.40;
    } else if (formData.motivoDesligamento === 'acordo_mutuo') {
      multaFGTS = saldoFGTS * 0.20;
    }
    
    // 9. Descontos
    const descontoFaltas = (salario / 30) * parseInt(formData.diasFaltaMes || 0);
    
    // INSS sobre saldo de salário
    const inssSS = calcularINSS(saldoSalario);
    // INSS sobre 13º
    const inss13 = calcularINSS(decimo.valor);
    const totalINSS = inssSS + inss13;
    
    // IRRF
    const baseIRRFSS = saldoSalario - inssSS;
    const baseIRRF13 = decimo.valor - inss13;
    const irrfSS = calcularIRRF(baseIRRFSS, parseInt(formData.dependentesIR));
    const irrf13 = calcularIRRF(baseIRRF13, parseInt(formData.dependentesIR));
    const totalIRRF = irrfSS.valor + irrf13.valor;
    
    const descontoAdiantamento = parseFloat(formData.adiantamento) || 0;
    const descontoVT = formData.valeTransporte ? salario * 0.06 : 0;
    const outrosDescontos = parseFloat(formData.outrosDescontos) || 0;
    
    const totalDescontos = descontoFaltas + totalINSS + totalIRRF + descontoAdiantamento + descontoVT + outrosDescontos;
    
    // 10. Total proventos
    const totalProventos = saldoSalario +
      (aviso.valor || 0) +
      (feriasVencidas ? feriasVencidas.valor + feriasVencidas.terco : 0) +
      feriasProp.valorFerias + feriasProp.terco +
      decimo.valor +
      multaFGTS;
    
    const liquido = totalProventos - totalDescontos;
    
    // 11. Seguro desemprego
    const seguroDesemprego = formData.motivoDesligamento === 'sem_justa_causa'
      ? calcularSeguroDesemprego(salario, tempo.totalMeses, 0)
      : null;
    
    setResultado({
      tempo,
      aviso,
      dataProjetada: dataProjetada.toLocaleDateString('pt-BR'),
      saldoSalario,
      diasTrabalhados: diasMes,
      feriasVencidas,
      feriasProp,
      decimo,
      multaFGTS,
      saldoFGTS,
      descontos: {
        faltas: descontoFaltas,
        inssSS: inssSS,
        inss13: inss13,
        totalINSS,
        irrfSS: irrfSS.valor,
        irrf13: irrf13.valor,
        totalIRRF,
        adiantamento: descontoAdiantamento,
        valeTransporte: descontoVT,
        outros: outrosDescontos,
        total: totalDescontos
      },
      totalProventos,
      liquido,
      seguroDesemprego
    });
    
    setMostrarDetalhes(true);
    toast.success('Rescisão calculada com sucesso!');
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
            <Calculator size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Simulador de Rescisão 2026</h1>
            <p className="text-slate-500">Cálculo completo de verbas rescisórias conforme CLT e legislação 2026.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados do Contrato */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              📋 Dados do Contrato
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Ano da Rescisão</label>
                <select
                  value={formData.anoRescisao}
                  onChange={(e) => handleChange('anoRescisao', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2026}>2026 (Regra Atual)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Jornada Mensal (Horas)</label>
                <input
                  type="number"
                  value={formData.jornadaMensal}
                  onChange={(e) => handleChange('jornadaMensal', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Data de Admissão</label>
                <input
                  type="date"
                  value={formData.dataAdmissao}
                  onChange={(e) => handleChange('dataAdmissao', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Data do Desligamento</label>
                <input
                  type="date"
                  value={formData.dataRescisao}
                  onChange={(e) => handleChange('dataRescisao', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Salário e Benefícios */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              💰 Salário e Benefícios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Último Salário Bruto (R$)</label>
                <input
                  type="number"
                  value={formData.salario}
                  onChange={(e) => handleChange('salario', e.target.value)}
                  placeholder="Ex: 3.000,00"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Saldo do FGTS (R$)</label>
                <input
                  type="number"
                  value={formData.saldoFGTS}
                  onChange={(e) => handleChange('saldoFGTS', e.target.value)}
                  placeholder="Ex: 5.000,00"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Dependentes p/ IR</label>
                <input
                  type="number"
                  value={formData.dependentesIR}
                  onChange={(e) => handleChange('dependentesIR', e.target.value)}
                  min="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Dependentes p/ Salário Família</label>
                <input
                  type="number"
                  value={formData.dependentesSalarioFamilia}
                  onChange={(e) => handleChange('dependentesSalarioFamilia', e.target.value)}
                  min="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Motivo e Aviso */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              📄 Motivo e Aviso Prévio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Motivo do Desligamento</label>
                <select
                  value={formData.motivoDesligamento}
                  onChange={(e) => handleChange('motivoDesligamento', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MOTIVOS_DESLIGAMENTO.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tipo de Aviso Prévio</label>
                <select
                  value={formData.tipoAviso}
                  onChange={(e) => handleChange('tipoAviso', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIPOS_AVISO.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Possui Férias Vencidas?</label>
                <select
                  value={formData.feriasVencidas}
                  onChange={(e) => handleChange('feriasVencidas', e.target.value === 'true')}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={false}>Não</option>
                  <option value={true}>Sim</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Faltas no Período</label>
                <input
                  type="number"
                  value={formData.faltasPeriodo}
                  onChange={(e) => handleChange('faltasPeriodo', e.target.value)}
                  min="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Descontos */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              ➖ Descontos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Dias de Falta no Mês</label>
                <input
                  type="number"
                  value={formData.diasFaltaMes}
                  onChange={(e) => handleChange('diasFaltaMes', e.target.value)}
                  min="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Desconto Adiantamento (R$)</label>
                <input
                  type="number"
                  value={formData.adiantamento}
                  onChange={(e) => handleChange('adiantamento', e.target.value)}
                  placeholder="Ex: 1.200,00"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Descontar Vale Transporte (6%)?</label>
                <select
                  value={formData.valeTransporte}
                  onChange={(e) => handleChange('valeTransporte', e.target.value === 'true')}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={false}>Não</option>
                  <option value={true}>Sim</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Outros Descontos (R$)</label>
                <input
                  type="number"
                  value={formData.outrosDescontos}
                  onChange={(e) => handleChange('outrosDescontos', e.target.value)}
                  placeholder="Ex: 50,00"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Divisor Salarial</label>
                <select
                  value={formData.divisorSalarial}
                  onChange={(e) => handleChange('divisorSalarial', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30">Sempre 30 dias</option>
                  <option value="diasMes">Conforme dias no mês</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botão Calcular */}
          <button
            onClick={calcularRescisao}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
            <Calculator size={18} className="inline mr-2" />
            Calcular Rescisão
          </button>
        </div>

        {/* Resultado */}
        <div className="lg:col-span-1">
          {resultado ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Resultado</h2>
                <button
                  onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {mostrarDetalhes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {/* Tempo de Serviço */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 font-bold mb-1">Tempo de Serviço</p>
                <p className="text-sm font-bold text-slate-800">
                  {resultado.tempo.anos} anos, {resultado.tempo.meses} meses e {resultado.tempo.dias} dias
                </p>
              </div>

              {/* Proventos */}
              <div className="space-y-2 mb-4">
                <p className="text-xs text-slate-500 font-bold">PROVENTOS</p>
                
                <div className="flex justify-between text-sm">
                  <span>Saldo de Salário ({resultado.diasTrabalhados} dias)</span>
                  <span className="font-bold">{formatarMoeda(resultado.saldoSalario)}</span>
                </div>
                
                {resultado.aviso.valor > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Aviso Prévio ({resultado.aviso.dias} dias)</span>
                    <span className="font-bold">{formatarMoeda(resultado.aviso.valor)}</span>
                  </div>
                )}
                
                {resultado.feriasVencidas && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Férias Vencidas</span>
                      <span className="font-bold">{formatarMoeda(resultado.feriasVencidas.valor)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>1/3 Férias Vencidas</span>
                      <span className="font-bold">{formatarMoeda(resultado.feriasVencidas.terco)}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between text-sm">
                  <span>Férias Proporcionais ({resultado.feriasProp.meses}/12)</span>
                  <span className="font-bold">{formatarMoeda(resultado.feriasProp.valorFerias)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>1/3 Férias Proporcionais</span>
                  <span className="font-bold">{formatarMoeda(resultado.feriasProp.terco)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>13º Proporcional ({resultado.decimo.meses}/12)</span>
                  <span className="font-bold">{formatarMoeda(resultado.decimo.valor)}</span>
                </div>
                
                {resultado.multaFGTS > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Multa FGTS ({formData.motivoDesligamento === 'acordo_mutuo' ? '20%' : '40%'})</span>
                    <span className="font-bold">{formatarMoeda(resultado.multaFGTS)}</span>
                  </div>
                )}
                
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                  <span className="font-bold">Total Proventos</span>
                  <span className="font-bold text-green-600">{formatarMoeda(resultado.totalProventos)}</span>
                </div>
              </div>

              {/* Descontos */}
              <div className="space-y-2 mb-4">
                <p className="text-xs text-slate-500 font-bold">DESCONTOS</p>
                
                {resultado.descontos.faltas > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Faltas</span>
                    <span className="font-bold text-red-600">-{formatarMoeda(resultado.descontos.faltas)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span>INSS</span>
                  <span className="font-bold text-red-600">-{formatarMoeda(resultado.descontos.totalINSS)}</span>
                </div>
                
                {resultado.descontos.totalIRRF > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>IRRF</span>
                    <span className="font-bold text-red-600">-{formatarMoeda(resultado.descontos.totalIRRF)}</span>
                  </div>
                )}
                
                {resultado.descontos.adiantamento > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Adiantamento</span>
                    <span className="font-bold text-red-600">-{formatarMoeda(resultado.descontos.adiantamento)}</span>
                  </div>
                )}
                
                {resultado.descontos.valeTransporte > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Vale Transporte</span>
                    <span className="font-bold text-red-600">-{formatarMoeda(resultado.descontos.valeTransporte)}</span>
                  </div>
                )}
                
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                  <span className="font-bold">Total Descontos</span>
                  <span className="font-bold text-red-600">-{formatarMoeda(resultado.descontos.total)}</span>
                </div>
              </div>

              {/* Líquido */}
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between">
                  <span className="font-black text-slate-800">LÍQUIDO A PAGAR</span>
                  <span className="font-black text-green-600 text-lg">{formatarMoeda(resultado.liquido)}</span>
                </div>
              </div>

              {/* Seguro Desemprego */}
              {resultado.seguroDesemprego && resultado.seguroDesemprego.numParcelas > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600 font-bold mb-2">SEGURO DESEMPREGO</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Valor Parcela:</span>
                      <span className="font-bold">{formatarMoeda(resultado.seguroDesemprego.valorParcela)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nº Parcelas:</span>
                      <span className="font-bold">{resultado.seguroDesemprego.numParcelas}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-1">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold">{formatarMoeda(resultado.seguroDesemprego.total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão Exportar */}
              <button
                onClick={() => toast.info('Exportação TRCT em desenvolvimento')}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all"
              >
                <Download size={16} />
                Exportar TRCT
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center sticky top-4">
              <Calculator size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Preencha os dados</h3>
              <p className="text-sm text-slate-500">
                Informe os dados do contrato e clique em "Calcular Rescisão" para ver o resultado completo.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Banner Informativo */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Simulador de referência</p>
          <p className="text-xs text-amber-700 mt-1">
            Este simulador utiliza as tabelas e legislação vigentes em 2026. Os valores são aproximados e podem variar conforme具体情况. 
            Consulte sempre um contador ou advogado trabalhista para cálculos oficiais. Base legal: CLT, Lei 12.506/2011, Lei 7.998/90, LC 123/2006.
          </p>
        </div>
      </div>
    </div>
  );
}
