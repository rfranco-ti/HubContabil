import { useState } from 'react';
import { UserCheck, ChevronDown, ChevronUp, Info, DollarSign, Calendar, Percent, AlertTriangle, Calculator, Scale } from 'lucide-react';
import { toast } from 'sonner';

// ==================== CONSTANTES LEGAIS 2026 ====================
const SALARIO_MINIMO_2026 = 1621.00;
const TETO_INSS_2026 = 9030.34;
const CARÊNCIA_MESES = 180; // 15 anos

// Regras de transição 2026
const REGRA_PONTOS_2026 = { homem: 105, mulher: 95 };
const IDADE_MINIMA = { homem: 65, mulher: 62 };
const TEMPO_CONTRIBUICAO = { homem: 35, mulher: 15 }; // mínimo para regra geral

// Tabela expectativa de sobrevida IBGE 2026 (exemplos)
const TABELA_ES_IBGE = {
  55: { homem: 25.8, mulher: 30.5 },
  56: { homem: 25.0, mulher: 29.7 },
  57: { homem: 24.2, mulher: 28.9 },
  58: { homem: 23.4, mulher: 28.1 },
  59: { homem: 22.6, mulher: 27.3 },
  60: { homem: 21.6, mulher: 26.0 },
  61: { homem: 20.7, mulher: 25.1 },
  62: { homem: 19.8, mulher: 24.2 },
  63: { homem: 18.9, mulher: 23.3 },
  64: { homem: 18.3, mulher: 22.5 },
  65: { homem: 17.7, mulher: 21.8 },
  66: { homem: 16.9, mulher: 20.9 },
  67: { homem: 16.1, mulher: 20.1 },
  68: { homem: 15.4, mulher: 19.3 },
  69: { homem: 14.7, mulher: 18.5 },
  70: { homem: 14.2, mulher: 18.0 }
};

// ==================== FUNÇÕES DE CÁLCULO ====================

function calcularTempoContribuicao(dataAdmissao, dataAtual) {
  const adm = new Date(dataAdmissao);
  const atual = new Date(dataAtual);
  const diffMs = atual - adm;
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const anos = Math.floor(diffDias / 365.25);
  const meses = Math.floor((diffDias % 365.25) / 30.44);
  const totalMeses = Math.floor(diffDias / 30.44);
  return { anos, meses, totalMeses, totalDias: diffDias };
}

function calcularIdade(dataNascimento, dataAtual) {
  const nasc = new Date(dataNascimento);
  const atual = new Date(dataAtual);
  let idade = atual.getFullYear() - nasc.getFullYear();
  const mesAtual = atual.getMonth();
  const diaAtual = atual.getDate();
  const mesNasc = nasc.getMonth();
  const diaNasc = nasc.getDate();

  if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
    idade--;
  }
  return idade;
}

function calcularCoeficiente(tempoContribuicaoAnos, sexo) {
  const base = 60; // 60%
  const anosExcedentes = sexo === 'homem'
    ? Math.max(0, tempoContribuicaoAnos - 20)
    : Math.max(0, tempoContribuicaoAnos - 15);

  const adicional = anosExcedentes * 2; // +2% por ano excedente
  return Math.min(100, base + adicional) / 100; // Máximo 100%
}

function calcularFatorPrevidenciario(tempoContribuicao, idade, expectativaSobrevida) {
  const a = 0.31; // alíquota fixa
  const Tc = tempoContribuicao;
  const Es = expectativaSobrevida;

  const fator = (Tc * a * Es) / (1 + (Tc * a));
  return Math.round(fator * 10000) / 10000;
}

function calcularRMI(mediaSalarial, coeficiente, fatorPrevidenciario = null, aplicaFator = false) {
  let rmi = mediaSalarial * coeficiente;

  if (aplicaFator && fatorPrevidenciario) {
    rmi *= fatorPrevidenciario;
  }

  // Limites
  rmi = Math.max(SALARIO_MINIMO_2026, Math.min(TETO_INSS_2026, rmi));

  return Math.round(rmi * 100) / 100;
}

