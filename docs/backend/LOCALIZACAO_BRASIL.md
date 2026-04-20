# Localização Brasil - Configuração Completa

## ✅ Sistema Configurado para o Brasil

Todo o sistema (banco de dados, backend, frontend) agora está localizado para o Brasil.

---

## 🗄️ Banco de Dados (Supabase PostgreSQL)

### Configuração
```sql
-- Timezone: America/Sao_Paulo (UTC-3)
-- Locale: pt_BR (Português Brasileiro)
-- Formato de data: DD/MM/YYYY
```

### Colunas de Data
- Todas armazenadas como `TIMESTAMP` no banco
- Backend converte para UTC meio-dia para evitar timezone issues
- Frontend exibe no formato brasileiro

---

## 🔧 Backend (Node.js/Express)

### Timezone Global
```javascript
// src/app.js
process.env.TZ = 'America/Sao_Paulo';

// Middleware em todas as requests
app.use(configTimezone);
```

### Headers de Resposta
```
X-Timezone: America/Sao_Paulo
X-Language: pt-BR
```

### .env
```env
TZ=America/Sao_Paulo
```

---

## 🎨 Frontend (React)

### HTML Lang
```html
<html lang="pt-BR">
```

### Utilitários de Formatação
```javascript
// src/utils/formatadores.js

formatarDataBR('2026-04-15')     // → "15/04/2026"
formatarDataMes('2026-04-15')    // → "15 de abril de 2026"
formatarMoeda(1234.56)           // → "R$ 1.234,56"
formatarCNPJ('12345678000190')   // → "12.345.678/0001-90"
formatarCPF('12345678901')       // → "123.456.789-01"
formatarTelefone('11999999999')  // → "(11) 99999-9999"
```

### FullCalendar
```javascript
locale={ptBrLocale}  // Locale português
firstDay={1}         // Segunda-feira como primeiro dia
```

---

## 📅 Calendário

### Configurações
| Item | Valor |
|------|-------|
| Locale | `pt-BR` |
| Primeiro dia | Segunda-feira (1) |
| Nomes dos meses | Janeiro, Fevereiro, ... |
| Nomes dos dias | Seg, Ter, Qua, ... |
| Formato de data | DD/MM/YYYY |

---

## 💰 Formatos Brasileiros

### Moeda
```javascript
R$ 1.234,56  // Ponto para milhar, vírgula para decimal
```

### Data
```javascript
15/04/2026   // DD/MM/YYYY
15 de abril de 2026  // Data por extenso
```

### Telefone
```javascript
(11) 99999-9999  // Celular
(11) 9999-9999   // Fixo
```

### Documentos
```javascript
CNPJ: 12.345.678/0001-90
CPF:  123.456.789-01
```

---

## 🌐 Timezone

### Referências
| Fuso | UTC | Nome |
|------|-----|------|
| **Brasil (configurado)** | **UTC-3** | **America/Sao_Paulo** |
| UTC | UTC+0 | Coordinated Universal Time |

### Horário de Verão
O Brasil **não utiliza** horário de verão desde 2019.
O timezone `America/Sao_Paulo` é **sempre UTC-3**.

---

## 🔍 Verificação

### Backend
```bash
# Iniciar servidor
cd backend && node index.js

# Verificar headers
curl -I http://localhost:3000/health
# Deve mostrar:
# X-Timezone: America/Sao_Paulo
# X-Language: pt-BR
```

### Frontend
```javascript
// No console do browser:
formatarDataBR('2026-04-15')  // → "15/04/2026"
formatarMoeda(1000)           // → "R$ 1.000,00"
```

---

## 📁 Arquivos Criados/Modificados

| Arquivo | Mudança |
|---------|---------|
| `backend/.env` | Adicionado `TZ=America/Sao_Paulo` |
| `backend/.env.example` | Documentado TZ |
| `backend/src/app.js` | `process.env.TZ` + middleware |
| `backend/src/middlewares/timezone.js` | ✅ Novo middleware |
| `frontend/index.html` | `lang="pt-BR"` |
| `frontend/src/utils/formatadores.js` | ✅ Novos utilitários |

---

## ✅ Checklist de Localização

- [x] Timezone: America/Sao_Paulo (UTC-3)
- [x] Locale HTML: pt-BR
- [x] Formato de data: DD/MM/YYYY
- [x] Formato de moeda: R$ (Real)
- [x] Primeiro dia da semana: Segunda-feira
- [x] Nomes de meses/dias: Português
- [x] Formatação de CNPJ/CPF
- [x] Formatação de telefone
- [x] Headers de resposta: pt-BR
- [x] Utilitários de formatação

---

**Sistema 100% localizado para o Brasil!** 🇧🇷
