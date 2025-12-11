# 📡 Documentação do Server2.js

## 🎯 Visão Geral
O `server2.js` é o servidor principal da aplicação SLICED-DEMO que serve todos os arquivos estáticos do projeto e gerencia as APIs do Mercado Pago.

## 📁 Estrutura de Arquivos Servidos

### Pastas Disponíveis
O servidor está configurado para servir arquivos de todas as seguintes pastas:

1. **`/login`** - Páginas de autenticação
   - Acesso: `http://localhost:3000/login/`
   
2. **`/dashboard`** - Painéis administrativos
   - Acesso: `http://localhost:3000/dashboard/`
   - Exemplo: `http://localhost:3000/dashboard/dashboard-quiz.html`
   
3. **`/controle-dados`** - Controle de dados
   - Acesso: `http://localhost:3000/controle-dados/`
   - Exemplo: `http://localhost:3000/controle-dados/[nome-arquivo].html`
   
4. **`/usuário`** - Páginas do usuário
   - Acesso: `http://localhost:3000/usuário/`
   - Exemplo: `http://localhost:3000/usuário/perfil.html`
   
5. **`/imgs`** - Imagens e recursos visuais
   - Acesso: `http://localhost:3000/imgs/`
   - Exemplo: `http://localhost:3000/imgs/logo.png`
   
6. **`/backend`** - Scripts backend
   - Acesso: `http://localhost:3000/backend/`

## 🚀 Como Usar

### Iniciar o Servidor
```bash
node server2.js
```

### Acessar Páginas
- **Página Principal**: `http://localhost:3000/`
- **Login**: `http://localhost:3000/login/index.html`
- **Dashboard**: `http://localhost:3000/dashboard/[nome-arquivo].html`
- **Perfil**: `http://localhost:3000/usuário/perfil.html`

## 🔌 APIs Disponíveis

### 1. Criar PIX (Depósito)
- **Endpoint**: `POST /api/deposit/create`
- **Descrição**: Gera um QR Code PIX para depósito via Mercado Pago
- **Body**:
```json
{
  "amount": 100.00,
  "userId": "user123",
  "email": "usuario@email.com",
  "firstName": "João",
  "lastName": "Silva"
}
```

### 2. Solicitar Saque
- **Endpoint**: `POST /api/withdraw/request`
- **Descrição**: Solicita um saque via PIX
- **Body**:
```json
{
  "userId": "user123",
  "amount": 50.00,
  "pixKey": "11999999999",
  "pixKeyType": "phone"
}
```

### 3. Consultar Saldo
- **Endpoint**: `GET /api/user/:uid/balance`
- **Descrição**: Retorna o saldo do usuário
- **Exemplo**: `GET /api/user/user123/balance`

### 4. Webhook Mercado Pago
- **Endpoint**: `POST /api/webhook/mercadopago`
- **Descrição**: Recebe notificações do Mercado Pago sobre pagamentos

## 🛠️ Configuração

### Variáveis de Ambiente
O servidor usa as seguintes variáveis (arquivo `.env`):
- `PORT`: Porta do servidor (padrão: 3000)
- Token do Mercado Pago está hardcoded (considere mover para .env)

### Dependências
```json
{
  "express": "^4.x",
  "body-parser": "^1.x",
  "cors": "^2.x",
  "dotenv": "^16.x",
  "node-fetch": "^2.x"
}
```

## 📝 Notas Importantes

1. **Arquivos Estáticos**: Todos os arquivos CSS, JS, HTML e imagens são servidos automaticamente
2. **Rotas Dinâmicas**: As rotas com `:page` permitem acessar qualquer arquivo dentro da pasta
3. **CORS**: Habilitado para permitir requisições de diferentes origens
4. **Segurança**: O token do Mercado Pago deve ser movido para variáveis de ambiente em produção

## 🔍 Exemplo de Uso Completo

```javascript
// Acessar a página de login
window.location.href = 'http://localhost:3000/login/index.html';

// Fazer um depósito via API
fetch('http://localhost:3000/api/deposit/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 100,
    userId: 'user123',
    email: 'user@email.com',
    firstName: 'João',
    lastName: 'Silva'
  })
})
.then(res => res.json())
.then(data => console.log('QR Code:', data.data.qrCode));
```

## 🎨 Estrutura de Rotas

```
http://localhost:3000/
├── /                           → index.html (página principal)
├── /login/                     → Pasta de login
│   └── index.html             → Página de login
├── /dashboard/                 → Pasta de dashboards
│   ├── dashboard-quiz.html
│   └── [outros arquivos]
├── /controle-dados/           → Pasta de controle
│   └── [arquivos]
├── /usuário/                  → Pasta do usuário
│   ├── perfil.html
│   └── [outros arquivos]
├── /imgs/                     → Imagens
└── /api/                      → APIs
    ├── /deposit/create        → Criar PIX
    ├── /withdraw/request      → Solicitar saque
    └── /user/:uid/balance     → Consultar saldo
```

## ✅ Checklist de Funcionalidades

- [x] Servir index.html na raiz
- [x] Servir arquivos estáticos de todas as pastas
- [x] Rotas dinâmicas para páginas HTML
- [x] API de depósito (PIX)
- [x] API de saque
- [x] API de consulta de saldo
- [x] Webhook do Mercado Pago
- [x] CORS habilitado
- [x] Logs informativos no console
