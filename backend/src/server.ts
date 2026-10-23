import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const app = express();

app.use(cors());
app.use(express.json());

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ DATABASE_URL não definida. Usando fallback local para testes...');
}

// Configura o pool de conexões e o adaptador
const pool = new Pool({ 
  connectionString: connectionString || "postgresql://admin:adminpassword@localhost:5433/reserva_salas?schema=public" 
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PORT = Number(process.env.PORT) || 8080;

// Rota de teste
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Reserva de Salas API está rodando perfeitamente! 🚀',
  });
});

// --- UNIDADE ---
app.post('/unidades', async (req, res) => {
  try {
    const result = await prisma.unidade.create({ data: req.body });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar unidade' });
  }
});

app.get('/unidades', async (req, res) => {
  try {
    const result = await prisma.unidade.findMany();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar unidades' });
  }
});

app.put('/unidades/:id', async (req, res) => {
  try {
    const result = await prisma.unidade.update({ 
      where: { id: Number(req.params.id) }, 
      data: req.body 
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar unidade' });
  }
});

app.delete('/unidades/:id', async (req, res) => {
  try {
    await prisma.unidade.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar unidade' });
  }
});

// --- SETOR ---
app.post('/setores', async (req, res) => {
  try {
    const result = await prisma.setor.create({ data: req.body });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar setor' });
  }
});

app.get('/setores', async (req, res) => {
  try {
    const result = await prisma.setor.findMany();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar setores' });
  }
});

app.put('/setores/:id', async (req, res) => {
  try {
    const result = await prisma.setor.update({ 
      where: { id: Number(req.params.id) }, 
      data: req.body 
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar setor' });
  }
});

app.delete('/setores/:id', async (req, res) => {
  try {
    await prisma.setor.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar setor' });
  }
});

// --- SALA ---
app.post('/salas', async (req, res) => {
  try {
    const result = await prisma.sala.create({ data: req.body });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar sala' });
  }
});

app.get('/salas', async (req, res) => {
  try {
    const result = await prisma.sala.findMany();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar salas' });
  }
});

app.put('/salas/:id', async (req, res) => {
  try {
    const result = await prisma.sala.update({ 
      where: { id: Number(req.params.id) }, 
      data: req.body 
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar sala' });
  }
});

app.delete('/salas/:id', async (req, res) => {
  try {
    await prisma.sala.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar sala' });
  }
});

// --- RESERVA ---
app.post('/reservas', async (req, res) => {
  try {
    const { sala_id, responsavel, data_reserva, hora_inicio, hora_fim } = req.body;

    const dataReservaIso = new Date(data_reserva);
    const horaInicioIso = new Date(`1970-01-01T${hora_inicio}Z`);
    const horaFimIso = new Date(`1970-01-01T${hora_fim}Z`);

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar reserva' });
  }
});

app.get('/reservas', async (req, res) => {
  try {
    const result = await prisma.reserva.findMany();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar reservas' });
  }
});

app.delete('/reservas/:id', async (req, res) => {
  try {
    await prisma.reserva.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar reserva' });
  }
});

// --- INICIALIZAÇÃO SEGURA ---
async function startServer() {
  try {
    await prisma.$connect();
    console.log('Conectado ao PostgreSQL com sucesso!');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao conectar no banco de dados:', error);
    process.exit(1);
  }
}

startServer();