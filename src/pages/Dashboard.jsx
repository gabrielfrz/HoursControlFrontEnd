import { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import './Dashboard.css';


export default function Dashboard() {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    async function loadPoints() {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/points', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPoints(res.data);
      } catch (err) {
        toast.error('Erro ao carregar pontos');
      }
    }
    loadPoints();
  }, []);

  const handleCreatePoint = async (type) => {
    try {
      const token = localStorage.getItem('token');
      await api.post('/points', { type }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Ponto ${type} registrado!`);
      // Atualiza lista
      const res = await api.get('/points', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPoints(res.data);
    } catch (err) {
      toast.error('Erro ao registrar ponto');
    }
  };

  return (
    <div>
      <h2>Dashboard Estagiário</h2>
      <button onClick={() => handleCreatePoint('entrada')}>Bater Entrada</button>
      <button onClick={() => handleCreatePoint('saida')}>Bater Saída</button>
      <ul>
        {points.map((p) => (
          <li key={p.id}>{p.type} - {new Date(p.timestamp).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}
