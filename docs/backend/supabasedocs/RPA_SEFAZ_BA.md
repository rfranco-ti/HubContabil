# 🤖 RPA SEFAZ BA - Documentação Completa

## 📋 Visão Geral

Robô de automação para consulta de Inscrição Estadual e Situação Cadastral no site da SEFAZ Bahia.

---

## 🔗 Informações do Site

**URL:** `https://portal.sefaz.ba.gov.br/scripts/cadastro/cadastroBa/consultaBa.asp`

**Características:**
- ✅ Não possui captcha
- ✅ Acesso público
- ✅ Retorna dados completos do contribuinte
- ⚠️ Layout antigo (HTML tables)
- ⚠️ Codificação UTF-8 com caracteres especiais (HTML entities)

---

## 🎯 Funcionalidades

### 1. Consulta por CNPJ
- **Input:** CNPJ (apenas números)
- **Ação:** Preenche campo e clica em consultar
- **Output:** Inscrição Estadual + Situação Cadastral

### 2. Dados Extraídos

| Campo | XPath | Formato |
|-------|-------|---------|
| **Inscrição Estadual** | `/html/body/table/tbody/tr[3]/td/table[2]/tbody/tr/td/p[1]/table/tbody/tr[3]/td[2]` | `160.381.158 ME` |
| **Situação Cadastral** | `/html/body/table/tbody/tr[3]/td/table[2]/tbody/tr/td/table[1]/tbody/tr[13]/td[1]` | `ATIVO` |
| **Endereço Correspondência** | `/html/body/table/tbody/tr[3]/td/table[2]/tbody/tr/td/p[2]/table/tbody/tr[7]/td[1]` | Texto completo |

---

## 🔧 Implementação Técnica

### Backend (Node.js + Puppeteer)

**Arquivo:** `backend/controllers/rpaController.js`

**Endpoint:** `POST /api/rpa/sefaz-ba/inscricao`

**Request:**
```json
{
  "cnpj": "34509314000136"
}
```

**Response (Sucesso):**
```json
{
  "sucesso": true,
  "message": "Inscrição Estadual obtida com sucesso na SEFAZ BA.",
  "cnpj_buscado": "34509314000136",
  "inscricaoEstadual": "160.381.158 ME",
  "situacaoCadastral": "ATIVO",
  "enderecoCorrespondencia": ""
}
```

**Response (Erro):**
```json
{
  "message": "Não foi possível encontrar a Inscrição Estadual no site da SEFAZ BA.",
  "cnpj_buscado": "34509314000136"
}
```

### Fluxo de Execução

```
1. Recebe CNPJ do frontend
   ↓
2. Inicia navegador headless (Puppeteer)
   ↓
3. Acessa site da SEFAZ BA
   ↓
4. Localiza campo de CNPJ via XPath
   ↓
5. Digita CNPJ (apenas números)
   ↓
6. Clica no botão de consulta
   ↓
7. Aguarda navegação (3 segundos)
   ↓
8. Extrai dados via XPath
   ↓
9. Retorna JSON para frontend
   ↓
10. Fecha navegador
```

---

## 📱 Frontend (React)

**Arquivo:** `frontend/src/pages/NovoCliente.jsx`

**Componentes:**
- Botão de lupa (+) no campo de Inscrição Estadual
- Campo "Situação SEFAZ" (somente leitura)
- Notificação de sucesso com os dados obtidos

**Regras de Negócio:**
1. Botão só funciona para UF = BA
2. Valida CNPJ com 14 dígitos antes de buscar
3. Exibe loading durante consulta
4. Notificação de sucesso/erro via alert

---

## 🗂️ Estrutura HTML do Site SEFAZ

### Página de Consulta
```html
<!-- Campo CNPJ -->
<input type="text" name="cnpj">
  XPath: /html/body/table/tbody/tr[3]/td/table/tbody/tr[2]/td[2]/table/tbody/tr[2]/td[2]/p/input

<!-- Botão Consultar -->
<input type="submit" value="Consultar">
  XPath: /html/body/table/tbody/tr[3]/td/table/tbody/tr[2]/td[2]/table/tbody/tr[2]/td[4]/input
```

