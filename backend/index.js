// backend/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { spawn } = require('child_process');
const path = require('path');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE DE AUTENTICAÇÃO ---
// Middleware para proteger rotas que exigem login
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // Se não há token, não autorizado

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Se o token não for válido, acesso proibido
    req.user = user;
    next();
  });
};


// --- ROTAS DE AUTENTICAÇÃO E USUÁRIO ---
// Rota de Teste de Diagnóstico
app.get('/test', (req, res) => {
  res.send('O servidor está a funcionar e a rota de teste foi encontrada!');
});

// ROTA: Criar um novo usuário (cadastro)
app.post('/usuarios', async (req, res) => {
    const { nome, email, password } = req.body;

    if (!nome || !email || !password) {
        return res.status(400).json({ message: "Nome, email e senha são obrigatórios." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                nome,
                email,
                senha: hashedPassword,
            },
        });
        res.status(201).json({ id: user.id, nome: user.nome, email: user.email });
    } catch (error) {
        if (error.code === 'P2002') { // Erro do Prisma para campo único duplicado
            return res.status(409).json({ message: "Este email já está em uso." });
        }
        res.status(500).json({ message: "Erro ao criar usuário.", error: error.message });
    }
});


// ROTA: Gerar e enviar Magic Link
app.post('/auth/magic-link', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email é obrigatório' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
        
        // Em um app real, aqui você enviaria o link por email.
        // Para este projeto, retornamos o link diretamente para facilitar o teste.
        const magicLink = `${process.env.FRONTEND_URL}/auth/callback?token=${token}`;
        console.log(`Link Mágico para ${email}: ${magicLink}`);

        res.status(200).json({ message: `Link de acesso enviado para ${email}. Verifique sua caixa de entrada.` });

    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error: error.message });
    }
});

// ROTA: Verificar o token do Magic Link e retornar um token de sessão
app.post('/auth/verify', (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ message: 'Token é obrigatório.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }

        try {
            const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }

            // Gera um token de sessão mais longo
            const sessionToken = jwt.sign({ userId: user.id, email: user.email, nome: user.nome }, process.env.JWT_SECRET, { expiresIn: '7d' });

            res.json({
                message: 'Verificado com sucesso!',
                token: sessionToken,
                userName: user.nome,
            });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar usuário.' });
        }
    });
});


// --- ROTAS DE CONTEÚDO (PROTEGIDAS) ---

// ROTA: Listar todos os módulos
app.get('/modulos', authenticateToken, async (req, res) => {
    try {
        const modulos = await prisma.modulo.findMany({
            include: {
                aulas: {
                    select: { id: true } // Apenas IDs para calcular progresso
                }
            }
        });
        res.json(modulos);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar módulos." });
    }
});

// ROTA: Detalhes de um módulo específico
app.get('/modulos/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const modulo = await prisma.modulo.findUnique({
            where: { id: parseInt(id) },
            include: {
                aulas: {
                    orderBy: { id: 'asc' }
                }
            },
        });
        if (!modulo) {
            return res.status(404).json({ message: 'Módulo não encontrado.' });
        }
        res.json(modulo);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar detalhes do módulo." });
    }
});

// --- ROTAS DE PROGRESSO (PROTEGIDAS) ---

// ROTA: Obter progresso do usuário logado
app.get('/progresso', authenticateToken, async (req, res) => {
    try {
        const progresso = await prisma.progressoAula.findMany({
            where: { userId: req.user.userId },
            select: { aulaId: true }
        });
        res.json(progresso.map(p => p.aulaId));
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar progresso." });
    }
});

// ROTA: Marcar uma aula como concluída (ou desmarcar)
app.post('/progresso/aula/:aulaId', authenticateToken, async (req, res) => {
    const { aulaId } = req.params;
    const userId = req.user.userId;

    try {
        const existingProgress = await prisma.progressoAula.findUnique({
            where: { userId_aulaId: { userId, aulaId: parseInt(aulaId) } }
        });

        if (existingProgress) {
            await prisma.progressoAula.delete({
                where: { userId_aulaId: { userId, aulaId: parseInt(aulaId) } }
            });
            res.json({ message: 'Aula desmarcada como concluída.' });
        } else {
            await prisma.progressoAula.create({
                data: {
                    userId: userId,
                    aulaId: parseInt(aulaId),
                }
            });
            res.status(201).json({ message: 'Aula marcada como concluída.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar progresso.', error: error.message });
    }
});

// --- ROTA DE GERAÇÃO DE CERTIFICADO (PROTEGIDA) ---

app.post('/generate-certificate', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const data = {
            student_name: user.nome || 'Aluno(a)',
            course_name: 'Saberes da Floresta',
            completion_date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
        };

        const dadosJson = JSON.stringify(data);
        const dadosBase64 = Buffer.from(dadosJson).toString('base64');
        
        const pythonProcess = spawn('python', [
            path.join(__dirname, 'gerador_certificado', 'script.py'),
            dadosBase64
        ]);
        
        const pdfChunks = [];
        pythonProcess.stdout.on('data', (chunk) => {
            pdfChunks.push(chunk);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Erro do script Python: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return res.status(500).json({ message: 'Falha ao gerar o PDF.' });
            }
            const pdfBuffer = Buffer.concat(pdfChunks);
            const fileName = `Certificado-${user.nome.replace(/\s+/g, '_')}.pdf`;

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            res.send(pdfBuffer);
        });

    } catch (error) {
        console.error("Erro no endpoint do certificado:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});