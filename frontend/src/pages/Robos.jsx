import { Link } from 'react-router-dom';
import { Bot, ArrowRight, FileText, Building2, Cpu } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import '../styles/pages/Robos.css';

export default function Robos() {
  const robos = [
    {
      id: 'simples-nacional',
      nome: 'Consulta Optantes - Simples Nacional',
      descricao: 'Portal da Receita Federal do Brasil.',
      detalhe: 'Automatiza a consulta de optantes no portal da Receita Federal.',
      icone: <FileText size={28} />,
      path: '/robos/simples-nacional'
    },
    {
      id: 'sefaz-ba',
      nome: 'Consulta Cadastral - SEFAZ Bahia',
      descricao: 'Cadastro de Contribuintes do ICMS.',
      detalhe: 'Automatiza a consulta cadastral no site da SEFAZ Bahia.',
      icone: <Building2 size={28} />,
      path: '/robos/sefaz-ba'
    }
  ];

  return (
    <div className="robos-container">
      <PageHeader
        icon={<Cpu size={24} />}
        title="Cérebro de Automações (RPA)"
        subtitle="Acione robôs invisíveis para extrair dados de sites do governo"
      />

      <div className="robos-grid">
        {robos.map((robo) => (
          <Link
            key={robo.id}
            to={robo.path}
            className="robos-card"
          >
            <div className="robos-card__header">
              <div className="robos-card__icon">
                {robo.icone}
              </div>
              <div className="flex-1">
                <h2 className="robos-card__title">
                  {robo.nome}
                </h2>
                <p className="robos-card__subtitle">{robo.descricao}</p>
              </div>
            </div>
            <p className="robos-card__description">{robo.detalhe}</p>
            <div className="robos-card__link">
              Acessar Robô
              <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
