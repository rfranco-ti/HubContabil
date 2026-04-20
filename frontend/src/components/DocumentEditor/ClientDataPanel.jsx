import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { User, Building2, Mail, Phone, MapPin, DollarSign, Calendar, Hash, Plus } from 'lucide-react';
import { clientesAPI } from '../../services/api';

export default function ClientDataPanel({ selectedClient, onClientSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = useCallback(async () => {
    try {
      const response = await clientesAPI.getAll();
      const filtered = response.data.filter((client) =>
        client.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.cnpj?.includes(searchTerm)
      );
      setClients(filtered);
      setShowSearch(true);
    } catch (error) {
      console.error('❌ Erro ao buscar clientes:', error);
    }
  }, [searchTerm]);

  const handleInsertField = useCallback((fieldKey, fieldLabel) => {
    toast.success(`"${fieldLabel}" adicionado. Use o bloco "Campo Dinâmico" no sidebar e edite o campo para: ${fieldKey}`);
    console.log(`📝 Campo sugerido: ${fieldKey}`);
  }, []);

  const clientFields = selectedClient
    ? [
        { key: 'cliente_nome', label: 'Nome', icon: User, value: selectedClient.razao_social },
        { key: 'cliente_cnpj', label: 'CNPJ', icon: Hash, value: selectedClient.cnpj },
        { key: 'cliente_endereco', label: 'Endereço', icon: MapPin, value: formatAddress(selectedClient) },
        { key: 'cliente_email', label: 'Email', icon: Mail, value: selectedClient.contato_email },
        { key: 'cliente_telefone', label: 'Telefone', icon: Phone, value: selectedClient.contato_telefone },
        { key: 'valor', label: 'Valor', icon: DollarSign, value: '' },
        { key: 'data', label: 'Data', icon: Calendar, value: new Date().toLocaleDateString('pt-BR') },
        { key: 'descricao', label: 'Descrição', icon: Building2, value: '' },
      ]
    : [];

  return (
    <div className="p-3 border-t border-slate-200">
      <h3 className="font-bold text-slate-800 text-xs mb-2">Dados do Cliente</h3>

      {!selectedClient ? (
        <div className="space-y-2">
          <div className="flex gap-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-2 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 text-xs"
            >
              🔍
            </button>
          </div>

          {showSearch && (
            <div className="max-h-32 overflow-auto border border-slate-200 rounded">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => {
                    onClientSelect(client.id);
                    setShowSearch(false);
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                >
                  <p className="font-semibold text-xs text-slate-700 truncate">{client.razao_social}</p>
                  <p className="text-xs text-slate-500">{client.cnpj}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <User size={12} className="text-primary-600" />
              <span className="font-semibold text-xs text-slate-700 truncate max-w-[150px]">
                {selectedClient.razao_social}
              </span>
            </div>
            <button
              onClick={() => onClientSelect(null)}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Limpar
            </button>
          </div>

          <div className="space-y-1">
            {clientFields.map((field) => {
              const Icon = field.icon;
              
              return (
                <button
                  key={field.key}
                  onClick={() => handleInsertField(field.key, field.label)}
                  className="w-full flex items-center gap-1.5 p-1.5 rounded border border-slate-200 hover:border-primary-500 hover:bg-primary-50 transition-all group text-left"
                >
                  <Icon size={12} className="text-slate-400 group-hover:text-primary-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700">{field.label}</p>
                    {field.value && (
                      <p className="text-xs text-slate-500 truncate">{field.value}</p>
                    )}
                  </div>
                  <Plus size={12} className="text-primary-600 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                </button>
              );
            })}
          </div>

          <div className="mt-2 p-1.5 bg-amber-50 border border-amber-200 rounded">
            <p className="text-xs text-amber-700">
              💡 Use o bloco <strong>"Campo Dinâmico"</strong> do sidebar e edite o campo para o valor desejado
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function formatAddress(client) {
  const parts = [
    client.endereco_logradouro,
    client.endereco_numero,
    client.endereco_bairro,
    client.endereco_cidade,
    client.endereco_uf,
  ].filter(Boolean);
  
  return parts.join(', ') || 'Não informado';
}
