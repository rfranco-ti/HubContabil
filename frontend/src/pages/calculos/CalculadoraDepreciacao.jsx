import { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, Info, DollarSign, Calendar, Percent, AlertTriangle, TrendingDown, Clock, Building2 } from 'lucide-react';
import { toast } from 'sonner';

// ==================== TABELA DEPRECIAÇÃO RFB 2026 (IN 1.700/2017) ====================
const TABELA_DEPRECIACAO = [
  { categoria: 'Edifícios e Construções', taxaAnual: 4, vidaUtil: 25 },
  { categoria: 'Máquinas e Equipamentos', taxaAnual: 10, vidaUtil: 10 },
  { categoria: 'Veículos (carros/caminhonetes)', taxaAnual: 20, vidaUtil: 5 },
  { categoria: 'Caminhões e Ônibus', taxaAnual: 16.67, vidaUtil: 6 },
  { categoria: 'Computadores e Periféricos', taxaAnual: 20, vidaUtil: 5 },
  { categoria: 'Móveis e Utensílios', taxaAnual: 10, vidaUtil: 10 },
  { categoria: 'Instalações', taxaAnual: 10, vidaUtil: 10 },
  { categoria: 'Ferramentas', taxaAnual: 10, vidaUtil: 10 },
  { categoria: 'Equipamentos de Escritório', taxaAnual: 20, vidaUtil: 5 },
  { categoria: 'Benfeitorias em Imóveis Terceiros', taxaAnual: 10, vidaUtil: 10 },
  { categoria: 'Aeronaves', taxaAnual: 6.67, vidaUtil: 15 },
  { categoria: 'Embarcações', taxaAnual: 5, vidaUtil: 20 },
  { categoria: 'Semoventes (Animais)', taxaAnual: 10, vidaUtil: 10 }
];

// ==================== FUNÇÕES DE CÁLCULO ====================

function calcularDepreciacaoLinear(custoAquisicao, valorResidual, vidaUtilAnos) {
  const valorDepreciavel = custoAquisicao - valorResidual;
  const depreciacaoAnual = valorDepreciavel / vidaUtilAnos;
  const depreciacaoMensal = depreciacaoAnual / 12;
  const taxaAnual = (valorDepreciavel > 0 ? (depreciacaoAnual / custoAquisicao) * 100 : 0);

  return {
    custoAquisicao,
    valorResidual,
    valorDepreciavel: Math.round(valorDepreciavel * 100) / 100,
    depreciacaoAnual: Math.round(depreciacaoAnual * 100) / 100,
    depreciacaoMensal: Math.round(depreciacaoMensal * 100) / 100,
    taxaAnual: Math.round(taxaAnual * 100) / 100,
    vidaUtilAnos
  };
}

function calcularTabelaDepreciacao(custoAquisicao, valorResidual, vidaUtilAnos) {
  const valorDepreciavel = custoAquisicao - valorResidual;
  const depreciacaoAnual = valorDepreciavel / vidaUtilAnos;
  const tabela = [];

  let acumulada = 0;
  let valorLiquido = custoAquisicao;

  for (let ano = 1; ano <= vidaUtilAnos; ano++) {
    acumulada += depreciacaoAnual;
    valorLiquido -= depreciacaoAnual;

    tabela.push({
      ano,
      depreciacaoAnual: Math.round(depreciacaoAnual * 100) / 100,
      acumulada: Math.round(acumulada * 100) / 100,
      valorLiquido: Math.round(Math.max(valorResidual, valorLiquido) * 100) / 100
    });
  }

  return tabela;
}