### Página de Resultado
```html
<!-- Inscrição Estadual -->
<td>Inscri&ccedil;&atilde;o Estadual:</td>
<td>160.381.158&nbsp;ME</td>
  XPath: /html/body/table/tbody/tr[3]/td/table[2]/tbody/tr/td/p[1]/table/tbody/tr[3]/td[2]

<!-- Situação Cadastral -->
<td><b>Situa&ccedil;&atilde;o Cadastral Vigente:</b>&nbsp;ATIVO</td>
  XPath: /html/body/table/tbody/tr[3]/td/table[2]/tbody/tr/td/table[1]/tbody/tr[13]/td[1]
```

---

## 🛡️ Tratamento de Erros

### Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `TimeoutError` | Site fora do ar | Aguardar e tentar novamente |
| `XPath not found` | Mudança no layout | Atualizar XPaths |
| `IE not found` | CNPJ inexistente | Verificar CNPJ |
| `Navigation timeout` | Lentidão na rede | Aumentar timeout |

### Fallbacks Implementados

1. **XPath primário** → Tenta XPath exato
2. **XPath secundário** → Tenta busca por texto
3. **Body text regex** → Extrai do texto da página
4. **Retorno nulo** → Informa usuário para preencher manual

---

## 📊 Exemplo de Uso

### No Formulário de Cadastro

1. Usuário preenche CNPJ: `34.509.314/0001-36`
2. Seleciona UF: `BA`
3. Clica no botão (+) ao lado de "Inscrição Estadual"
4. Sistema:
   - Valida CNPJ (14 dígitos)
   - Verifica UF = BA
   - Chama endpoint `/api/rpa/sefaz-ba/inscricao`
   - Backend executa web scraping
   - Retorna IE: `160.381.158 ME`
   - Retorna Situação: `ATIVO`
5. Campos preenchidos automaticamente
6. Alert de sucesso exibe dados

---

## 🔐 Considerações de Segurança

- ✅ Não armazena credenciais (site é público)
- ✅ Não bypass de autenticação (não há login)
- ✅ Rate limiting implícito (cada consulta leva ~5 segundos)
- ⚠️ Importante: Não fazer muitas requisições simultâneas

---

## 📝 Manutenção Futura

### Quando Atualizar os XPaths

Sinais de que precisa atualizar:
- [ ] XPath retorna null consistentemente
- [ ] Site da SEFAZ mudou layout
- [ ] Dados não são extraídos corretamente

### Como Atualizar

1. Acesse site manualmente
2. Inspecione elemento (F12)
3. Copie novo XPath
4. Atualize em `rpaController.js`
5. Teste com CNPJ conhecido

---

## 🧪 Testes

### Caso de Teste 1 - CNPJ Válido
```
Entrada: 34509314000136
Resultado Esperado:
  - inscricaoEstadual: "160.381.158 ME"
  - situacaoCadastral: "ATIVO"
```

### Caso de Teste 2 - CNPJ Inválido
```
Entrada: 00000000000000
Resultado Esperado:
  - Erro 404: "Não foi possível encontrar..."
```

### Caso de Teste 3 - UF Diferente de BA
```
Entrada: UF = SP
Resultado Esperado:
  - Alert: "Disponível apenas para empresas da Bahia"
```

---

## 📚 Histórico de Versões

| Data | Versão | Mudanças |
|------|--------|----------|
| 31/03/2026 | 1.0 | Implementação inicial |
| 31/03/2026 | 1.1 | Adicionado campo Situação SEFAZ |
| 31/03/2026 | 1.2 | Documentação completa |

---

## 🚀 Próximas Melhorias (Backlog)

- [ ] Adicionar consulta de outros estados (SEFAZ SP, RJ, etc.)
- [ ] Cache de resultados (evitar consultas repetidas)
- [ ] Fila de consultas (rate limiting)
- [ ] Logs detalhados de cada consulta
- [ ] Dashboard de consultas realizadas
- [ ] Exportar dados para PDF

---

## 📞 Suporte

**Documentação relacionada:**
- `backend/controllers/rpaController.js` - Implementação do robô
- `frontend/src/pages/NovoCliente.jsx` - Integração frontend
- `backend/supabase/MIGRATION_LOG.md` - Log de migração

**Em caso de dúvidas:**
1. Consulte esta documentação
2. Verifique logs do Puppeteer no console
3. Teste manualmente no site da SEFAZ

---

**Última atualização:** 31/03/2026  
**Responsável:** Equipe de Desenvolvimento  
**Status:** ✅ Em produção
