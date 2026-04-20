import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Info, Shield, DollarSign, Percent as PercentIcon, Scale } from 'lucide-react';
import { toast } from 'sonner';

const SALARIO_MINIMO_2026 = 1621.00;

export default function CalculadoraInsalubridadePericulosidade() {
  const [expandedSections, setExpandedSections] = useState({ dados: true, adicionais: true, comparativo: true });
  const [formData, setFormData] = useState({
    salarioBase: '',
    tipoAdicional: 'nenhum',
    grauInsalubridade: 'medio',
    periculosidadePercentual: 30,
    horasExtrasMensal: 0,
    percentualHE: 50,
    calcularReflexos: true,
    acumularAdicionais: false
  });

  const [resultado, setResultado] = useState(null);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const toggleSection = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

  const calcular = () => {
    if (!formData.salarioBase) { toast.error('Informe o salário base.'); return; }

    const salario = parseFloat(formData.salarioBase);
    const horasExtras = parseFloat(formData.horasExtrasMensal) || 0;
    const percHE = parseFloat(formData.percentualHE) || 50;

    // Hora extra base
    const valorHE = horasExtras > 0 ? (salario / 220) * (1 + percHE / 100) * horasExtras : 0;

    // Insalubridade (base: salário mínimo)
    const grausInsal = { minimo: 0.10, medio: 0.20, maximo: 0.40 };
    const valorInsalubridade = formData.tipoAdicional === 'insalubridade'
      ? SALARIO_MINIMO_2026 * grausInsal[formData.grauInsalubridade]
      : 0;

    // Periculosidade (base: salário base)
    const valorPericulosidade = formData.tipoAdicional === 'periculosidade'
      ? salario * (formData.periculosidadePercentual / 100)
      : 0;

    // Acúmulo (não permitido na prática, mas calculamos para comparação)
    let adicionalSelecionado = 0;
    let tipoSelecionado = '';
    if (formData.tipoAdicional === 'insalubridade') {
      adicionalSelecionado = valorInsalubridade;
      tipoSelecionado = `Insalubridade (${formData.grauInsalubridade})`;
    } else if (formData.tipoAdicional === 'periculosidade') {
      adicionalSelecionado = valorPericulosidade;
      tipoSelecionado = `Periculosidade (${formData.periculosidadePercentual}%)`;
    }

    const salarioComAdicional = salario + adicionalSelecionado;

    // Reflexos
    let reflexos = null;
    if (formData.calcularReflexos && adicionalSelecionado > 0) {
      const reflexoFGTS = adicionalSelecionado * 0.08;
      const reflexo13 = adicionalSelecionado / 12;
      const reflexoFerias = adicionalSelecionado / 12;
      const reflexoFeriasTerco = reflexoFerias / 3;
      const reflexoHE = horasExtras > 0 ? (adicionalSelecionado / 220) * (1 + percHE / 100) * horasExtras : 0;

      reflexos = {
        fgts: reflexoFGTS,
        decimoTerceiro: reflexo13 * 12,
        ferias: reflexoFerias,
        tercoFerias: reflexoFeriasTerco,
        horasExtras: reflexoHE,
        totalMensal: reflexoFGTS + reflexo13 + reflexoFerias + reflexoFeriasTerco + (reflexoHE / 12),
        totalAnual: (reflexoFGTS + reflexo13 + reflexoFerias + reflexoFeriasTerco + reflexoHE / 12) * 12
      };
    }

    setResultado({
      salarioBase: salario,
      horasExtras: { qtd: horasExtras, valor: valorHE },
      adicional: { tipo: tipoSelecionado, valor: adicionalSelecionado },
      insalubridade: {
        minimo: SALARIO_MINIMO_2026 * 0.10,
        medio: SALARIO_MINIMO_2026 * 0.20,
        maximo: SALARIO_MINIMO_2026 * 0.40
      },
      periculosidade: {
        valor: salario * 0.30,
        percentual: 30
      },
      salarioComAdicional,
      reflexos,
      comparativo: {
        diff: Math.abs(valorInsalubridade - valorPericulosidade),
        maisVantajoso: valorInsalubridade > valorPericulosidade ? 'Insalubridade' : 'Periculosidade',
        insalubridade: valorInsalubridade,
        periculosidade: valorPericulosidade
      }
    });

    toast.success('Adicionais calculados com sucesso!');
  };

  const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const GRAUS = [
    { value: 'minimo', label: 'Mínimo (10%)', valor: SALARIO_MINIMO_2026 * 0.10, exemplos: 'Umidade, ruído entre limites' },
    { value: 'medio', label: 'Médio (20%)', valor: SALARIO_MINIMO_2026 * 0.20, exemplos: 'Calor, agentes químicos' },
    { value: 'maximo', label: 'Máximo (40%)', valor: SALARIO_MINIMO_2026 * 0.40, exemplos: 'Radiação, agentes biológicos' }
  ];

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl"><AlertTriangle size={24} /></div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Calculadora de Insalubridade e Periculosidade 2026</h1>
            <p className="text-slate-500">Compare adicionais, calcule reflexos em FGTS, férias, 13º e horas extras.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dados Salariais */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('dados')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">💰 Dados Salariais</h2>
              {expandedSections.dados ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.dados && (
              <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Salário Base (R$)</label>
                  <input type="number" value={formData.salarioBase} onChange={(e) => handleChange('salarioBase', e.target.value)}
                    placeholder="Ex: 3.000,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Horas Extras Mensais (qtd)</label>
                  <input type="number" value={formData.horasExtrasMensal} onChange={(e) => handleChange('horasExtrasMensal', parseFloat(e.target.value))}
                    min="0" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
                {formData.horasExtrasMensal > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">% Horas Extras</label>
                    <select value={formData.percentualHE} onChange={(e) => handleChange('percentualHE', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                      <option value={50}>50% (padrão)</option>
                      <option value={100}>100% (dom/feriado)</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tipo de Adicional */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('adicionais')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">⚠️ Tipo de Adicional</h2>
              {expandedSections.adicionais ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.adicionais && (
              <div className="p-5 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className={`flex flex-col p-4 rounded-xl cursor-pointer transition-all border-2 ${
                    formData.tipoAdicional === 'nenhum' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <input type="radio" name="tipoAdicional" checked={formData.tipoAdicional === 'nenhum'}
                      onChange={() => handleChange('tipoAdicional', 'nenhum')} className="mb-2 w-4 h-4" />
                    <p className="text-sm font-bold text-slate-800">Nenhum</p>
                    <p className="text-xs text-slate-500 mt-1">Sem adicional</p>
                  </label>
                  <label className={`flex flex-col p-4 rounded-xl cursor-pointer transition-all border-2 ${
                    formData.tipoAdicional === 'insalubridade' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <input type="radio" name="tipoAdicional" checked={formData.tipoAdicional === 'insalubridade'}
                      onChange={() => handleChange('tipoAdicional', 'insalubridade')} className="mb-2 w-4 h-4" />
                    <p className="text-sm font-bold text-slate-800">Insalubridade</p>
                    <p className="text-xs text-slate-500 mt-1">Base: salário mínimo</p>
                  </label>
                  <label className={`flex flex-col p-4 rounded-xl cursor-pointer transition-all border-2 ${
                    formData.tipoAdicional === 'periculosidade' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <input type="radio" name="tipoAdicional" checked={formData.tipoAdicional === 'periculosidade'}
                      onChange={() => handleChange('tipoAdicional', 'periculosidade')} className="mb-2 w-4 h-4" />
                    <p className="text-sm font-bold text-slate-800">Periculosidade</p>
                    <p className="text-xs text-slate-500 mt-1">Base: salário base (30%)</p>
                  </label>
                </div>

                {formData.tipoAdicional === 'insalubridade' && (
                  <div className="space-y-3 p-4 bg-amber-50 rounded-xl">
                    <h3 className="text-sm font-bold text-amber-800">Grau de Insalubridade (NR-15)</h3>
                    {GRAUS.map(grau => (
                      <label key={grau.value} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border ${
                        formData.grauInsalubridade === grau.value ? 'border-amber-500 bg-white' : 'border-amber-200'
                      }`}>
                        <input type="radio" name="grauInsal" checked={formData.grauInsalubridade === grau.value}
                          onChange={() => handleChange('grauInsalubridade', grau.value)} className="w-4 h-4" />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-bold text-slate-800">{grau.label}</span>
                            <span className="text-sm font-bold text-amber-600">{formatarMoeda(grau.valor)}</span>
                          </div>
                          <p className="text-xs text-slate-500">{grau.exemplos}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {formData.tipoAdicional === 'periculosidade' && (
                  <div className="p-4 bg-red-50 rounded-xl">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Percentual de Periculosidade</label>
                    <select value={formData.periculosidadePercentual} onChange={(e) => handleChange('periculosidadePercentual', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                      <option value={30}>30% (padrão - NR-16)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-2">Atividades: inflamáveis, energia elétrica, vigilância, motocicleta, frentista</p>
                  </div>
                )}

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.calcularReflexos}
                    onChange={(e) => handleChange('calcularReflexos', e.target.checked)} />
                  <span className="text-sm font-bold text-slate-700">Calcular reflexos (FGTS, 13º, Férias, HE)</span>
                </label>
              </div>
            )}
          </div>

          <button onClick={calcular}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-amber-500/20">
            <Shield size={18} className="inline mr-2" /> Calcular Adicionais
          </button>
        </div>

        {/* Resultado */}
        <div className="lg:col-span-1">
          {resultado ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sticky top-4 space-y-4">
              <h2 className="text-lg font-bold text-slate-800">Resultado</h2>

              {/* Tabela Comparativa */}
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 font-bold mb-2">⚖️ Comparativo de Valores</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Insalubridade (médio)</span><span className="font-bold text-amber-600">{formatarMoeda(resultado.insalubridade.medio)}</span></div>
                  <div className="flex justify-between text-sm"><span>Insalubridade (máximo)</span><span className="font-bold text-amber-600">{formatarMoeda(resultado.insalubridade.maximo)}</span></div>
                  <div className="flex justify-between text-sm"><span>Periculosidade (30%)</span><span className="font-bold text-red-600">{formatarMoeda(resultado.periculosidade.valor)}</span></div>
                  <div className="border-t border-blue-200 pt-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span>Mais vantajoso:</span>
                      <span className={resultado.comparativo.maisVantajoso === 'Insalubridade' ? 'text-amber-600' : 'text-red-600'}>
                        {resultado.comparativo.maisVantajoso} ({formatarMoeda(resultado.comparativo.diff)})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adicional Selecionado */}
              {resultado.adicional.valor > 0 && (
                <div className={`p-3 rounded-xl ${resultado.adicional.tipo.includes('Insalubridade') ? 'bg-amber-50' : 'bg-red-50'}`}>
                  <p className="text-xs font-bold mb-2">✅ Adicional Selecionado</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Tipo</span><span className="font-bold">{resultado.adicional.tipo}</span></div>
                    <div className="flex justify-between"><span>Valor Mensal</span><span className="font-bold">{formatarMoeda(resultado.adicional.valor)}</span></div>
                    <div className="flex justify-between"><span>Salário + Adicional</span><span className="font-bold">{formatarMoeda(resultado.salarioComAdicional)}</span></div>
                  </div>
                </div>
              )}

              {/* Reflexos */}
              {resultado.reflexos && (
                <div className="p-3 bg-green-50 rounded-xl">
                  <p className="text-xs text-green-600 font-bold mb-2">📊 Reflexos do Adicional</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>FGTS (8%/mês)</span><span className="font-bold">{formatarMoeda(resultado.reflexos.fgts)}</span></div>
                    <div className="flex justify-between"><span>13º Salário (anual)</span><span className="font-bold">{formatarMoeda(resultado.reflexos.decimoTerceiro)}</span></div>
                    <div className="flex justify-between"><span>Férias + 1/3 (anual)</span><span className="font-bold">{formatarMoeda(resultado.reflexos.ferias + resultado.reflexos.tercoFerias)}</span></div>
                    <div className="border-t border-green-200 pt-1 flex justify-between font-bold">
                      <span>Custo Mensal Extra</span>
                      <span className="text-green-600">{formatarMoeda(resultado.reflexos.totalMensal)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Custo Anual Extra</span>
                      <span className="text-green-600">{formatarMoeda(resultado.reflexos.totalAnual)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center sticky top-4">
              <AlertTriangle size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Preencha os dados</h3>
              <p className="text-sm text-slate-500">Configure o tipo de adicional e clique em calcular.</p>
            </div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Base Legal Atualizada 2026</p>
          <p className="text-xs text-amber-700 mt-1">
            Insalubridade: CLT Art. 189-197, NR-15, Súmula Vinculante 4 STF (base = salário mínimo).
            Periculosidade: CLT Art. 193-194, NR-16, Lei 12.740/2012 (base = salário-base, 30%).
            Acúmulo: NÃO permitido (optar pelo mais vantajoso). Salário mínimo 2026: {formatarMoeda(SALARIO_MINIMO_2026)}.
            Reflexos: FGTS, 13º, Férias + 1/3, Horas Extras (Súmula 191 TST).
          </p>
        </div>
      </div>
    </div>
  );
}
