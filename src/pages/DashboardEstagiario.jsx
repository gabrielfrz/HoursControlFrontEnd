import { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import './DashboardEstagiario.css';
import { useNavigate } from 'react-router-dom'; 
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ptBR from 'date-fns/locale/pt-BR';
registerLocale('pt-BR', ptBR);

export default function DashboardEstagiario() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [editingPointId, setEditingPointId] = useState(null);
  const [editedTimestamp, setEditedTimestamp] = useState('');
  const navigate = useNavigate();

  // Garantir consistência de fuso horário ao formatar para YYYY-MM-DD
  const formatToYYYYMMDD = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Converter string "YYYY-MM-DD" para objeto Date local
  const getLocalDateFromYYYYMMDD = (str) => {
    const [year, month, day] = str.split('-').map(Number);
    return new Date(year, month - 1, day, 12); // 12h para evitar fuso UTC
  };

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
    const today = new Date();
    today.setHours(12, 0, 0, 0); // evitar UTC-3 de madrugada
    const formatted = formatToYYYYMMDD(today);
    setSelectedDate(formatted);
    loadSummary(formatted);
  }, []);

const handleRegisterPoint = async () => {
  try {
    const token = localStorage.getItem('token');

    // Confirma validade da data no formato YYYY-MM-DD
    const localDate = new Date(`${selectedDate}T12:00:00`);

    if (isNaN(localDate.getTime())) {
      toast.error('Data inválida selecionada!');
      return;
    }

    await api.post(
      '/points/register',
      { date: selectedDate }, // <-- Aqui está a correção
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success('Ponto registrado com sucesso!');
    loadSummary(selectedDate);
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erro ao registrar ponto');
  }
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
const isFuture = (() => {
  if (!selectedDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // zera horário

  const [year, month, day] = selectedDate.split('-').map(Number);
  const selected = new Date(year, month - 1, day);
  selected.setHours(0, 0, 0, 0);

  return selected > today;
})();

// ✅ Removido o limite de 4 pontos
const podeRegistrar = !isFuture;

return (
  <div className="estagiario-dashboard">
    <button className="back-dashboard-btn" onClick={() => navigate('/menu')}>
      ← Voltar ao Menu
    </button>

    <button className="resumo-mensal-btn" onClick={() => navigate('/resumo-mensal')}>
      📊 Ver Resumo Mensal
    </button>

    <h2>Seu Ponto</h2>

    <button
      className="point-btn"
      onClick={handleRegisterPoint}
      disabled={!podeRegistrar}
    >
      ➕ Registrar Ponto
    </button>

    {/* ✅ Informações claras ao usuário */}
    <p style={{ marginTop: '10px' }}>
      Você registrou <strong>{pontosRegistrados}</strong> ponto(s) neste dia.
    </p>

    {/* ✅ Alerta se número de pontos for ímpar */}
    {pontosRegistrados % 2 !== 0 && (
      <p style={{ color: 'orange', marginTop: '8px' }}>
        ⚠️ Você tem um número ímpar de pontos. A última batida ainda não possui par correspondente.
      </p>
    )}

    {!podeRegistrar && (
      <p style={{ color: 'red', marginTop: '10px' }}>
        Não é possível registrar pontos em datas futuras.
      </p>
    )}

    {/* ... (continua tudo igual abaixo) */}

    <div style={{ marginTop: '15px' }}>
      <label><strong>Selecionar Data:</strong></label>
      <DatePicker
        selected={selectedDate ? getLocalDateFromYYYYMMDD(selectedDate) : null}
        onChange={(date) => {
          const dateAtMidday = new Date(date);
          dateAtMidday.setHours(12, 0, 0, 0);
          const formatted = formatToYYYYMMDD(dateAtMidday);
          setSelectedDate(formatted);
          loadSummary(formatted);
        }}
        locale="pt-BR"
        dateFormat="dd/MM/yyyy"
        className="date-input"
        withPortal
        showPopperArrow={false}
      />
    </div>

    <button
      className="delete-day-btn"
      onClick={handleDeleteDay}
      style={{ marginTop: '10px' }}
    >
      🗑️ Apagar todos os pontos do dia
    </button>

    {loading ? (
      <p>Carregando...</p>
    ) : summary ? (
      <div className="summary-card">
        <p>
          <strong>Total Trabalhado:</strong> {Number(summary.totalHours || 0).toFixed(2)} horas
        </p>
        <p>
          <strong>Status:</strong>{' '}
          <span style={{ color: getStatusColor(summary.totalHours), fontWeight: 600 }}>
            {getStatusMessage(summary.totalHours)}
          </span>
        </p>

        <h4>Detalhes do Dia</h4>

        {summary.points.map((point, index) => {
          const isUnpaired = index === summary.points.length - 1 && summary.points.length % 2 !== 0;
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
            <div
              key={point.id}
              className="point-item"
              style={{ background: isUnpaired ? '#fff7e6' : 'inherit' }}
            >
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

        {/* ✅ Dica de boas práticas */}
        <div style={{
          marginTop: '20px',
          padding: '10px',
          background: '#f5f5f5',
          borderRadius: '8px',
          fontSize: '0.95rem'
        }}>
          <strong>Dica:</strong> registre seus pontos sempre em pares (entrada/saída, retorno/saída)
          para que o sistema calcule suas horas corretamente.
        </div>
      </div>
    ) : (
      <p>Sem registros para esta data.</p>
    )}

    <div className="senha-footer-container">
      <button
        className="senha-footer-btn"
        onClick={() => navigate('/alterar-senha')}
      >
        🔒 Alterar Senha
      </button>
    </div>
  </div>
);
}