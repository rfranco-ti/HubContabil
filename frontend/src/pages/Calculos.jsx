import { Link } from 'react-router-dom';
import {
  Calculator,
  DollarSign,
  Clock,
  Calendar,
  Briefcase,
  TrendingUp,
  Percent,
  FileText,
  ChevronRight,
  Building2,
  Wallet,
  AlertTriangle,
  User,
  UserCheck,
  Truck,
  TrendingDown
} from 'lucide-react';

const CATEGORIAS = [
  {
    id: 'trabalhista',
    nome: 'Cálculos Trabalhistas',
    icon: Briefcase,
    cor: 'from-blue-500 to-blue-600',
    calculadores: [
      {
        id: 'rescisao',
        nome: 'Simulador de Rescisão',
        descricao: 'Calcule todas as verbas rescisórias: saldo de salário, férias, 13º, aviso prévio, multa FGTS',
        icon: FileText,
        path: '/calculos/rescisao',
        tags: ['TRCT', 'CLT', 'FGTS']
      },
      {
        id: 'horas-extras',
        nome: 'Horas Extras',
        descricao: 'Calcule horas extras diurnas, noturnas, domingos e feriados com adicionais corretos',
        icon: Clock,
        path: '/calculos/horas-extras',
        tags: ['50%', '100%', 'Noturna']
      },
      {
        id: 'salario-liquido',
        nome: 'Salário Líquido',
        descricao: 'Calcule o salário líquido com descontos de INSS progressivo e IRRF 2026',
        icon: Wallet,
        path: '/calculos/salario-liquido',
        tags: ['INSS', 'IRRF', 'Descontos']
      },
      {
        id: 'ferias',
        nome: 'Férias + 1/3',
        descricao: 'Calcule férias simples, proporcionais e vencidas com terço constitucional',
        icon: Calendar,
        path: '/calculos/ferias',
        tags: ['Férias', '1/3', 'Proporcional']
      },
      {
        id: 'decimo-terceiro',
        nome: '13º Salário',
        descricao: 'Calcule o 13º salário proporcional e integral com precisão',
        icon: DollarSign,
        path: '/calculos/decimo-terceiro',
        tags: ['13º', 'Proporcional', 'CLT']
      },
      {
        id: 'insalubridade-periculosidade',
        nome: 'Insalubridade/Periculosidade',
        descricao: 'Compare adicionais, calcule reflexos em FGTS, férias, 13º e horas extras',
        icon: AlertTriangle,
        path: '/calculos/insalubridade-periculosidade',
        tags: ['NR-15', 'NR-16', 'Reflexos']
      },
      {
        id: 'iss-retencao',
        nome: 'ISS Retenção',
        descricao: 'Calcule ISS com retenção na fonte, dedução de materiais e impostos retidos (CSLL, PIS, COFINS)',
        icon: Building2,
        path: '/calculos/iss-retencao',
        tags: ['LC 116', 'Retenção', 'Materiais']
      },
      {
        id: 'icms-bahia',
        nome: 'ICMS Bahia',
        descricao: 'Calcule ICMS interno, DIFAL, Substituição Tributária, créditos e regras específicas da Bahia',
        icon: Truck,
        path: '/calculos/icms-bahia',
        tags: ['BA', 'DIFAL', 'ST', 'CFOP']
      },
      {
        id: 'irpf',
        nome: 'IRPF 2026',
        descricao: 'Calcule IRPF mensal/anual, carnê-leão, desconto simplificado, deduções e dependentes',
        icon: User,
        path: '/calculos/irpf',
        tags: ['IRPF', 'Simplificado', 'Deduções']
      },
      {
        id: 'aposentadoria',
        nome: 'Aposentadoria 2026',
        descricao: 'Simule aposentadoria com regras de transição, pontos, RMI, fator previdenciário e elegibilidade',
        icon: UserCheck,
        path: '/calculos/aposentadoria',
        tags: ['INSS', 'EC 103', 'RMI']
      },
      {
        id: 'depreciacao',
        nome: 'Depreciação Contábil',
        descricao: 'Calcule depreciação linear e acelerada com tabela completa conforme IN RFB 1.700/2017 e CPC 27',
        icon: TrendingDown,
        path: '/calculos/depreciacao',
        tags: ['CPC 27', 'Vida Útil', 'LALUR']
      },
      {
        id: 'lucro-real',
        nome: 'Lucro Real',
        descricao: 'Simule IRPJ/CSLL no Lucro Real com adições, exclusões LALUR e compensação de prejuízos fiscais',
        icon: FileText,
        path: '/calculos/lucro-real',
        tags: ['LALUR', 'IRPJ', 'CSLL']
      },
      {
        id: 'pis-cofins',
        nome: 'PIS/COFINS Não-Cumulativo',
        descricao: 'Calcule PIS/COFINS com créditos permitidos, exclusão do ICMS e alíquotas 1,65%/7,6%',
        icon: Percent,
        path: '/calculos/pis-cofins',
        tags: ['9,25%', 'Créditos', 'ICMS']
      }
    ]
  },
  {
    id: 'tributario',
    nome: 'Cálculos Tributários',
    icon: Percent,
    cor: 'from-green-500 to-green-600',
    calculadores: [
      {
        id: 'simples-nacional',
        nome: 'Simples Nacional',
        descricao: 'Simule o DAS com todos os 5 anexos, fator R e alíquotas efetivas 2026',
        icon: Building2,
        path: '/calculos/simples-nacional',
        tags: ['DAS', 'Anexos I-V', 'Fator R']
      },
      {
        id: 'lucro-presumido',
        nome: 'Lucro Presumido',
        descricao: 'Calcule IRPJ, CSLL, PIS, COFINS com percentuais de presunção e majoração 2026',
        icon: TrendingUp,
        path: '/calculos/lucro-presumido',
        tags: ['IRPJ', 'CSLL', 'PIS/COFINS']
      }
    ]
  }
];

