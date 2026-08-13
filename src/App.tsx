import { useEffect, useState } from 'react';
import axios from 'axios';

export default function App() {
  const [unidades, setUnidades] = useState<any[]>([]);
  const [setores, setSetores] = useState<any[]>([]);
  const [salas, setSalas] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);

  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = async () => {
    const [resUnidades, resSetores, resSalas, resReservas] = await Promise.all([
      axios.get('http://localhost:3000/unidades'),
      axios.get('http://localhost:3000/setores'),
      axios.get('http://localhost:3000/salas'),
      axios.get('http://localhost:3000/reservas')
    ]);
    setUnidades(resUnidades.data);
    setSetores(resSetores.data);
    setSalas(resSalas.data);
    setReservas(resReservas.data);
  };

  const criarUnidade = async () => {
    await axios.post('http://localhost:3000/unidades', { nome: 'Nova Unidade', descricao: 'Teste' });
    carregarTudo();
  };

  const criarSetor = async () => {
    if (unidades.length === 0) return alert('Crie uma unidade primeiro!');
    await axios.post('http://localhost:3000/setores', { nome: 'Novo Setor', unidade_id: unidades[0].id });
    carregarTudo();
  };

  const criarSala = async () => {
    if (setores.length === 0) return alert('Crie um setor primeiro!');
    await axios.post('http://localhost:3000/salas', { nome: 'Nova Sala', capacidade: 30, setor_id: setores[0].id });
    carregarTudo();
  };

  const criarReserva = async () => {
    if (salas.length === 0) return alert('Crie uma sala primeiro!');
    try {
      await axios.post('http://localhost:3000/reservas', {
        sala_id: salas[0].id,
        responsavel: 'Rubens',
        data_reserva: '2026-10-10',
        hora_inicio: '14:00:00',
        hora_fim: '16:00:00'
      });
      carregarTudo();
    } catch (error) {
      alert('Erro: Conflito de horário na sala!');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Infraestrutura - Sistema de Reservas</h1>
      <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>

        <div>
          <h3>1. Unidades</h3>
          <button onClick={criarUnidade}>Criar Unidade</button>
          <ul>{unidades.map(u => <li key={u.id}>{u.nome}</li>)}</ul>
        </div>

        <div>
          <h3>2. Setores</h3>
          <button onClick={criarSetor}>Criar Setor</button>
          <ul>{setores.map(s => <li key={s.id}>{s.nome} (Unidade: {s.unidade_id})</li>)}</ul>
        </div>

        <div>
          <h3>3. Salas</h3>
          <button onClick={criarSala}>Criar Sala</button>
          <ul>{salas.map(s => <li key={s.id}>{s.nome} (Setor: {s.setor_id})</li>)}</ul>
        </div>

        <div>
          <h3>4. Reservas</h3>
          <button onClick={criarReserva}>Criar Reserva</button>
          <ul>{reservas.map(r => <li key={r.id}>{r.responsavel} - {new Date(r.data_reserva).toLocaleDateString()}</li>)}</ul>
        </div>

      </div>
    </div>
  );
}