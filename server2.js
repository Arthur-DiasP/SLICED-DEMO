// --- ARQUIVO: server2.js (Mercado Pago + Index.html) ---

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const fetch = require('node-fetch'); // Instale: npm install node-fetch@2
const path = require('path'); // [NOVO] Necessário para caminhos de arquivos

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== DADOS MERCADO PAGO =====
const MERCADO_PAGO_ACCESS_TOKEN = 'APP_USR-8089215665209853-120909-01511fb41a354b6ed768b0ba178a02c0-1981576535';
const MP_API_BASE = 'https://api.mercadopago.com';

// --- MIDDLEWARES ---
app.use(cors());
app.use(bodyParser.json());

// [NOVO] Configura a pasta atual para servir arquivos estáticos (CSS, JS, Imagens)
app.use(express.static(path.join(__dirname)));

// [NOVO] Servir arquivos específicos de cada pasta
app.use('/controle-dados', express.static(path.join(__dirname, 'controle-dados')));
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));
app.use('/imgs', express.static(path.join(__dirname, 'imgs')));
app.use('/login', express.static(path.join(__dirname, 'login')));
app.use('/usuário', express.static(path.join(__dirname, 'usuário')));
app.use('/backend', express.static(path.join(__dirname, 'backend')));

// [NOVO] Rota Principal: Abre o site (index.html) ao acessar http://localhost:3000/
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// [NOVO] Rotas específicas para páginas HTML de cada pasta
app.get('/login/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'index.html'));
});

app.get('/dashboard/:page', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, 'dashboard', page));
});

app.get('/controle-dados/:page', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, 'controle-dados', page));
});

app.get('/usuário/:page', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, 'usuário', page));
});

// ==================================================================
// ROTA POST: GERAR PIX (Mercado Pago)
// ==================================================================
app.post('/api/deposit/create', async (req, res) => {
    try {
        const { amount, userId, email, firstName, lastName } = req.body;

        console.log(`\n🔵 [Server 2] RECEBIDO PEDIDO DE PIX`);
        console.log(`👤 Usuário: ${firstName} ${lastName} (ID: ${userId})`);
        console.log(`📧 Email: ${email}`);
        console.log(`💰 Valor: R$ ${amount}`);

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Valor inválido.' });
        }

        const paymentData = {
            transaction_amount: parseFloat(amount),
            description: `Depósito SLICED - ${firstName} ${lastName}`,
            payment_method_id: 'pix',
            payer: {
                email: email || 'email_padrao@sliced.com',
                first_name: firstName || 'Usuario',
                last_name: lastName || userId
            },
            notification_url: `https://seusite.com/api/webhook/mercadopago`, 
            metadata: {
                user_id: userId
            }
        };

        const response = await fetch(`${MP_API_BASE}/v1/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
                'X-Idempotency-Key': `PAY-${Date.now()}-${userId}`
            },
            body: JSON.stringify(paymentData)
        });

        const payment = await response.json();

        if (!response.ok) {
            console.error('❌ Erro Mercado Pago:', payment);
            return res.status(400).json({ 
                success: false, 
                message: 'Erro ao gerar PIX no Mercado Pago.',
                detail: payment.message || payment 
            });
        }

        const pixData = payment.point_of_interaction?.transaction_data;

        if (!pixData) {
             return res.status(500).json({ success: false, message: 'QR Code não retornado pelo MP.' });
        }

        console.log(`✅ PIX Criado com Sucesso! ID MP: ${payment.id}`);

        res.status(200).json({
            success: true,
            data: {
                paymentId: payment.id,
                qrCode: pixData.qr_code,
                qrCodeBase64: pixData.qr_code_base64
            }
        });

    } catch (error) {
        console.error('❌ Erro Crítico no servidor:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao processar API.' });
    }
});

// ==================================================================
// ROTA POST: SOLICITAR SAQUE
// ==================================================================
app.post('/api/withdraw/request', (req, res) => {
    try {
        const { userId, amount, pixKey, pixKeyType } = req.body;
        
        console.log(`\n💸 [Server 2] SAQUE SOLICITADO`);
        console.log(`👤 Usuário: ${userId} | Valor: ${amount}`);
        console.log(`🔑 Chave PIX (${pixKeyType}): ${pixKey}`);

        res.json({ success: true, message: 'Solicitação de saque recebida. Processamento em 24h.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao processar saque.' });
    }
});

// ==================================================================
// ROTA GET: SALDO
// ==================================================================
app.get('/api/user/:uid/balance', (req, res) => {
    res.json({ success: true, data: { balance: 0.00 } });
});

// ==================================================================
// ROTA WEBHOOK
// ==================================================================
app.post('/api/webhook/mercadopago', (req, res) => {
    const { type, data } = req.body;
    console.log(`🔔 Webhook MP: ${type} - ID: ${data?.id}`);
    res.status(200).send('OK');
});

const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 SERVER 2 RODANDO NA PORTA ${PORT}`);
    console.log(`=================================================`);
    console.log(`🏠 SITE PRINCIPAL: http://localhost:${PORT}`);
    console.log(`📁 PASTAS DISPONÍVEIS:`);
    console.log(`   📂 Login: http://localhost:${PORT}/login/`);
    console.log(`   📂 Dashboard: http://localhost:${PORT}/dashboard/`);
    console.log(`   📂 Controle de Dados: http://localhost:${PORT}/controle-dados/`);
    console.log(`   📂 Usuário: http://localhost:${PORT}/usuário/`);
    console.log(`   📂 Imagens: http://localhost:${PORT}/imgs/`);
    console.log(`   📂 Backend: http://localhost:${PORT}/backend/`);
    console.log(`=================================================`);
    console.log(`📡 APIs DISPONÍVEIS:`);
    console.log(`   💰 PIX: http://localhost:${PORT}/api/deposit/create`);
    console.log(`   💸 Saque: http://localhost:${PORT}/api/withdraw/request`);
    console.log(`   💵 Saldo: http://localhost:${PORT}/api/user/:uid/balance`);
    console.log(`=================================================`);
});