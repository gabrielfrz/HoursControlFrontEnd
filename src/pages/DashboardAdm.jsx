import React, { useEffect, useState } from 'react';
import api from '../api';
import './DashboardAdm.css';
import { toast } from 'react-toastify';

export default function DashboardAdm() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');

      try {
        const res = await api.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (error) {
        const msg = error.response?.data?.message || 'Erro ao buscar usuários';
        console.error(msg);
        toast.error(msg);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="dashboard-adm-container">
      <h2>Dashboard Técnico (ADM)</h2>

      <h3>Lista de Usuários</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.name}</strong> — {user.email}
            <button onClick={() => window.location.href = `/history/${user.id}`}>
              Ver Histórico
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
