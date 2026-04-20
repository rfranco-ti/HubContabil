import { useState } from 'react';
import { Clock, Info, Calculator as CalcIcon } from 'lucide-react';
import { toast } from 'sonner';

const ADICIONAL_HE = { diurna: 50, noturna: 50, domingos: 100 };
const ADICIONAL_NOTURNO_URBANO = 20;

export default function CalculadoraHorasExtras() {
  const [formData, setFormData] = useState({
    salario: '',
    jornadaSemanal: 44,
    horasExtrasDiurnas: 0,
    horasExtrasNoturnas: 0,
    horasExtrasDomingos: 0,
    adicionalNoturno: false,
    divisorHoras: 220
  });

  const [resultado, setResultado] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calcular = () => {
    if (!formData.salario) {
      toast.error('Informe o salário base.');
      return;
    }

    const salario = parseFloat(formData.salario);
    const divisor = formData.divisorHoras;
    const horaNormal = salario / divisor;

    // Hora extra diurna (+50%)
    const valorHEDiurna = horaNormal * (1 + ADICIONAL_HE.diurna / 100);
    const totalHEDiurna = valorHEDiurna * formData.horasExtrasDiurnas;

    // Hora extra noturna (+50% + 20% = +70%)
    const fatorNoturno = formData.adicionalNoturno ? (1 + ADICIONAL_NOTURNO_URBANO / 100) : 1;
    const valorHENoturna = horaNormal * fatorNoturno * (1 + ADICIONAL_HE.noturna / 100);
    const totalHENoturna = valorHENoturna * formData.horasExtrasNoturnas;

    // Hora extra domingos/feriados (+100%)
    const valorHEDomingo = horaNormal * (1 + ADICIONAL_HE.domingos / 100);
    const totalHEDomingo = valorHEDomingo * formData.horasExtrasDomingos;

    const totalHE = totalHEDiurna + totalHENoturna + totalHEDomingo;

    setResultado({
      horaNormal,
      valorHEDiurna,
      totalHEDiurna,
      valorHENoturna,
      totalHENoturna,
      valorHEDomingo,
      totalHEDomingo,
      totalHE,
      totalGeral: salario + totalHE
    });

    toast.success('Horas extras calculadas!');
  };

  const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <span className="bg-blue-100 text-blue-600 p-3 rounded-2xl"><Clock size={24} /></span>
          Calculadora de Horas Extras 2026
        </h1>
        <p className="text-slate-500 mt-1">Calcule horas extras diurnas, noturnas, domingos e feriados com adicionais corretos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Dados Salariais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Salário Base (R$)</label>
                <input type="number" value={formData.salario} onChange={(e) => handleChange('salario', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Jornada Semanal (h)</label>
                <select value={formData.jornadaSemanal} onChange={(e) => handleChange('jornadaSemanal', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value={44}>44h (220h/mês)</option>
                  <option value={40}>40h (200h/mês)</option>
                  <option value={36}>36h (180h/mês)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Horas Extras no Mês</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">HE Diurnas (+50%)</label>
                <input type="number" value={formData.horasExtrasDiurnas} onChange={(e) => handleChange('horasExtrasDiurnas', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">HE Noturnas (+70%)</label>
                <input type="number" value={formData.horasExtrasNoturnas} onChange={(e) => handleChange('horasExtrasNoturnas', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">HE Domingos/Feriados (+100%)</label>
                <input type="number" value={formData.horasExtrasDomingos} onChange={(e) => handleChange('horasExtrasDomingos', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
              </div>
            </div>
            <label className="flex items-center gap-2 mt-4">
              <input type="checkbox" checked={formData.adicionalNoturno} onChange={(e) => handleChange('adicionalNoturno', e.target.checked)} />
              <span className="text-sm font-bold text-slate-700">Aplicar adicional noturno (+20%)</span>
            </label>
          </div>

          <button onClick={calcular}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all">
            <CalcIcon size={18} className="inline mr-2" /> Calcular Horas Extras
          </button>
        </div>

        <div>
          {resultado ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-4">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Resultado</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span>Hora Normal</span><span className="font-bold">{formatarMoeda(resultado.horaNormal)}</span></div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-bold">HE Diurnas (+50%)</p>
                  <div className="flex justify-between text-sm"><span>Valor/hora</span><span className="font-bold">{formatarMoeda(resultado.valorHEDiurna)}</span></div>
                  <div className="flex justify-between text-sm"><span>Total ({formData.horasExtrasDiurnas}h)</span><span className="font-bold">{formatarMoeda(resultado.totalHEDiurna)}</span></div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600 font-bold">HE Noturnas (+70%)</p>
                  <div className="flex justify-between text-sm"><span>Valor/hora</span><span className="font-bold">{formatarMoeda(resultado.valorHENoturna)}</span></div>
                  <div className="flex justify-between text-sm"><span>Total ({formData.horasExtrasNoturnas}h)</span><span className="font-bold">{formatarMoeda(resultado.totalHENoturna)}</span></div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600 font-bold">HE Domingos/Feriados (+100%)</p>
                  <div className="flex justify-between text-sm"><span>Valor/hora</span><span className="font-bold">{formatarMoeda(resultado.valorHEDomingo)}</span></div>
                  <div className="flex justify-between text-sm"><span>Total ({formData.horasExtrasDomingos}h)</span><span className="font-bold">{formatarMoeda(resultado.totalHEDomingo)}</span></div>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm font-bold"><span>Total Horas Extras</span><span className="text-green-600">{formatarMoeda(resultado.totalHE)}</span></div>
                  <div className="flex justify-between text-sm font-bold mt-2"><span>Salário + HE</span><span className="text-green-600">{formatarMoeda(resultado.totalGeral)}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center sticky top-4">
              <Clock size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">Preencha os dados e clique em calcular.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
