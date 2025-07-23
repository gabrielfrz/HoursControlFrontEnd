import React, { useEffect, useState } from 'react';
import api from '../api';
import './ResumoMensal.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function ResumoMensal() {
  const now = new Date();
  const navigate = useNavigate();

  const [month, setMonth] = useState(now.getMonth() + 1); // 1–12
  const [year, setYear] = useState(now.getFullYear());
  const [monthData, setMonthData] = useState([]);
  const [excludedDays, setExcludedDays] = useState({});
  const contractPerDay = 6;

  const fetchMonthSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/points/month-summary/${year}/${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // res.data.days contém os dias individuais
      if (res.data?.days) {
        setMonthData(res.data.days);
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

  const toggleExclude = (date) => {
    setExcludedDays((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const getTotalValidHours = () => {
    return monthData.reduce((total, item) => {
      const isWeekend = [0, 6].includes(new Date(item.date).getDay());
      const isExcluded = excludedDays[item.date];
      if (!isWeekend && !isExcluded) {
        return total + parseFloat(item.hours || 0);
      }
      return total;
    }, 0).toFixed(2);
  };

  const getWorkingDays = () => {
    return monthData.filter((item) => {
      const day = new Date(item.date).getDay();
      return ![0, 6].includes(day) && !excludedDays[item.date];
    }).length;
  };

  const getBancoHoras = () => {
    const totalHoras = parseFloat(getTotalValidHours());
    const esperado = getWorkingDays() * contractPerDay;
    return (totalHoras - esperado).toFixed(2);
  };

  const resetExclusions = () => {
    setExcludedDays({});
  };

  const handleMonthChange = (direction) => {
    let newMonth = month + direction;
    let newYear = year;

    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }

    setMonth(newMonth);
    setYear(newYear);
  };

  return (
    <div className="resumo-mensal" style={{ fontFamily: "'Roboto Slab', serif" }}>
      <button className="back-to-menu-btn" onClick={() => navigate('/menu')}>
        ← Voltar ao Menu
      </button>

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
    {[2023, 2024, 2025, 2026, 2027].map((y) => (
      <option key={y} value={y}>{y}</option>
    ))}
  </select>
</h2>

      <button onClick={resetExclusions} className="reset-btn">
        Limpar Feriados/Folgas
      </button>

      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Horas Trabalhadas</th>
            <th>Status</th>
            <th>Feriado/Folga</th>
          </tr>
        </thead>
        <tbody>
          {monthData.map(({ date, hours }) => {
            const isComplete = hours >= contractPerDay;
            return (
              <tr key={date}>
                <td>{new Date(date).toLocaleDateString('pt-BR')}</td>
                <td>{hours?.toFixed(2)} h</td>
                <td style={{ color: isComplete ? 'green' : 'red' }}>
                  {isComplete ? '✔️' : '❌'}
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={excludedDays[date] || false}
                    onChange={() => toggleExclude(date)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="total-mensal">
        <p><strong>Total Válido:</strong> {getTotalValidHours()} horas</p>
        <p><strong>Banco de Horas:</strong> {getBancoHoras()} horas</p>
      </div>
    </div>
  );
}
