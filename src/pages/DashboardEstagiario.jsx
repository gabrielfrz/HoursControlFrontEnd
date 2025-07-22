import { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import './DashboardEstagiario.css';
import { useNavigate } from 'react-router-dom'; // no topo do arquivo
export default function DashboardEstagiario() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [editingPointId, setEditingPointId] = useState(null);
  const [editedTimestamp, setEditedTimestamp] = useState('');
  const navigate = useNavigate();
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
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    loadSummary(today);
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
    const localISOString = new Date(originalTimestamp).toISOString().slice(0, 16);
    setEditedTimestamp(localISOString);
  };

  const handleSaveEdit = async (pointId) => {
    try {
      const token = localStorage.getItem('token');
      const correctedTimestamp = new Date(editedTimestamp).toISOString();

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

  const getStatusColor = (hours) => {
    if (hours < 6) return 'red';
    if (hours > 6) return 'green';
    return 'black';
  };

  const getStatusMessage = (hours) => {
    if (hours < 6) return 'Abaixo da meta';
    if (hours > 6) return 'Meta atingida ou extra';
    return 'Meta exata';
  };

  const pontosHoje = summary?.points || [];
  const pontosRegistrados = pontosHoje.length;
  const isFuture = selectedDate && new Date(selectedDate) > new Date();
  const podeRegistrar = pontosRegistrados < 4 && !isFuture;

  

  return (
    <div className="estagiario-dashboard">
      <button className="back-dashboard-btn" onClick={() => navigate('/menu')}>
        ← Voltar ao Menu
      </button>

      
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
          <p>
            <strong>Data:</strong>{' '}
            {summary.date
              ? summary.date.split('T')[0].split('-').reverse().join('/')
              : selectedDate.split('-').reverse().join('/')}
          </p>

          <p>
            <strong>Total Trabalhado:</strong>{' '}
            {Number(summary.totalHours || 0).toFixed(2)} horas
          </p>

          <p>
            <strong>Status:</strong>{' '}
            <span style={{ color: getStatusColor(summary.totalHours), fontWeight: 600 }}>
              {getStatusMessage(summary.totalHours)}
            </span>
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
              <div key={point.id} className="point-item">
                <div className="point-row">
                  <span className="point-label">{point.type.replace('_', ' ')}</span>
                  <span className="point-timestamp">{localHora}</span>
                </div>

                <div className="point-actions">
                  {editingPointId === point.id ? (
                    <>
                      <input
                        type="datetime-local"
                        value={editedTimestamp}
                        onChange={(e) => setEditedTimestamp(e.target.value)}
                        className="edit-input"
                      />
                      <button
                        className="save-btn action-btn"
                        onClick={() => handleSaveEdit(point.id)}
                      >
                        Salvar
                      </button>
                      <button
                        className="cancel-btn action-btn"
                        onClick={() => setEditingPointId(null)}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(point.id, point.timestamp)}>
                        Editar
                      </button>
                      <button onClick={() => handleDeletePoint(point.id)}>
                        Excluir
                      </button>
                    </>
                  )}
                </div>
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
