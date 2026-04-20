
api busca feriados (capitais apenas): https://feriadosapi.com/api/v1/feriados/cidade/2927408?ano=2026

api feriados estaduais: https://feriadosapi.com/api/v1/feriados/estado/BA?ano=2026

api feriados nacional: https://feriadosapi.com/api/v1/feriados/nacionais?ano=2026

api busca municipios por estado: https://feriadosapi.com/api/v1/municipios?uf=BA


EXEMPLO DE USU JS: 
const response = await fetch('https://feriadosapi.com/api/v1/feriados/nacionais?ano=2026', {
  headers: {
    'Authorization': 'Bearer sk_live_89f287f124142457e616e98e5431fe8b28f1724081152a11'
  }
});

const data = await response.json();
console.log(data);

Estrutura das Respostas
Formato Geral
Todas as respostas da API seguem uma estrutura consistente em JSON:

{
  "ano": "2025",                     // Ano consultado
  "feriados": [...],                 // Array de feriados
  "municipios": [...],               // Array de municípios (no endpoint /municipios)
  "meta": {                          // Metadados de paginação (quando aplicável)
    "total": 100,
    "page": 1,
    "per_page": 50,
    "total_pages": 2
  }
}
Objeto: Feriado
Estrutura padrão retornada nos endpoints de feriados.

Campo	Tipo	Descrição
id	string (UUID)	Identificador único do feriado
data	string	Data do feriado no formato DD/MM/YYYY
nome	string	Nome oficial do feriado
tipo	string	Tipo: NACIONAL, ESTADUAL, MUNICIPAL ou FACULTATIVO
descricao	string	Descrição histórica e contexto do feriado
uf	string | null	Sigla do estado (somente para feriados estaduais)
codigo_ibge	number | null	Código IBGE da cidade (somente para feriados municipais)
bancario	boolean	Indica se é feriado bancário (calendário FEBRABAN)
Objeto: Município
Estrutura retornada pelo endpoint de municípios.

Campo	Tipo	Descrição
ibge	number	Código IBGE único do município (7 dígitos)
nome	string	Nome oficial do município
uf	string	Sigla do estado de pertencimento
Notas de Resposta
Paginação

Endpoints de listagem retornam também um objeto meta contendo total, page, per_page e total_pages.

Contexto da Resposta

Dependendo do endpoint, os dados vêm envoltos em propriedades como feriados ou municipios.

key: sk_live_89f287f124142457e616e98e5431fe8b28f1724081152a11