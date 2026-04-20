import { useState } from 'react';
import { Filter, MapPin, Check, ChevronDown, Globe, Building2, Home, Calendar } from 'lucide-react';
import '../../styles/calendario/FiltrosFeriados.css';

// Municípios da RMS (Região Metropolitana de Salvador)
const MUNICIPIOS_RMS = [
  'Salvador', 'Lauro de Freitas', 'Camaçari', 'Simões Filho',
  'Candeias', 'Dias d\'Ávila', 'Itaparica', 'Vera Cruz',
  'São Francisco do Conde', 'Madre de Deus', 'Jaguaripe',
  'Santo Amaro', 'Saubara', 'Aratuípe', 'Varzedo'
];

// Lista de municípios disponíveis
const MUNICIPIOS_DISPONIVEIS = [
  'Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari',
  'Itabuna', 'Juazeiro', 'Lauro de Freitas', 'Ilhéus',
  'Jequié', 'Teixeira de Freitas', 'Alagoinhas', 'Barreiras',
  'Porto Seguro', 'Simões Filho', 'Santo Antônio de Jesus', 'Valença'
];

export default function FiltrosFeriados({ onFiltrosChange }) {
  const [filtros, setFiltros] = useState({
    nacional: true,
    estadual: true,
    municipal: true,
    estadoSelecionado: 'BA',
    municipiosSelecionados: ['Salvador'],
    apenasRMS: false,
    eventosUsuario: true
  });

  const [showMunicipios, setShowMunicipios] = useState(false);

  const handleToggleTipo = (tipo) => {
    const novosFiltros = { ...filtros, [tipo]: !filtros[tipo] };
    setFiltros(novosFiltros);
    onFiltrosChange?.(novosFiltros);
  };

  const handleToggleMunicipio = (municipio) => {
    const municipiosSelecionados = filtros.municipiosSelecionados.includes(municipio)
      ? filtros.municipiosSelecionados.filter(m => m !== municipio)
      : [...filtros.municipiosSelecionados, municipio];

    const novosFiltros = { ...filtros, municipiosSelecionados };
    setFiltros(novosFiltros);
    onFiltrosChange?.(novosFiltros);
  };

  const handleToggleRMS = () => {
    const novosFiltros = { 
      ...filtros, 
      apenasRMS: !filtros.apenasRMS,
      municipiosSelecionados: !filtros.apenasRMS ? MUNICIPIOS_RMS : []
    };
    setFiltros(novosFiltros);
    onFiltrosChange?.(novosFiltros);
  };

  const handleToggleEventos = () => {
    const novosFiltros = { ...filtros, eventosUsuario: !filtros.eventosUsuario };
    setFiltros(novosFiltros);
    onFiltrosChange?.(novosFiltros);
  };

  return (
    <div className="calendario-filtros-container">
      {/* Header */}
      <div className="calendario-filtros-header">
        <Filter size={16} />
        <span className="calendario-filtros-title">Filtros</span>
      </div>

      {/* Filtros em linha horizontal */}
      <div className="calendario-filtros-row">
        {/* Feriado Nacional */}
        <label className="calendario-filtro-horizontal">
          <input
            type="checkbox"
            checked={filtros.nacional}
            onChange={() => handleToggleTipo('nacional')}
            className="calendario-checkbox"
          />
          <span className="calendario-checkbox-label nacional">
            <Globe size={14} />
            <span className="calendario-label-text">Nacional</span>
          </span>
        </label>

        {/* Feriado Estadual */}
        <label className="calendario-filtro-horizontal">
          <input
            type="checkbox"
            checked={filtros.estadual}
            onChange={() => handleToggleTipo('estadual')}
            className="calendario-checkbox"
          />
          <span className="calendario-checkbox-label estadual">
            <Building2 size={14} />
            <span className="calendario-label-text">Estadual</span>
          </span>
        </label>

        {/* Feriado Municipal */}
        <label className="calendario-filtro-horizontal">
          <input
            type="checkbox"
            checked={filtros.municipal}
            onChange={() => handleToggleTipo('municipal')}
            className="calendario-checkbox"
          />
          <span className="calendario-checkbox-label municipal">
            <Home size={14} />
            <span className="calendario-label-text">Municipal</span>
          </span>
        </label>

        {/* Eventos do Usuário */}
        <label className="calendario-filtro-horizontal">
          <input
            type="checkbox"
            checked={filtros.eventosUsuario}
            onChange={handleToggleEventos}
            className="calendario-checkbox"
          />
          <span className="calendario-checkbox-label eventos">
            <Calendar size={14} />
            <span className="calendario-label-text">Eventos</span>
          </span>
        </label>

        {/* Dropdown de Municípios */}
        <div className="calendario-municipios-dropdown">
          <button
            onClick={() => setShowMunicipios(!showMunicipios)}
            className="calendario-button-dropdown"
          >
            <MapPin size={14} />
            <span>Municípios</span>
            <ChevronDown 
              size={14} 
              className="calendario-chevron"
              style={{ 
                transform: showMunicipios ? 'rotate(180deg)' : 'rotate(0deg)'
              }} 
            />
          </button>

          {showMunicipios && (
            <div className="calendario-municipios-list-dropdown">
              {MUNICIPIOS_DISPONIVEIS.map((municipio) => (
                <label key={municipio} className="calendario-municipio-item">
                  <input
                    type="checkbox"
                    checked={filtros.municipiosSelecionados.includes(municipio)}
                    onChange={() => handleToggleMunicipio(municipio)}
                    className="calendario-checkbox"
                  />
                  <span>{municipio}</span>
                  {filtros.municipiosSelecionados.includes(municipio) && (
                    <Check size={14} className="calendario-check-icon" />
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Botão RMS */}
        <button
          onClick={handleToggleRMS}
          className={`calendario-button-rms ${filtros.apenasRMS ? 'active' : ''}`}
        >
          <MapPin size={14} />
          <span>{filtros.apenasRMS ? 'RMS' : 'Exibir RMS'}</span>
        </button>
      </div>
    </div>
  );
}