export default function Calculos() {
  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
            <Calculator size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Central de Cálculos</h1>
            <p className="text-slate-500 text-lg">Simuladores e calculadoras trabalhistas e tributárias atualizadas para 2026.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Calculadoras</p>
              <p className="text-3xl font-black">17</p>
            </div>
            <Calculator size={32} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Categorias</p>
              <p className="text-3xl font-black">2</p>
            </div>
            <Percent size={32} className="text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Base Legal</p>
              <p className="text-3xl font-black">50+</p>
            </div>
            <FileText size={32} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* Categorias e Calculadoras */}
      {CATEGORIAS.map((categoria) => {
        const CategoriaIcon = categoria.icon;
        return (
          <div key={categoria.id} className="mb-8">
            {/* Header da Categoria */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`bg-gradient-to-r ${categoria.cor} text-white p-2 rounded-xl`}>
                <CategoriaIcon size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">{categoria.nome}</h2>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                {categoria.calculadores.length} calculadoras
              </span>
            </div>

            {/* Grid de Calculadoras */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoria.calculadores.map((calc) => {
                const CalcIcon = calc.icon;
                return (
                  <Link
                    key={calc.id}
                    to={calc.path}
                    className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <CalcIcon size={22} />
                      </div>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-colors mt-3" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {calc.nome}
                    </h3>

                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                      {calc.descricao}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {calc.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Banner Informativo */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg flex-shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Base Legal Atualizada 2026</h3>
            <p className="text-sm text-slate-600">
              Todos os cálculos utilizam tabelas e legislação vigentes em 2026, incluindo:
              INSS progressivo, IRRF com desconto simplificado, Lei 12.506/2011 (aviso prévio),
              LC 123/2006 (Simples Nacional), LC 224/2025 (Lucro Presumido) e Portaria MPS/MF nº 13/2026.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
