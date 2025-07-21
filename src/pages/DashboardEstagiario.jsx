import { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import './DashboardEstagiario.css';

export default function DashboardEstagiario() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [editingPointId, setEditingPointId] = useState(null);
  const [editedTimestamp, setEditedTimestamp] = useState('');

  const loadSummary = async (date = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await api.get(`/points/summary/${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao carregar resumo');
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
      const dateToSend = selectedDate || null;

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

  const handleDeleteDay = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/points/delete-day/${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Todos os pontos do dia foram apagados.");
      loadSummary(selectedDate);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erro ao apagar pontos do dia.");
    }
  };

  const handleDeletePoint = async (pointId) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/points/delete/${pointId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Ponto excluído!");
      loadSummary(selectedDate);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erro ao excluir ponto.");
    }
  };

  const handleEditClick = (id, originalTimestamp) => {
    setEditingPointId(id);
    const localISOString = new Date(originalTimestamp).toISOString().slice(0, 16); // horário UTC
    setEditedTimestamp(localISOString);
  };

  const handleSaveEdit = async (pointId) => {
    try {
      const token = localStorage.getItem('token');
      const correctedTimestamp = new Date(editedTimestamp).toISOString(); // conversão correta para UTC

      await api.put(
        `/points/edit/${pointId}`,
        { timestamp: correctedTimestamp },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Horário atualizado!");
      setEditingPointId(null);
      loadSummary(selectedDate);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erro ao atualizar horário.");
    }
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

      <button
        className="delete-day-btn"
        onClick={handleDeleteDay}
        style={{ marginTop: '10px' }}
      >
        Apagar todos os pontos do dia
      </button>

      {loading ? (
        <p>Carregando...</p>
      ) : summary ? (
        <div className="summary-card">
          <p><strong>Data:</strong> {selectedDate}</p>
          <p><strong>Total Trabalhado:</strong> {summary.totalHours} horas</p>
          <p>
            <strong>Status:</strong> {summary.message}
          </p>
          <h4>Detalhes do Dia</h4>
          {summary.points.map((point) => {
            const localHora = new Date(point.timestamp)
              .toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })
              .replace(',', ' -');

            return (
              <div key={point.id}>
                {point.type} -{" "}
                {editingPointId === point.id ? (
                  <>
                    <input
                      type="datetime-local"
                      value={editedTimestamp}
                      onChange={(e) => setEditedTimestamp(e.target.value)}
                    />
                    <button onClick={() => handleSaveEdit(point.id)}>Salvar</button>
                    <button onClick={() => setEditingPointId(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    {localHora}
                    <button onClick={() => handleEditClick(point.id, point.timestamp)} style={{ marginLeft: '10px' }}>
                      Editar
                    </button>
                    <button onClick={() => handleDeletePoint(point.id)} style={{ marginLeft: '10px' }}>
                      Excluir
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p>Sem registros para esta data.</p>
      )}
    </div>
  );
}
