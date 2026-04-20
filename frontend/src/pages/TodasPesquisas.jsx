import { Link } from 'react-router-dom';
import { Search, Building2, FileText, ArrowRight, Compass } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import '../styles/pages/TodasPesquisas.css';

export default function TodasPesquisas() {
  const pesquisas = [
    {
      id: 'empresas',
      nome: 'Pesquisa de Empresas',
      descricao: 'Busque empresas por CNPJ, razão social ou nome fantasia',
      detalhe: 'Consulta completa de dados cadastrais de empresas.',
      icone: <Building2 size={28} />,
      path: '/pesquisa/empresas'
    },
    {
      id: 'mei',
      nome: 'Pesquisa de Atividades MEI',
      descricao: 'Consulte atividades permitidas para MEI',
      detalhe: 'Verifique se sua atividade pode ser MEI e consulte os CNAEs.',
      icone: <FileText size={28} />,
      path: '/pesquisa/mei'
    }
  ];

  return (
    <div className="todas-pesquisas-container">
      <PageHeader
        icon={<Compass size={24} />}
        title="Central de Pesquisas"
        subtitle="Todas as opções de consulta em um só lugar"
      />

      <div className="pesquisas-grid">
        {pesquisas.map((pesquisa) => (
          <Link
            key={pesquisa.id}
            to={pesquisa.path}
            className="pesquisa-card"
          >
            <div className="pesquisa-card__header">
              <div className="pesquisa-card__icon">
                {pesquisa.icone}
              </div>
              <div className="pesquisa-card__content">
                <h2 className="pesquisa-card__title">
                  {pesquisa.nome}
                </h2>
                <p className="pesquisa-card__subtitle">{pesquisa.descricao}</p>
              </div>
            </div>
            <p className="pesquisa-card__description">{pesquisa.detalhe}</p>
            <div className="pesquisa-card__link">
              Acessar Pesquisa
              <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
