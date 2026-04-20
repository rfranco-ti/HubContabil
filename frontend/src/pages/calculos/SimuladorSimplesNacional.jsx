import { Building2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function SimuladorSimplesNacional() {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <span className="bg-green-100 text-green-600 p-3 rounded-2xl"><Building2 size={24} /></span>
          Simulador Simples Nacional 2026
        </h1>
        <p className="text-slate-500 mt-1">Calcule o DAS com todos os 5 anexos, fator R e alíquotas efetivas.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-3">
        <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-800">Em desenvolvimento</p>
          <p className="text-sm text-amber-700 mt-1">
            Este simulador está sendo implementado. A documentação completa está disponível em 
            <code className="bg-amber-100 px-2 py-0.5 rounded mx-1">docs/calculos/fiscal/SIMPLES_NACIONAL.md</code>.
            Inclui tabelas dos 5 anexos, fator R, fórmulas de alíquota efetiva e exemplos práticos.
          </p>
        </div>
      </div>
    </div>
  );
}