function verificarElegibilidade(idade, tempoContribuicaoAnos, pontos, sexo, regras) {
  const elegibilidade = {
    regraIdade: false,
    regraPontos: false,
    regraPedagio100: false,
    regrasAplicaveis: []
  };

  // Regra geral (idade + tempo)
  if (idade >= IDADE_MINIMA[sexo] && tempoContribuicaoAnos >= TEMPO_CONTRIBUICAO[sexo]) {
    elegibilidade.regraIdade = true;
    elegibilidade.regrasAplicaveis.push('Idade + Tempo de Contribuição');
  }

  // Regra de pontos
  if (pontos >= regras.pontos) {
    elegibilidade.regraPontos = true;
    elegibilidade.regrasAplicaveis.push('Pontos');
  }

  // Pedágio 100% (idade + tempo + 100% do que faltava em 13/11/2019)
  // Simplificado: verifica se tem tempo suficiente
  if (idade >= (sexo === 'homem' ? 60 : 57) && tempoContribuicaoAnos >= TEMPO_CONTRIBUICAO[sexo]) {
    elegibilidade.regraPedagio100 = true;
    elegibilidade.regrasAplicaveis.push('Pedágio 100%');
  }

  return elegibilidade;
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function SimuladorAposentadoriaCompleto() {
  const [expandedSections, setExpandedSections] = useState({
    dadosPessoais: true,
    contribuicoes: true,
    regras: true,
    comparativo: false
  });

  const [formData, setFormData] = useState({
    dataNascimento: '',
    sexo: 'homem',
    dataAdmissao: '',
    dataAtual: new Date().toISOString().split('T')[0],
    salarioContribuicao: '',
    salariosContribuicao: '', // lista de salários para média
    usarMediaSimples: true,
    aplicarFatorPrevidenciario: false,
    regraCalculo: 'geral' // geral, pontos, pedagio100
  });

  const [resultado, setResultado] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const calcular = () => {
    if (!formData.dataNascimento || !formData.dataAdmissao || !formData.salarioContribuicao) {
      toast.error('Preencha data de nascimento, admissão e salário de contribuição.');
      return;
    }

    const dataNasc = formData.dataNascimento;
    const dataAdm = formData.dataAdmissao;
    const dataAtual = formData.dataAtual;
    const salario = parseFloat(formData.salarioContribuicao);
    const sexo = formData.sexo;

    // Cálculos básicos
    const idade = calcularIdade(dataNasc, dataAtual);
    const tempo = calcularTempoContribuicao(dataAdm, dataAtual);
    const tempoAnosDecimal = tempo.totalMeses / 12;
    const pontos = idade + tempoAnosDecimal;

    // Expectativa de sobrevida
    const esData = TABELA_ES_IBGE[idade];
    const expectativaSobrevida = esData ? esData[sexo] : 20.0;

    // Coeficiente
    const coeficiente = calcularCoeficiente(tempoAnosDecimal, sexo);

    // Fator previdenciário
    const fatorPrev = calcularFatorPrevidenciario(tempoAnosDecimal, idade, expectativaSobrevida);

    // RMI (sem fator)
    const rmiSemFator = calcularRMI(salario, coeficiente, null, false);

    // RMI (com fator, se aplicável)
    const rmiComFator = calcularRMI(salario, coeficiente, fatorPrev, formData.aplicarFatorPrevidenciario);

    // Elegibilidade
    const elegibilidade = verificarElegibilidade(idade, tempoAnosDecimal, pontos, sexo, {
      pontos: REGRA_PONTOS_2026[sexo]
    });

    // Diferença entre com/sem fator
    const diffFator = rmiSemFator - rmiComFator;

    setResultado({
      idade,
      tempo,
      tempoAnosDecimal: Math.round(tempoAnosDecimal * 10) / 10,
      pontos: Math.round(pontos * 10) / 10,
      pontosNecessarios: REGRA_PONTOS_2026[sexo],
      expectativaSobrevida,
      coeficiente: (coeficiente * 100).toFixed(1) + '%',
      fatorPrevidenciario: Math.round(fatorPrev * 100) / 100,
      rmiSemFator,
      rmiComFator,
      diffFator: Math.round(diffFator * 100) / 100,
      elegibilidade,
      salario: Math.min(salario, TETO_INSS_2026),
      aplicaFator: formData.aplicarFatorPrevidenciario,
      regrasDisponiveis: ['Idade + Tempo', 'Pontos', 'Pedágio 100%']
    });

    toast.success('Aposentadoria simulada com sucesso!');
  };

  const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl">
            <UserCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Simulador de Aposentadoria 2026</h1>
            <p className="text-slate-500">Regras de transição, pontos, RMI, fator previdenciário e elegibilidade conforme EC 103/2019.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dados Pessoais */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('dadosPessoais')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">👤 Dados Pessoais</h2>
              {expandedSections.dadosPessoais ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.dadosPessoais && (
              <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Data de Nascimento</label>
                  <input type="date" value={formData.dataNascimento} onChange={(e) => handleChange('dataNascimento', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Sexo</label>
                  <select value={formData.sexo} onChange={(e) => handleChange('sexo', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                    <option value="homem">Homem</option>
                    <option value="mulher">Mulher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Data de Referência</label>
                  <input type="date" value={formData.dataAtual} onChange={(e) => handleChange('dataAtual', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
              </div>
            )}
          </div>

          {/* Contribuições */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('contribuicoes')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">💰 Contribuições</h2>
              {expandedSections.contribuicoes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.contribuicoes && (
              <div className="p-5 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Data de Admissão (1ª contribuição)</label>
                    <input type="date" value={formData.dataAdmissao} onChange={(e) => handleChange('dataAdmissao', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Salário de Contribuição Atual (R$)</label>
                    <input type="number" value={formData.salarioContribuicao} onChange={(e) => handleChange('salarioContribuicao', e.target.value)}
                      placeholder={`Teto: ${formatarMoeda(TETO_INSS_2026)}`} className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  </div>
                </div>
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.aplicarFatorPrevidenciario}
                    onChange={(e) => handleChange('aplicarFatorPrevidenciario', e.target.checked)} />
                  <div>
                    <span className="text-sm font-bold text-slate-700">Aplicar Fator Previdenciário?</span>
                    <p className="text-xs text-slate-500">Regra de transição pedágio 50% ou direito adquirido</p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Botão */}
          <button onClick={calcular}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-emerald-500/20">
            <Calculator size={18} className="inline mr-2" /> Simular Aposentadoria
          </button>
        </div>

        {/* Resultado */}
        <div className="lg:col-span-1">
          {resultado ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sticky top-4 space-y-4">
              <h2 className="text-lg font-bold text-slate-800">Resultado da Simulação</h2>

              {/* Idade e Tempo */}
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 font-bold mb-2">👤 Dados do Contribuinte</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Idade Atual</span><span className="font-bold">{resultado.idade} anos</span></div>
                  <div className="flex justify-between"><span>Tempo Contribuição</span><span className="font-bold">{resultado.tempo.anos}a {resultado.tempo.meses}m</span></div>
                  <div className="flex justify-between"><span>Pontos</span><span className="font-bold">{resultado.pontos} (nec: {resultado.pontosNecessarios})</span></div>
                  <div className="flex justify-between"><span>Exp. Sobrevida</span><span className="font-bold">{resultado.expectativaSobrevida} anos</span></div>
                </div>
              </div>

              {/* Elegibilidade */}
              <div className={`p-3 rounded-xl ${resultado.elegibilidade.regrasAplicaveis.length > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-xs font-bold mb-2">
                  {resultado.elegibilidade.regrasAplicaveis.length > 0 ? '✅ Elegível' : '❌ Não elegível ainda'}
                </p>
                {resultado.elegibilidade.regrasAplicaveis.length > 0 ? (
                  <div className="space-y-1 text-sm">
                    {resultado.elegibilidade.regrasAplicaveis.map((r, i) => (
                      <p key={i} className="text-green-700">✓ {r}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-red-600">
                    Faltam {Math.max(0, resultado.pontosNecessarios - resultado.pontos).toFixed(1)} pontos para regra de pontos.
                  </p>
                )}
              </div>

              {/* RMI */}
              <div className="p-3 bg-emerald-50 rounded-xl">
                <p className="text-xs text-emerald-600 font-bold mb-2">💰 Renda Mensal Inicial (RMI)</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Coeficiente</span><span className="font-bold">{resultado.coeficiente}</span></div>
                  <div className="flex justify-between"><span>RMI (sem fator)</span><span className="font-bold">{formatarMoeda(resultado.rmiSemFator)}</span></div>
                  {resultado.aplicaFator && (
                    <>
                      <div className="flex justify-between"><span>Fator Previd.</span><span className="font-bold">{resultado.fatorPrevidenciario}</span></div>
                      <div className="flex justify-between"><span>RMI (com fator)</span><span className="font-bold text-amber-600">{formatarMoeda(resultado.rmiComFator)}</span></div>
                      <div className="flex justify-between font-bold"><span>Diferença</span><span className="text-red-600">-{formatarMoeda(resultado.diffFator)}</span></div>
                    </>
                  )}
                </div>
              </div>

              {/* Resumo Final */}
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="flex justify-between">
                  <span className="font-black text-slate-800">RMI ESTIMADA</span>
                  <span className="font-black text-emerald-600 text-xl">
                    {formatarMoeda(resultado.aplicaFator ? resultado.rmiComFator : resultado.rmiSemFator)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Limites: mín. {formatarMoeda(SALARIO_MINIMO_2026)} / máx. {formatarMoeda(TETO_INSS_2026)}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center sticky top-4">
              <UserCheck size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Preencha os dados</h3>
              <p className="text-sm text-slate-500">Configure dados pessoais e contribuições.</p>
            </div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Base Legal Atualizada 2026</p>
          <p className="text-xs text-emerald-700 mt-1">
            EC 103/2019 (Reforma da Previdência), Lei 8.213/91 (Planos de Benefícios), Dec. 3.048/99.
            Regra 2026: pontos {REGRA_PONTOS_2026.homem}H/{REGRA_PONTOS_2026.mulher}M, idade mín. {IDADE_MINIMA.homem}H/{IDADE_MINIMA.mulher}M.
            Coeficiente: 60% + 2% por ano {'>'} 20H/15M (máx 100%). Fator previdenciário: Tc × 0,31 × Es / (1 + Tc × 0,31).
            Tabela IBGE 2026 para expectativa de sobrevida. Teto INSS: {formatarMoeda(TETO_INSS_2026)}.
          </p>
        </div>
      </div>
    </div>
  );
}
