import { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import './DashboardEstagiario.css';

export default function DashboardEstagiario() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const loadSummary = async (date = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await api.get(`/summary/${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data);
    } catch (err) {
      toast.error('Erro ao carregar resumo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleRegisterPoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const dateToSend = selectedDate ? new Date(selectedDate).toISOString() : null;

      await api.post(
        '/points/register',
        { date: dateToSend },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Ponto registrado com sucesso!');
      loadSummary(selectedDate);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao registrar ponto');
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    loadSummary(date);
  };

  const pontosHoje = summary?.points || [];
  const pontosRegistrados = pontosHoje.length;
  const isFuture = selectedDate && new Date(selectedDate) > new Date();
  const podeRegistrar = pontosRegistrados < 4 && !isFuture;

  return (
    <div className="estagiario-dashboard">
      <h2>Seu Ponto</h2>

      <button
        className="point-btn"
        onClick={handleRegisterPoint}
        disabled={!podeRegistrar}
      >
        Registrar Ponto
      </button>

      {!podeRegistrar && (
        <p style={{ color: 'red', marginTop: '10px' }}>
          Não é possível registrar: já completou os 4 pontos ou data inválida (futura).
        </p>
      )}

      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        className="date-input"
      />

      {loading ? (
        <p>Carregando...</p>
      ) : summary ? (
        <div className="summary-card">
          <p><strong>Data:</strong> {summary.date}</p>
          <p><strong>Total Trabalhado:</strong> {summary.totalHours} horas</p>
          <p>
            <strong>Status:</strong> {summary.isComplete ? 'Cumprido ✅' : 'Incompleto ⚠️'}
          </p>
          <h4>Detalhes do Dia</h4>
          {summary.points.map((point) => (
            <p key={point.id}>
              {point.type} - {new Date(point.timestamp).toLocaleString()}
            </p>
          ))}
        </div>
      ) : (
        <p>Sem registros para esta data.</p>
      )}
    </div>
  );
}
