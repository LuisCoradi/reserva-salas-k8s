import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
const app = express();
// Libera o acesso para o navegador
app.use(cors());
app.use(express.json());
// Define a URL do banco (tenta ler do .env, se falhar usa a local de fallback)
const connectionString = process.env.DATABASE_URL || "postgresql://admin:adminpassword@localhost:5433/reserva_salas?schema=public";
// Configura o pool de conexões e o adaptador
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const PORT = Number(process.env.PORT) || 8080;
app.use(express.json());
// --- UNIDADE ---
app.post('/unidades', async (req, res) => {
    const result = await prisma.unidade.create({ data: req.body });
    res.status(201).json(result);
});
app.get('/unidades', async (req, res) => {
    const result = await prisma.unidade.findMany();
    res.json(result);
});
app.put('/unidades/:id', async (req, res) => {
    const result = await prisma.unidade.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(result);
});
app.delete('/unidades/:id', async (req, res) => {
    await prisma.unidade.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
});
// --- SETOR ---
app.post('/setores', async (req, res) => {
    const result = await prisma.setor.create({ data: req.body });
    res.status(201).json(result);
});
app.get('/setores', async (req, res) => {
    const result = await prisma.setor.findMany();
    res.json(result);
});
app.put('/setores/:id', async (req, res) => {
    const result = await prisma.setor.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(result);
});
app.delete('/setores/:id', async (req, res) => {
    await prisma.setor.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
});
// --- SALA ---
app.post('/salas', async (req, res) => {
    const result = await prisma.sala.create({ data: req.body });
    res.status(201).json(result);
});
app.get('/salas', async (req, res) => {
    const result = await prisma.sala.findMany();
    res.json(result);
});
app.put('/salas/:id', async (req, res) => {
    const result = await prisma.sala.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(result);
});
app.delete('/salas/:id', async (req, res) => {
    await prisma.sala.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
});
// --- RESERVA ---
app.post('/reservas', async (req, res) => {
    const { sala_id, responsavel, data_reserva, hora_inicio, hora_fim } = req.body;
    // Formatação de datas para compatibilidade com o tipo DateTime do Prisma
    const dataReservaIso = new Date(data_reserva);
    const horaInicioIso = new Date(`1970-01-01T${hora_inicio}Z`);
    const horaFimIso = new Date(`1970-01-01T${hora_fim}Z`);
    // Validação básica de conflito
    const conflito = await prisma.reserva.findFirst({
        where: {
            sala_id: Number(sala_id),
            data_reserva: dataReservaIso,
            AND: [
                { hora_inicio: { lt: horaFimIso } },
                { hora_fim: { gt: horaInicioIso } }
            ]
        }
    });
    if (conflito) {
        return res.status(400).json({ error: 'Conflito de horário nesta sala.' });
    }
    const result = await prisma.reserva.create({
        data: {
            sala_id: Number(sala_id),
            responsavel,
            data_reserva: dataReservaIso,
            hora_inicio: horaInicioIso,
            hora_fim: horaFimIso
        }
    });
    res.status(201).json(result);
});
app.get('/reservas', async (req, res) => {
    const result = await prisma.reserva.findMany();
    res.json(result);
});
app.delete('/reservas/:id', async (req, res) => {
    await prisma.reserva.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
//# sourceMappingURL=server.js.map