function calcularDepreciacaoAcelerada(custoAquisicao, valorResidual, vidaUtilAnos, fatorAceleracao) {
  const novaVidaUtil = vidaUtilAnos / fatorAceleracao;
  return calcularDepreciacaoLinear(custoAquisicao, valorResidual, novaVidaUtil);
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function CalculadoraDepreciacaoCompleta() {
  const [expandedSections, setExpandedSections] = useState({
    dadosAtivo: true,
    tipoAtivo: true,
    acelerada: false,
    comparativo: false
  });

  const [formData, setFormData] = useState({
    custoAquisicao: '',
    valorResidual: '',
    tipoAtivo: 'veiculos',
    vidaUtilCustom: false,
    vidaUtilAnos: 5,
    taxaAnualCustom: false,
    taxaAnual: 20,
    acelerada: false,
    fatorAceleracao: 2,
    dataAquisicao: '',
    mostrarTabela: true
  });

  const [resultado, setResultado] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Auto-set vida útil/taxa quando muda tipo de ativo
      if (field === 'tipoAtivo' && !prev.vidaUtilCustom && !prev.taxaAnualCustom) {
        const ativo = TABELA_DEPRECIACAO.find(a => a.categoria.toLowerCase().includes(value));
        if (ativo) {
          newData.vidaUtilAnos = ativo.vidaUtil;
          newData.taxaAnual = ativo.taxaAnual;
        }
      }

      return newData;
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const calcular = () => {
    if (!formData.custoAquisicao) {
      toast.error('Informe o custo de aquisição do bem.');
      return;
    }

    const custo = parseFloat(formData.custoAquisicao);
    const residual = parseFloat(formData.valorResidual) || 0;
    const vidaUtil = formData.vidaUtilCustom ? parseInt(formData.vidaUtilAnos) : TABELA_DEPRECIACAO.find(a => a.categoria.toLowerCase().includes(formData.tipoAtivo))?.vidaUtil || 5;

    // Depreciação Linear
    const linear = calcularDepreciacaoLinear(custo, residual, vidaUtil);

    // Tabela de depreciação
    const tabela = formData.mostrarTabela ? calcularTabelaDepreciacao(custo, residual, vidaUtil) : [];

    // Depreciação Acelerada
    let acelerada = null;
    if (formData.acelerada) {
      acelerada = calcularDepreciacaoAcelerada(custo, residual, vidaUtil, formData.fatorAceleracao);
    }

    setResultado({
      linear,
      tabela,
      acelerada,
      resumo: {
        custoAquisicao: custo,
        valorResidual: residual,
        totalDepreciar: linear.valorDepreciavel,
        taxaAnual: linear.taxaAnual,
        vidaUtilAnos: vidaUtil
      }
    });

    toast.success('Depreciação calculada com sucesso!');
  };

  const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-cyan-100 text-cyan-600 p-3 rounded-2xl">
            <TrendingDown size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Calculadora de Depreciação Contábil 2026</h1>
            <p className="text-slate-500">Cálculo linear e acelerado, tabela completa de depreciação conforme IN RFB 1.700/2017 e CPC 27.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dados do Ativo */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('dadosAtivo')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">💰 Dados do Ativo</h2>
              {expandedSections.dadosAtivo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.dadosAtivo && (
              <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Custo de Aquisição (R$)</label>
                  <input type="number" value={formData.custoAquisicao} onChange={(e) => handleChange('custoAquisicao', e.target.value)}
                    placeholder="Ex: 120.000,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Valor Residual Estimado (R$)</label>
                  <input type="number" value={formData.valorResidual} onChange={(e) => handleChange('valorResidual', e.target.value)}
                    placeholder="Ex: 20.000,00" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                  <p className="text-xs text-slate-500 mt-1">Valor estimado de venda ao final da vida útil</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Data de Aquisição</label>
                  <input type="date" value={formData.dataAquisicao} onChange={(e) => handleChange('dataAquisicao', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                </div>
              </div>
            )}
          </div>

          {/* Tipo de Ativo */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('tipoAtivo')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">📋 Tipo de Ativo</h2>
              {expandedSections.tipoAtivo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.tipoAtivo && (
              <div className="p-5 pt-0 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {TABELA_DEPRECIACAO.map(ativo => (
                    <label key={ativo.categoria}
                      className={`flex flex-col p-3 rounded-xl cursor-pointer transition-all border-2 text-center ${
                        formData.tipoAtivo === ativo.categoria.toLowerCase().split(' ')[0]
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}>
                      <input type="radio" name="tipoAtivo"
                        checked={formData.tipoAtivo === ativo.categoria.toLowerCase().split(' ')[0]}
                        onChange={() => handleChange('tipoAtivo', ativo.categoria.toLowerCase().split(' ')[0])}
                        className="mb-1 w-4 h-4" />
                      <p className="text-xs font-bold text-slate-800">{ativo.categoria.split('(')[0].trim()}</p>
                      <p className="text-xs text-cyan-600 font-bold">{ativo.taxaAnual}%/a | {ativo.vidaUtil}a</p>
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                    <input type="checkbox" checked={formData.vidaUtilCustom}
                      onChange={(e) => handleChange('vidaUtilCustom', e.target.checked)} />
                    <span className="text-sm font-bold text-slate-700">Vida Útil Customizada</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                    <input type="checkbox" checked={formData.taxaAnualCustom}
                      onChange={(e) => handleChange('taxaAnualCustom', e.target.checked)} />
                    <span className="text-sm font-bold text-slate-700">Taxa Anual Customizada</span>
                  </label>
                </div>

                {(formData.vidaUtilCustom || formData.taxaAnualCustom) && (
                  <div className="grid grid-cols-2 gap-4">
                    {formData.vidaUtilCustom && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Vida Útil (anos)</label>
                        <input type="number" value={formData.vidaUtilAnos} onChange={(e) => handleChange('vidaUtilAnos', parseInt(e.target.value))}
                          min="1" max="50" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                      </div>
                    )}
                    {formData.taxaAnualCustom && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Taxa Anual (%)</label>
                        <input type="number" value={formData.taxaAnual} onChange={(e) => handleChange('taxaAnual', parseFloat(e.target.value))}
                          min="0" max="100" step="0.01" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Depreciação Acelerada */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => toggleSection('acelerada')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-bold text-slate-800">⚡ Depreciação Acelerada</h2>
              {expandedSections.acelerada ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.acelerada && (
              <div className="p-5 pt-0 space-y-4">
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={formData.acelerada}
                    onChange={(e) => handleChange('acelerada', e.target.checked)} />
                  <div>
                    <span className="text-sm font-bold text-slate-700">Calcular Depreciação Acelerada</span>
                    <p className="text-xs text-slate-500">Apenas com incentivo fiscal ou autorização RFB</p>
                  </div>
                </label>
                {formData.acelerada && (
                  <div className="ml-6">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Fator de Aceleração</label>
                    <select value={formData.fatorAceleracao} onChange={(e) => handleChange('fatorAceleracao', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                      <option value={2}>2x (dobro da velocidade)</option>
                      <option value={3}>3x (triplo da velocidade)</option>
                      <option value={4}>4x (quádruplo da velocidade)</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botão */}
          <button onClick={calcular}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-cyan-500/20">
            <Calculator size={18} className="inline mr-2" /> Calcular Depreciação
          </button>
        </div>

        {/* Resultado */}
        <div className="lg:col-span-1">
          {resultado ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sticky top-4 space-y-4">
              <h2 className="text-lg font-bold text-slate-800">Resultado</h2>

              {/* Resumo */}
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 font-bold mb-2">📊 Resumo do Ativo</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Custo Aquisição</span><span className="font-bold">{formatarMoeda(resultado.resumo.custoAquisicao)}</span></div>
                  <div className="flex justify-between"><span>Valor Residual</span><span className="font-bold">{formatarMoeda(resultado.resumo.valorResidual)}</span></div>
                  <div className="flex justify-between"><span>Total a Depreciar</span><span className="font-bold">{formatarMoeda(resultado.resumo.totalDepreciar)}</span></div>
                  <div className="flex justify-between"><span>Taxa Anual</span><span className="font-bold">{resultado.resumo.taxaAnual}%</span></div>
                  <div className="flex justify-between"><span>Vida Útil</span><span className="font-bold">{resultado.resumo.vidaUtilAnos} anos</span></div>
                </div>
              </div>

              {/* Linear */}
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 font-bold mb-2">📉 Depreciação Linear</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Anual</span><span className="font-bold">{formatarMoeda(resultado.linear.depreciacaoAnual)}</span></div>
                  <div className="flex justify-between"><span>Mensal</span><span className="font-bold">{formatarMoeda(resultado.linear.depreciacaoMensal)}</span></div>
                </div>
              </div>

              {/* Acelerada */}
              {resultado.acelerada && (
                <div className="p-3 bg-amber-50 rounded-xl">
                  <p className="text-xs text-amber-600 font-bold mb-2">⚡ Depreciação Acelerada ({formData.fatorAceleracao}x)</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Nova Vida Útil</span><span className="font-bold">{(resultado.resumo.vidaUtilAnos / formData.fatorAceleracao).toFixed(1)} anos</span></div>
                    <div className="flex justify-between"><span>Anual</span><span className="font-bold">{formatarMoeda(resultado.acelerada.depreciacaoAnual)}</span></div>
                    <div className="flex justify-between"><span>Mensal</span><span className="font-bold">{formatarMoeda(resultado.acelerada.depreciacaoMensal)}</span></div>
                  </div>
                </div>
              )}

              {/* Lançamento Contábil */}
              <div className="p-3 bg-green-50 rounded-xl">
                <p className="text-xs text-green-600 font-bold mb-2">📒 Lançamento Contábil Mensal</p>
                <div className="text-xs font-mono space-y-1 bg-white p-2 rounded">
                  <p>D - Despesa c/ Depreciação</p>
                  <p className="pl-4">{formatarMoeda(resultado.linear.depreciacaoMensal)}</p>
                  <p>C - Depreciação Acumulada</p>
                  <p className="pl-4">{formatarMoeda(resultado.linear.depreciacaoMensal)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center sticky top-4">
              <TrendingDown size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Preencha os dados</h3>
              <p className="text-sm text-slate-500">Configure o ativo e clique em calcular.</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabela Completa de Depreciação */}
      {resultado && resultado.tabela.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Tabela Completa de Depreciação
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-slate-600">Ano</th>
                  <th className="text-right px-4 py-3 font-bold text-slate-600">Depreciação Anual</th>
                  <th className="text-right px-4 py-3 font-bold text-slate-600">Depreciação Acumulada</th>
                  <th className="text-right px-4 py-3 font-bold text-slate-600">Valor Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resultado.tabela.map(linha => (
                  <tr key={linha.ano} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">{linha.ano}º ano</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">{formatarMoeda(linha.depreciacaoAnual)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatarMoeda(linha.acumulada)}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">{formatarMoeda(linha.valorLiquido)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Banner */}
      <div className="mt-6 bg-cyan-50 border border-cyan-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={20} className="text-cyan-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-cyan-800">Base Legal Atualizada 2026</p>
          <p className="text-xs text-cyan-700 mt-1">
            Lei 6.404/76 Art. 183 (depreciação contábil), CPC 27 / NBC TG 27 (Ativo Imobilizado),
            IN RFB 1.700/2017 (tabela de vida útil e taxas), Dec. 3.000/99 Art. 308-310 (depreciação fiscal).
            Acelerada: apenas com incentivo fiscal ou autorização RFB. Diferença contábil/fiscal → controle no LALUR.
          </p>
        </div>
      </div>
    </div>
  );
}
