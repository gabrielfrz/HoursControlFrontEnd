import React, { useEffect, useState } from 'react';
import api from '../api';
import './ResumoMensal.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function ResumoMensal() {
  const now = new Date();
  const navigate = useNavigate();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [monthData, setMonthData] = useState([]);
  const [expectedHours, setExpectedHours] = useState(0);
  const [actualWorked, setActualWorked] = useState(0);
  const [bancoHoras, setBancoHoras] = useState(0);

  const fetchMonthSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/points/month-summary/${year}/${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.days) {
        setMonthData(res.data.days);
        setExpectedHours(res.data.expectedHours || 0);
        setActualWorked(res.data.actualWorked || 0);
        setBancoHoras(res.data.bancoHoras || 0);
      } else {
        setMonthData([]);
        toast.warn('Nenhum dado encontrado para esse mês.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao buscar resumo mensal');
    }
  };

  useEffect(() => {
    fetchMonthSummary();
  }, [year, month]);

  const handleExceptionChange = async (date, type) => {
    try {
      const token = localStorage.getItem('token');
      await api.post('/points/set-exception', { date, type }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Exceção atualizada');
      fetchMonthSummary(); // refaz o cálculo
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao atualizar exceção');
    }
  };

  const resetExceptions = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/points/reset-exceptions/${year}/${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Exceções limpas');
      fetchMonthSummary();
    } catch (err) {
      toast.error('Erro ao limpar exceções');
    }
  };

  return (
    <div className="resumo-mensal">
      <button className="back-to-menu-btn" onClick={() => navigate('/menu')}>← Voltar ao Menu</button>

      <h2>
        Resumo Mensal -&nbsp;
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
            </option>
          ))}
        </select>
        &nbsp;/&nbsp;
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </h2>

      <button onClick={resetExceptions} className="reset-btn">
        Limpar Feriados/Folgas
      </button>

      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Horas Trabalhadas</th>
            <th>Status</th>
            <th>Exceção</th>
          </tr>
        </thead>
        <tbody>
          {monthData.map(({ date, hours, isWeekend, exceptionType }) => {
            const isComplete = hours >= 6;

            return (
              <tr
                key={date}
                className={
                  exceptionType === 'feriado'
                    ? 'exception-feriado'
                    : exceptionType === 'folga'
                    ? 'exception-folga'
                    : ''
                }
              >
                <td>{new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                <td>{hours?.toFixed(2) || '0.00'} h</td>
                <td style={{ color: isComplete ? 'green' : 'red' }}>
                  {isComplete ? '✔️' : '❌'}
                </td>
                <td>
                  <select
                    value={exceptionType || ''}
                    onChange={(e) => handleExceptionChange(date, e.target.value)}
                    disabled={isWeekend}
                  >
                    <option value="">Nenhuma</option>
                    <option value="feriado">Feriado</option>
                    <option value="folga">Folga</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="total-mensal">
        <p><strong>Total Trabalhado:</strong> {actualWorked} horas</p>
        <p><strong>Esperado:</strong> {expectedHours} horas</p>
        <p><strong>Banco de Horas:</strong> {bancoHoras} horas</p>
      </div>
    </div>
  );
}
