import React, { useEffect, useState } from 'react';
import api from '../api';
import './DashboardEstagiario.css';

export default function DashboardEstagiario() {
  const [points, setPoints] = useState([]);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    const fetchPoints = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      try {
        const res = await api.get(`/points/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPoints(res.data.points);
        setTotalHours(res.data.totalHours);
      } catch (error) {
        console.error('Erro ao buscar pontos:', error);
      }
    };

    fetchPoints();
  }, []);

  const handlePunch = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    try {
      await api.post('/points/add', { userId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
    } catch (error) {
      console.error('Erro ao bater ponto:', error);
    }
  };

  return (
    <div className="dashboard-estagiario-container">
      <h2>Bem-vindo, Estagiário!</h2>
      <p>Total de horas trabalhadas: <strong>{totalHours}h</strong></p>
      <button onClick={handlePunch}>Bater Ponto</button>

      <h3>Histórico de Pontos</h3>
      <ul>
        {points.map((p) => (
          <li key={p.id}>
            {p.date} - {p.type}
          </li>
        ))}
      </ul>
    </div>
  );
}
