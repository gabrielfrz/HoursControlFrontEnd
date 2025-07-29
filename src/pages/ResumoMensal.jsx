import React, { useEffect, useState } from 'react';
import api from '../api';
import './ResumoMensal.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
  import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

function formatHorasMinutos(decimal) {
  const horas = Math.floor(decimal);
  const minutos = Math.round((decimal - horas) * 60);
  return `${horas}h ${minutos}min`;
}

export default function ResumoMensal() {
  const now = new Date();
  const navigate = useNavigate();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [monthData, setMonthData] = useState([]);
  const [expectedHours, setExpectedHours] = useState(0);
  const [actualWorked, setActualWorked] = useState(0);
  const [bancoHoras, setBancoHoras] = useState(0);

  // Buscar dados do mês selecionado
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

  // Atualizar exceção (feriado/folga)
  const handleExceptionChange = async (date, type) => {
    try {
      const token = localStorage.getItem('token');
      await api.post('/points/set-exception', { date, type }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Exceção atualizada');
      fetchMonthSummary();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao atualizar exceção');
    }
  };



// Exportar resumo mensal em PDF
const exportarPdf = () => {
  const doc = new jsPDF();
  const nomeMes = new Date(0, month - 1).toLocaleString('pt-BR', { month: 'long' });
  const userName = localStorage.getItem('userName') || 'Usuário'; // ← pega nome salvo

  const titulo = `Resumo Mensal - ${nomeMes} / ${year}`;
  doc.setFontSize(16);
  doc.text(titulo, 14, 20);

  
  doc.setFontSize(12);
  doc.text(`Gerado por: ${userName}`, 14, 28);

  const tableData = monthData.map(({ date, hours, exceptionType }) => {
    const dataFormatada = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
    const status = hours >= 6 ? 'OK' : 'X';
    const excecao = exceptionType === 'feriado' ? 'Feriado' : exceptionType === 'folga' ? 'Folga' : '';
    return [dataFormatada, formatHorasMinutos(hours || 0), status, excecao];
  });

  autoTable(doc, {
    startY: 35,
    head: [['Data', 'Horas Trabalhadas', 'Status', 'Exceção']],
    body: tableData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [14, 45, 100] },
  });

  const posFinal = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Total Trabalhado: ${formatHorasMinutos(actualWorked)}`, 14, posFinal);
  doc.text(`Esperado: ${formatHorasMinutos(expectedHours)}`, 14, posFinal + 7);
  doc.text(`Banco de Horas: ${formatHorasMinutos(bancoHoras)}`, 14, posFinal + 14);


  doc.save(`resumo_${nomeMes}_${year}.pdf`);
};


  return (
    <div className="resumo-mensal">
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <button className="back-to-menu-btn" onClick={() => navigate('/menu')}>
          ← Voltar ao Menu
        </button>
        <button className="exportar-btn" onClick={exportarPdf}>
          Exportar PDF
        </button>
      </div>

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
                <td data-label="Data">
                  {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}
                </td>
                <td data-label="Horas Trabalhadas">
                  {formatHorasMinutos(hours || 0)}
                </td>
                <td data-label="Status" style={{ color: isComplete ? 'green' : 'red' }}>
                  {isComplete ? '✔️' : '❌'}
                </td>
                <td data-label="Exceção">
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
        <p><strong>Total Trabalhado:</strong> {formatHorasMinutos(actualWorked)}</p>
        <p><strong>Esperado:</strong> {formatHorasMinutos(expectedHours)}</p>
        <p><strong>Banco de Horas:</strong> {formatHorasMinutos(bancoHoras)}</p>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          Folgas consomem banco de horas. Feriados não contam como dia esperado.
        </p>
      </div>
    </div>
  );
}
