import { mapCnpjDataToForm, mapCnpjDataToEditableFields, formatDateToInput } from '../cnpjMapper';

describe('cnpjMapper utils', () => {
  describe('formatDateToInput', () => {
    it('deve converter data DD/MM/YYYY para YYYY-MM-DD', () => {
      expect(formatDateToInput('25/12/2023')).toBe('2023-12-25');
    });

    it('deve retornar a string original se não tiver barras', () => {
      expect(formatDateToInput('2023-12-25')).toBe('2023-12-25');
      expect(formatDateToInput('')).toBe('');
    });
  });

  describe('mapCnpjDataToForm', () => {
    const mockPrevData = {
      razao_social: 'Antiga',
      nome_fantasia: '',
      data_abertura: '',
      natureza_juridica: '',
      inscricao_estadual: '123456',
      inscricao_municipal: '654321',
      status: 'Inativo',
      cnae_principal: { codigo: '', descricao: '' },
      contato_principal: { nome: '', email: '', telefone: '' },
      endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' }
    };

    it('deve mesclar os dados da API com os dados anteriores preservando campos como IE e IM', () => {
      const mockApiData = {
        razaoSocial: 'Nova Razão Social',
        nomeFantasia: 'Novo Nome Fantasia',
        dataAbertura: '10/01/2020',
        naturezaJuridica: 'LTDA',
        situacao: { descricao: 'Ativa' },
        cnaePrincipal: { codigo: '1234-5/67', descricao: 'Teste CNAE' },
        cnaesSecundarios: [],
        socios: [],
        endereco: {
          cep: '40000000',
          logradouro: 'Rua Teste',
          numero: '123',
          bairro: 'Centro',
          cidade: 'Salvador',
          uf: 'BA'
        },
        telefones: [{ ddd: '71', numero: '999999999' }],
        email: 'contato@teste.com',
        regimeTributario: 'Simples Nacional'
      };

      const result = mapCnpjDataToForm(mockApiData, mockPrevData);

      expect(result.razao_social).toBe('Nova Razão Social');
      expect(result.nome_fantasia).toBe('Novo Nome Fantasia');
      expect(result.data_abertura).toBe('2020-01-10'); // Verificando formatação de data
      expect(result.inscricao_estadual).toBe('123456'); // Mantido do prevData
      expect(result.inscricao_municipal).toBe('654321'); // Mantido do prevData
      expect(result.status).toBe('Ativa');
      expect(result.cnae_principal.codigo).toBe('1234-5/67');
      expect(result.endereco.logradouro).toBe('Rua Teste');
      expect(result.endereco.uf).toBe('BA');
      expect(result.contato_principal.telefone).toBe('71999999999');
      expect(result.contato_principal.email).toBe('contato@teste.com');
      expect(result.regime_tributario).toBe('Simples Nacional');
    });

    it('deve lidar corretamente com dados vazios da API e usar prevData', () => {
      const mockEmptyApiData = {};
      const result = mapCnpjDataToForm(mockEmptyApiData, mockPrevData);

      expect(result.razao_social).toBe('Antiga');
      expect(result.regime_tributario).toBe('Outro'); // Default se não vier
    });
  });

  describe('mapCnpjDataToEditableFields', () => {
    it('deve marcar campos que não vieram da API como true (editáveis)', () => {
      const mockApiData = {
        razaoSocial: 'Teste',
        // nomeFantasia ausente
        endereco: { cep: '40000000' } // logradouro ausente
      };
      const prevEditableFields = {
        razao_social: false,
        nome_fantasia: false,
        cep: false,
        logradouro: false
      };

      const result = mapCnpjDataToEditableFields(mockApiData, prevEditableFields);

      expect(result.razao_social).toBe(false); // Veio da API, não deve ser editável se era false
      expect(result.nome_fantasia).toBe(true); // Não veio, deve ser liberado para edição
      expect(result.cep).toBe(false);
      expect(result.logradouro).toBe(true);
    });
  });
});
