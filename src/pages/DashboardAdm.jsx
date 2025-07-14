import React, { useEffect, useState } from 'react';
import api from '../api';
import './DashboardAdm.css';

export default function DashboardAdm() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');

      try {
        const res = await api.get('/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="dashboard-adm-container">
      <h2>Dashboard Técnico (ADM)</h2>

      {/* Se quiser adicionar o formulário de cadastro de estagiário aqui depois, pode usar */}
      {/* <form>...</form> */}

      <h3>Lista de Usuários</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.name}</strong> — {user.email}
            {/* Botões de ações futuros */}
            {/* <button onClick={() => handleDelete(user.id)}>Deletar</button> */}
            <button onClick={() => window.location.href = `/history/${user.id}`}>Ver Histórico</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
