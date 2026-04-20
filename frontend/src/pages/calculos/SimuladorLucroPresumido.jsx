import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function SimuladorLucroPresumido() {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <span className="bg-blue-100 text-blue-600 p-3 rounded-2xl"><TrendingUp size={24} /></span>
          Simulador Lucro Presumido 2026
        </h1>
        <p className="text-slate-500 mt-1">Calcule IRPJ, CSLL, PIS, COFINS com percentuais de presunção e majoração 2026.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-3">
        <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-800">Em desenvolvimento</p>
          <p className="text-sm text-amber-700 mt-1">
            Documentação completa disponível em <code className="bg-amber-100 px-2 py-0.5 rounded mx-1">docs/calculos/fiscal/LUCRO_PRESUMIDO.md</code>.
            Inclui tabelas de presunção, majoração 10% LC 224/2025, fórmulas e 3 exemplos práticos.
          </p>
        </div>
      </div>
    </div>
  );
}
